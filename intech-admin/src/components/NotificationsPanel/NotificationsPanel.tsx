import { useEffect, useState } from 'react';
import { Bell, RefreshCw, X } from 'lucide-react';
import { apiRequest } from '../../config/api';
import { pagePermission } from '../../config/navigation';
import { hasPermission } from '../../lib/access';
import type { AdminUser, NotificationItem, PageName } from '../../types';
interface NotificationsPanelProps { base: string; token: string; user: AdminUser; onClose: () => void; onNavigate: (page: PageName) => void }
export function NotificationsPanel({ base, token, user, onClose, onNavigate }: NotificationsPanelProps) {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  async function refresh() {
    setLoading(true); setError('');
    try { const result = await apiRequest<{ notifications?: NotificationItem[]; unread_count?: number }>(base, token, '/admin/notifications'); setItems(result.notifications || []); setUnreadCount(result.unread_count ?? (result.notifications || []).filter(item => !item.is_read).length); }
    catch (err) { setError(err instanceof Error ? err.message : String(err)); } finally { setLoading(false); }
  }
  async function markOneRead(item: NotificationItem) {
    if (!item.is_read) {
      try {
        await apiRequest(base, token, `/admin/notifications/${item.id}/read`, { method: 'POST' });
        setItems(current => current.map(notification => notification.id === item.id ? { ...notification, is_read: true } : notification));
        setUnreadCount(count => Math.max(0, count - 1));
      } catch (err) { setError(err instanceof Error ? err.message : String(err)); return; }
    }
    const routes: Record<string, PageName> = { new_request: 'Demandes', urgent_unassigned: 'Assignation', new_client: 'Clients', new_technician: 'Techniciens', package_purchase: 'Demandes forfaits', shop_order: 'Commandes' };
    const route = item.type ? routes[item.type] : undefined;
    if (route && hasPermission(user, pagePermission[route])) onNavigate(route);
  }
  async function markAllRead() {
    try {
      await apiRequest(base, token, '/admin/notifications/read-all', { method: 'POST' });
      setItems(current => current.map(item => ({ ...item, is_read: true })));
      setUnreadCount(0);
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
  }
  useEffect(() => { refresh(); }, [base, token]);
  return <div className="notification-layer"><button className="notification-backdrop" onClick={onClose} aria-label="Fermer les notifications" /><section className="notification-panel" aria-label="Notifications"><div className="notification-head"><div><h2>Notifications</h2><p>{unreadCount ? `${unreadCount} non lue${unreadCount > 1 ? 's' : ''}` : 'Tout est à jour'}</p></div><div><button className="notification-refresh" aria-label="Actualiser" onClick={refresh}><RefreshCw size={15} /></button><button className="notification-refresh" aria-label="Fermer" onClick={onClose}><X size={17} /></button></div></div>{unreadCount > 0 && <button className="mark-all-read" onClick={markAllRead}>Tout marquer comme lu</button>}{error && <div className="notification-error" role="alert">{error}</div>}<div className="notification-list">{loading ? <div className="notification-empty"><RefreshCw size={17} className="spin" />Chargement des notifications…</div> : items.length ? items.map(item => <button className={`notification-item ${item.is_read ? 'is-read' : 'is-unread'}`} key={item.id} onClick={() => markOneRead(item)}><span className="notification-icon"><Bell size={15} /></span><span className="notification-copy"><b>{item.title || 'Notification InTech'}</b><span>{item.body || '—'}</span><small>{item.created_at ? new Date(item.created_at).toLocaleString('fr-DZ', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Africa/Algiers' }) : ''}</small></span>{!item.is_read && <i className="notification-unread-dot" />}</button>) : <div className="notification-empty"><Bell size={19} /><b>Aucune notification</b><span>Les nouvelles demandes et événements apparaîtront ici.</span></div>}</div><div className="notification-foot">Source : API InTech · /admin/notifications</div></section></div>;
}
