import { ServerLog } from '@/types/server-log';

export interface ConsoleCommand {
  id: number;
  site_id: number;
  server_id: number;
  user_id: number;
  user: string | null;
  command: string;
  server_log_id: number | null;
  log: ServerLog | null;
  status: string;
  status_color: 'gray' | 'success' | 'info' | 'warning' | 'danger';
  created_at: string;
  updated_at: string;

  [key: string]: unknown;
}
