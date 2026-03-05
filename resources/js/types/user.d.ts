import { Project } from '@/types/project';

export type AdminPermission = 'dashboard' | 'users' | 'servers' | 'sites' | 'credentials' | 'plugins' | 'settings';

export interface User {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  timezone: string;
  projects?: Project[];
  two_factor_enabled: boolean;
  is_admin: boolean;
  is_super_admin: boolean;
  admin_permissions: AdminPermission[];
  [key: string]: unknown;
}
