import type { ReactNode } from 'react';
const tones = { 'Non assignée': 'amber', 'En attente': 'blue', 'Finalisation': 'violet', 'Terminée': 'green', 'Actif': 'green', 'Activé': 'green', 'À configurer': 'amber', 'Recommandé': 'violet' };
export function Status({ children }: { children: ReactNode }) {
  const key = typeof children === 'string' ? children : '';
  return <span className={`status ${tones[key as keyof typeof tones] || 'neutral'}`}><i />{children}</span>;
}
