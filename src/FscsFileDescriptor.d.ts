declare interface FscsFileDescriptor {
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
