import { User, Receipt, Gauge, FileCheck2, CircleDollarSign } from 'lucide-react';
import type { NavItem } from '@/components/admin/nav-items';

export const USER_NAV_ITEMS: NavItem[] = [
  { label: 'Mi perfil', href: '/mi-perfil', icon: User },
  { label: 'Mis ventas', href: '/mis-ventas', icon: Receipt },
  { label: 'Mi score', href: '/mi-score', icon: Gauge },
  { label: 'Solicitar crédito', href: '/solicitar-credito', icon: FileCheck2 },
  { label: 'Mis créditos', href: '/mis-creditos', icon: CircleDollarSign },
];
