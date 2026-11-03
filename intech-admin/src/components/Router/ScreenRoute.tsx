import { Navigate, useOutletContext } from 'react-router-dom';
import { Administrators } from '../../pages/Administrators';
import { Assignments } from '../../pages/Assignments';
import { Brands } from '../../pages/Brands';
import { Categories } from '../../pages/Categories';
import { Clients } from '../../pages/Clients';
import { Devices } from '../../pages/Devices';
import { DiagnosticDomains } from '../../pages/DiagnosticDomains';
import { Orders } from '../../pages/Orders';
import { Dashboard } from '../../pages/Dashboard';
import { PackageRequests } from '../../pages/PackageRequests';
import { Packages } from '../../pages/Packages';
import { PartnerShops } from '../../pages/PartnerShops';
import { Prestations } from '../../pages/Prestations';
import { Products } from '../../pages/Products';
import { PromoCodes } from '../../pages/PromoCodes';
import { Profile } from '../../pages/Profile';
import { ReplacementParts } from '../../pages/ReplacementParts';
import { Requests } from '../../pages/Requests';
import { Settings } from '../../pages/Settings';
import { Technicians } from '../../pages/Technicians';
import { WilayaPrices } from '../../pages/WilayaPrices';
import type { ScreenOutletContext } from '../Layout';
import type { PageName } from '../../types';
import { hasPermission } from '../../lib/access';
import { pagePermission } from '../../config/navigation';

export function ScreenRoute({ page }: { page: PageName }) {
  const props = useOutletContext<ScreenOutletContext>();
  if (!hasPermission(props.user, pagePermission[page])) return <Navigate to="/" replace />;
  switch (page) {
    case 'Vue d’ensemble': return <Dashboard {...props} />;
    case 'Demandes': return <Requests {...props} />;
    case 'Assignation': return <Assignments {...props} />;
    case 'Clients': return <Clients {...props} />;
    case 'Techniciens': return <Technicians {...props} />;
    case 'Prestations': return <Prestations {...props} />;
    case 'Domaines de diagnostic': return <DiagnosticDomains {...props} />;
    case 'Appareils': return <Devices {...props} />;
    case 'Forfaits': return <Packages {...props} />;
    case 'Demandes forfaits': return <PackageRequests {...props} />;
    case 'Prix par wilaya': return <WilayaPrices {...props} />;
    case 'Catégories': return <Categories {...props} />;
    case 'Marques': return <Brands {...props} />;
    case 'Produits': return <Products {...props} />;
    case 'Commandes': return <Orders {...props} />;
    case 'Pièces de rechange': return <ReplacementParts {...props} />;
    case 'Magasins partenaires': return <PartnerShops {...props} />;
    case 'Codes promo': return <PromoCodes {...props} />;
    case 'Réglages': return <Settings {...props} />;
    case 'Administrateurs': return <Administrators {...props} />;
    case 'Mon profil': return <Profile {...props} />;
  }
}
