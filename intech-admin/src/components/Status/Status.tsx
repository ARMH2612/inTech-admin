import type { ReactNode } from 'react';
const labels: Record<string, string> = {
  Pending: 'En attente', 'Technician Assigned': 'Technicien assigné', 'On Way': 'En route', Arrived: 'Arrivé',
  'Diagnostic Report': 'Diagnostic en cours', 'Waiting Confirmation': 'Validation client attendue', 'Offer Rejected': 'Proposition refusée',
  'Waiting Start Reparation': 'Réparation à démarrer', 'Waiting Location Confirmation': 'Confirmation du lieu attendue',
  'Waiting Prestation Confirmation': 'Validation du prix attendue', 'Final Price Rejected': 'Prix final refusé',
  'Waiting for technician to mark it complete': 'Finalisation technicien', Completed: 'Terminée', Cancelled: 'Annulée',
  'Under Diagnostic': 'Diagnostic atelier', 'Waiting Client Confirmation': 'Validation client attendue', Ongoing: 'En cours',
  'Waiting Acceptance': 'Acceptation attendue', Accepted: 'Acceptée', 'In Repair': 'Réparation en cours', 'Ready For Pickup': 'Prête à récupérer',
  'Not Repairable': 'Non réparable', pending: 'En attente', confirmed: 'Confirmée', shipped: 'Expédiée', delivered: 'Livrée', cancelled: 'Annulée',
};
const tones: Record<string, string> = {
  'Non assignée': 'amber', 'En attente': 'amber', 'Invitation en attente': 'amber', 'Acceptation attendue': 'amber',
  'Technicien assigné': 'blue', 'En route': 'blue', 'Arrivé': 'blue', Confirmée: 'blue', Expédiée: 'blue',
  'Diagnostic en cours': 'violet', 'Diagnostic atelier': 'violet', 'Réparation en cours': 'violet', Ongoing: 'violet', 'Finalisation': 'violet',
  'Terminée': 'green', 'Actif': 'green', 'Activé': 'green', 'Acceptée': 'green', 'Livrée': 'green',
  'À configurer': 'amber', 'Recommandé': 'violet', 'Bloqué': 'red', 'Annulée': 'red', 'Proposition refusée': 'red', 'Prix final refusé': 'red', 'Non réparable': 'red', Inactif: 'neutral',
};
export function Status({ children }: { children: ReactNode }) {
  const raw = typeof children === 'string' ? children : '';
  const label = labels[raw] || raw;
  const tone = tones[label] || (/cancel|reject|blocked/i.test(raw) ? 'red' : /pending|waiting/i.test(raw) ? 'amber' : /complete|active|eligible|delivered/i.test(raw) ? 'green' : /diagnostic|repair|ongoing|progress/i.test(raw) ? 'violet' : 'neutral');
  return <span className={`status ${tone}`}><i />{label}</span>;
}
