export interface SalesImageStorage {
  upload(path: string, image: Blob, contentType: string): Promise<void>;
  /** Returns a map of storage path to a temporary signed URL. */
  createSignedUrls(paths: string[]): Promise<Record<string, string>>;
  remove(paths: string[]): Promise<void>;
}
