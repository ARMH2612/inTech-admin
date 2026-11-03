import { navGroups, bottomNav, pagePermission } from '../../config/navigation';
import { hasPermission } from '../../lib/access';
import type { AdminUser, PageName } from '../../types';
import appIcon from '../../assets/intech-app-icon.png';
interface SidebarProps { page: PageName; user: AdminUser; mobileOpen: boolean; onNavigate: (page: PageName) => void; onClose: () => void }
export function Sidebar({ page, user, mobileOpen, onNavigate, onClose }: SidebarProps) {
  return <>
    {mobileOpen && <button className="scrim" aria-label="Fermer le menu" onClick={onClose} />}
    <aside className={`sidebar ${mobileOpen ? 'is-open' : ''}`}>
      <button className="brand" onClick={() => onNavigate('Vue d’ensemble')} aria-label="InTech, accueil"><span className="brand-mark brand-image-mark"><img src={appIcon} alt="" /></span><span>InTech</span></button>
      <nav className="side-nav" aria-label="Navigation principale">{navGroups.map(group => <div className="nav-group" key={group.label}><p>{group.label}</p>{group.items.filter(([label]) => hasPermission(user, pagePermission[label])).map(([label, Icon]) => <button key={label} onClick={() => onNavigate(label)} className={page === label ? 'active' : ''}><Icon size={18} /><span>{label}</span></button>)}</div>)}</nav>
      <div className="side-bottom">{bottomNav.filter(([label]) => hasPermission(user, pagePermission[label])).map(([label, Icon]) => <button key={label} onClick={() => onNavigate(label)} className={`bottom-link ${page === label ? 'active' : ''}`}><Icon size={18} /><span>{label}</span></button>)}</div>
    </aside>
  </>;
}
