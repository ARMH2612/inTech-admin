import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ChevronDown, ChevronRight, LogOut, Menu, Search, UserRound } from 'lucide-react';
import { initials } from '../../lib/access';
import type { AdminUser, PageName } from '../../types';

interface TopbarProps {
  page: PageName;
  user: AdminUser;
  query: string;
  onQueryChange: (query: string) => void;
  onMenu: () => void;
  onNotifications: () => void;
  onLogout: () => void;
}

export function Topbar({ page, user, query, onQueryChange, onMenu, onNotifications, onLogout }: TopbarProps) {
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const displayName = [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Administrateur';

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (event.target instanceof Node && !accountRef.current?.contains(event.target)) setAccountOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setAccountOpen(false);
    }
    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  return (
    <header className="topbar">
      <div className="top-left">
        <button className="menu-button" aria-label="Ouvrir le menu" onClick={onMenu}><Menu size={21} /></button>
        <span className="crumb-root">InTech</span><ChevronRight className="crumb-chevron" size={14} /><b>{page}</b>
      </div>
      <div className="top-right">
        <label className="global-search"><Search size={16} /><input aria-label="Recherche rapide" placeholder="Rechercher…" value={query} onChange={event => onQueryChange(event.target.value)} /></label>
        <span className="top-divider" />
        <button className="icon-button bell-button" aria-label="Notifications" onClick={onNotifications}><Bell size={19} /></button>
        <span className="top-divider profile-divider" />
        <div className="top-account" ref={accountRef}>
          <button className="top-account-trigger" aria-label="Ouvrir le menu du compte" aria-haspopup="menu" aria-expanded={accountOpen} onClick={() => setAccountOpen(open => !open)}>
            <span className="top-avatar">{initials(user)}</span><ChevronDown size={14} />
          </button>
          {accountOpen && (
            <div className="top-account-menu" role="menu" aria-label="Menu du compte">
              <div className="top-account-identity"><span className="top-avatar">{initials(user)}</span><div><b>{displayName}</b><small>{user.email || user.admin_role || 'Administrateur'}</small></div></div>
              <div className="top-account-separator" />
              <button role="menuitem" onClick={() => { setAccountOpen(false); navigate('/profile'); }}><UserRound size={16} /><span>Mon profil</span></button>
              <button className="top-account-logout" role="menuitem" onClick={() => { setAccountOpen(false); onLogout(); }}><LogOut size={16} /><span>Déconnexion</span></button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
