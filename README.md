# fscs &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/elisherer/fscs/blob/master/LICENSE) [![npm version](https://img.shields.io/npm/v/fscs.svg?style=flat)](https://www.npmjs.com/package/fscs) ![Build and Test](https://github.com/elisherer/fscs/workflows/Build%20and%20Test/badge.svg) ![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

File System CRUD server

This "NPX ready" executable will serve any file system location as a web api supporting CRUD operations.
- **GET** - Get file or directory (directory can be retrieved in html as well as json form to be shown on the browser, based on Accept header)
- **POST** - Create a directory (recursive)
- **PUT** - Create a file or update
- **PATCH** - Rename (/ Move) a path (using a `"to"` query string)
- **DELETE** - Delete a file or directory (`"recursive"` (rm -rf) is optional)

## Usage

There are 2 options:
- Installing globally, using `npm i -g fscs`.
Then you can use `fscs` in any directory to start the server there.
- Running using `npx fscs` (This will run the application without actually installing it).

### `--help`
```
fscs [path]

Run the server

Options:
      --version   Show version number                                  [boolean]
  -p, --port      Port to listen on                     [number] [default: 8210]
  -h, --host      Host to listen on              [string] [default: "127.0.0.1"]
  -r, --readonly  Read only file system (allow only GET operations)
                                                      [boolean] [default: false]
  -v, --verbose   Verbose logging                     [boolean] [default: false]
  -f, --prefix    Path prefix (e.g. /some-route)          [string] [default: ""]
  -c, --cors      Whether to allow CORS                [boolean] [default: true]
  -u, --public    Toggle authorization requirement    [boolean] [default: false]
  -d, --hidden    Allow hidden files                  [boolean] [default: false]
  -t, --token     Specify a token for authentication (if not specified, a random
                  token will be generated)                              [string]
      --help      Show help                                            [boolean]
```

## Security

The default mode is using a token which is generated on each run, the server will expect this token to exist on every call as a bearer token (i.e. `Authorization: Bearer <token>`).

To disable that behavior, use the `--public` option (this will also allow to use the browser to navigate in the folders).

## Examples

### Read file

```bash
curl localhost:8210/some-dir/some-file.txt
curl localhost:8210/some-dir/some-file.txt?tail
curl localhost:8210/some-dir/some-file.txt?tail=20
```

Response is the file's content
- `Content-Type` will contain the MIME-Type as and if detected by [`mime`](https://github.com/broofa/mime).
- `Last-Modified` will hold the date of last modification time on file system.

**Query parameters**
-`tail` - If specified, only the last N lines will be returned (default is 10) (Only 'text/' and 'application/' mime-types are supported).

### Read directory

```bash
curl localhost:8210/some-dir
curl localhost:8210/some-dir -H "Accept: application/json"
```

* JSON response is an object containing a `result` which is `FscsFileDescriptor[]`: 
```typescript
interface FscsFileDescriptor {
  /** file / dir name */
  name: string;
  /** Whether is a directory */
  dir: boolean,
  /** Size of file in bytes */
  size: Number,
  /** Date in ISO format */
  mtime:  string;
  /** Mime type */
  mime: string;
}
```

### Create a directory

```bash
curl -X POST localhost:8210/some-dir/new-dir
curl -X POST localhost:8210/some-dir/non-existing-dir/nested-dir
```

* In both cases the dir will be created (recursive by default)

### Create or update a file

```bash
# Specify content in data
curl -X PUT localhost:8210/some-dir/new-file.txt -d "This is the content"
# Get data from file
curl -X PUT localhost:8210/some-dir/new-file.txt --data-binary @local-file.txt
# Get data from stdin
cat local-file.txt | curl -X PUT localhost:8210/some-dir/new-file.txt --data-binary @-
```

* If file exists it will be overwritten
* Directories will not be created in the process, if not exists it will fail.

### Rename (/ Move) a path

```bash
curl -X PATCH "localhost:8210/some-dir/some-file.txt?to=/some-dir/new-name.txt"
```

### Delete a file or directory

```bash
curl -X DELETE localhost:8210/some-dir/some-file.txt
curl -X DELETE localhost:8210/some-dir/some-nested-dir
curl -X DELETE "localhost:8210/some-dir?recursive"
```

## License

fscs is [MIT Licensed](https://github.com/elisherer/fscs/blob/master/LICENSE)
