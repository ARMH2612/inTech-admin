import { navGroups, bottomNav, pagePermission } from '../config/navigation';
import type { AdminUser, PageName } from '../types';

export function hasPermission(user: AdminUser | null | undefined, permission: string | undefined) {
  if (!permission || user?.admin_role === 'super_admin') return true;
  if (user?.admin_role === 'brand_owner') return permission === 'shop';
  return (user?.admin_permissions || []).includes(permission);
}

export function initialPageFor(user: AdminUser): PageName {
  return navGroups.flatMap(group => group.items).map(([label]) => label)
    .concat(bottomNav.map(([label]) => label))
    .find(label => hasPermission(user, pagePermission[label])) as PageName || 'Vue d’ensemble';
}

export function initials(user: AdminUser | null | undefined) {
  return `${user?.first_name?.[0] || 'A'}${user?.last_name?.[0] || 'D'}`.toUpperCase();
}
