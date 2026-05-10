import {
  LayoutDashboard,
  Users,
  FileCheck2,
  CircleDollarSign,
  Wallet,
  AlertTriangle,
  BarChart3,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  badgeKey?: 'pendingRequests';
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Usuarios', href: '/admin/users', icon: Users },
  { label: 'Solicitudes', href: '/admin/loan-requests', icon: FileCheck2, badgeKey: 'pendingRequests' },
  { label: 'Créditos Activos', href: '/admin/loans', icon: CircleDollarSign },
  { label: 'Pagos', href: '/admin/payments', icon: Wallet },
  { label: 'Mora', href: '/admin/defaulted', icon: AlertTriangle },
  { label: 'Reportes', href: '/admin/reports', icon: BarChart3 },
  { label: 'Auditoría', href: '/admin/audit', icon: ShieldCheck },
];
