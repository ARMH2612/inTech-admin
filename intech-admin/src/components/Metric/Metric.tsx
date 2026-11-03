import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
interface MetricProps { icon: LucideIcon; label: string; value: ReactNode; detail: string; tone: string }
export function Metric({ icon: Icon, label, value, detail, tone }: MetricProps) {
  return <article className="metric-card"><div className="metric-top"><span>{label}</span><i className={`metric-icon ${tone}`}><Icon size={18} /></i></div><b className="metric-value">{value}</b><span className="metric-detail">{detail}</span></article>;
}
