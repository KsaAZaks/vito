import { type BreadcrumbItem, type NavItem } from '@/types';
import { GlobeIcon, HardDriveIcon, KeyIcon, LayoutDashboardIcon, PlugIcon, UsersIcon } from 'lucide-react';
import { ReactNode } from 'react';
import Layout from '@/layouts/app/layout';
import VitoIcon from '@/icons/vito';
import { usePage } from '@inertiajs/react';
import { SharedData } from '@/types';
import { AdminPermission } from '@/types/user';

const allNavItems: (NavItem & { permission: AdminPermission })[] = [
  {
    title: 'Dashboard',
    href: route('admin.dashboard'),
    icon: LayoutDashboardIcon,
    permission: 'dashboard',
  },
  {
    title: 'Users',
    href: route('users'),
    icon: UsersIcon,
    permission: 'users',
  },
  {
    title: 'Servers',
    href: route('admin.servers'),
    icon: HardDriveIcon,
    permission: 'servers',
  },
  {
    title: 'Sites',
    href: route('admin.sites'),
    icon: GlobeIcon,
    permission: 'sites',
  },
  {
    title: 'Credentials',
    href: route('admin.credentials'),
    icon: KeyIcon,
    permission: 'credentials',
  },
  {
    title: 'Plugins',
    href: route('plugins'),
    icon: PlugIcon,
    permission: 'plugins',
  },
  {
    title: 'Vito Settings',
    href: route('vito-settings'),
    icon: VitoIcon,
    permission: 'settings',
  },
];

export default function AdminLayout({ children, breadcrumbs }: { children: ReactNode; breadcrumbs?: BreadcrumbItem[] }) {
  if (typeof window === 'undefined') {
    return null;
  }

  const page = usePage<SharedData>();
  const user = page.props.auth?.user;

  const sidebarNavItems: NavItem[] = allNavItems.filter((item) => {
    if (user?.is_super_admin) return true;
    return user?.admin_permissions?.includes(item.permission);
  });

  return (
    <Layout breadcrumbs={breadcrumbs} secondNavItems={sidebarNavItems} secondNavTitle="Admin">
      {children}
    </Layout>
  );
}
