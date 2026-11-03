import { AtSign, BadgeCheck, KeyRound, Mail, Phone, ShieldCheck, UserRound } from 'lucide-react';
import { initials } from '../../lib/access';
import type { ScreenPageProps } from '../../types/page';

const permissionLabels: Record<string, string> = {
  requests: 'Demandes', assignments: 'Assignations', clients: 'Clients', technicians: 'Techniciens',
  prestation_options: 'Prestations', diagnostic_domains: 'Domaines de diagnostic', device_products: 'Appareils',
  packages: 'Forfaits', wilaya_prices: 'Prix par wilaya', promo_codes: 'Codes promo',
  spare_parts_shops: 'Magasins partenaires', shop: 'Boutique', settings: 'Réglages', super_admin: 'Administration complète',
};

export function Profile({ user }: ScreenPageProps) {
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Administrateur';
  const isSuperAdmin = user.admin_role === 'super_admin';
  const permissions = isSuperAdmin ? [] : (user.admin_permissions || []).map(permission => permissionLabels[permission] || permission);

  return (
    <div className="profile-page">
      <section className="panel profile-identity-card">
        <span className="profile-avatar">{initials(user)}</span>
        <div className="profile-identity-copy"><span className="eyebrow">COMPTE ADMINISTRATEUR</span><h2>{name}</h2><p>{user.email || 'Adresse e-mail non renseignée'}</p></div>
        <span className="profile-role"><BadgeCheck size={15} />{user.admin_role || 'Administrateur'}</span>
      </section>

      <div className="profile-grid">
        <section className="panel profile-section">
          <div className="profile-section-title"><span className="profile-section-icon"><UserRound size={17} /></span><div><h3>Informations du compte</h3><p>Informations associées à votre accès InTech.</p></div></div>
          <div className="profile-detail"><span><UserRound size={15} />Nom complet</span><b>{name}</b></div>
          <div className="profile-detail"><span><Mail size={15} />E-mail</span><b>{user.email || '—'}</b></div>
          <div className="profile-detail"><span><Phone size={15} />Téléphone</span><b>{user.phone_number || '—'}</b></div>
          <div className="profile-detail"><span><AtSign size={15} />Rôle</span><b>{user.admin_role || 'Administrateur'}</b></div>
        </section>

        <section className="panel profile-section">
          <div className="profile-section-title"><span className="profile-section-icon"><ShieldCheck size={17} /></span><div><h3>Autorisations</h3><p>Les sections accessibles avec votre compte.</p></div></div>
          {isSuperAdmin ? <div className="profile-access-all"><ShieldCheck size={18} /><div><b>Accès administrateur complet</b><span>Votre rôle donne accès à toutes les sections du tableau de bord.</span></div></div> : permissions.length ? <div className="profile-permissions">{permissions.map(permission => <span key={permission}><BadgeCheck size={14} />{permission}</span>)}</div> : <p className="profile-no-permissions">Aucune autorisation supplémentaire n’est associée à ce compte.</p>}
          <div className="profile-security-note"><KeyRound size={15} /><span>La gestion du mot de passe et des données de compte n’est pas disponible depuis cette version.</span></div>
        </section>
      </div>
    </div>
  );
}
