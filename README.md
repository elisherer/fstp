# fstp &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/elisherer/fstp/blob/master/LICENSE) [![npm version](https://img.shields.io/npm/v/fstp.svg?style=flat)](https://www.npmjs.com/package/fstp) ![Build and Test](https://github.com/elisherer/fstp/workflows/Build%20and%20Test/badge.svg) ![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)

File System Transfer Protocol - File System CRUD server (over HTTP)

This "NPX ready" executable will serve any file system location as a web api supporting CRUD operations.
- **GET** - Get file or directory (directory can be retrieved in html as well as json form to be shown on the browser, based on Accept header)
- **POST** - Create a directory (recursive)
- **PUT** - Create a file or update
- **PATCH** - Rename (/ Move) a path (using a `"to"` query string)
- **DELETE** - Delete a file or directory (`"recursive"` (rm -rf) is optional)

## Usage

There are 2 options:
- Installing globally, using `npm i -g fstp`.
Then you can use `fstp` in any directory to start the server there.
- Running using `npx fstp` (This will run the application without actually installing it).

### `--help`
```
fstp [path]
    
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
      -a, --auth      Authentication scheme. For basic, provide --user with
                      username:password string. For bearer, either provide --token
                      or one will be generated randomly on startup.
                            [choices: "none", "bearer", "basic"] [default: "bearer"]
      -d, --hidden    Allow hidden files                  [boolean] [default: false]
      -t, --token     Specify a token for bearer authentication (if not specified, a
                      random token will be generated)                       [string]
      -u, --user      Specify a username and password for basic authentication (i.e.
                      alice:Passw0rd)                                       [string]
          --help      Show help                                            [boolean]
```

## Security

There are 3 types of authentication schemes: (set with `-a/--auth`)
- `none` - No authentication needed
- `basic` - Basic authentication (username and password). Specified with `-u/--user` as `<username>:<password>` string. `Authorization` header should have the format of `Basic <BASE64_ENCODED_USER_PASS>`.
- `bearer` [default] - A token. Specified with `-t/--token` or generated randomly on startup. `Authorization` header should have the format of `Bearer <TOKEN>`.

Using `none` or `basic` also allows to use a browser.

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

* JSON response is an object containing a `result` which is `FstpFileDescriptor[]`: 
```typescript
interface FstpFileDescriptor {
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

fstp is [MIT Licensed](https://github.com/elisherer/fstp/blob/master/LICENSE)
