export interface FileEntry {
  name: string;
  type: 'file' | 'directory' | 'link';
  permissions: string;
  owner: string;
  group: string;
  size: string;
  modified_at: string;
}
