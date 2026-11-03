import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Eye, MoreHorizontal, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { Status } from "../Status";
import type { ApiRow } from "../../types";

export interface TableColumn {
  key: keyof ApiRow | string;
  label: string;
  status?: boolean;
  pill?: boolean;
}

interface CustomTableProps {
  columns: TableColumn[];
  rows: ApiRow[];
  total?: number;
  onRefresh: () => void;
  onSelect?: (row: ApiRow) => void;
  rowClick?: boolean;
  loading?: boolean;
  error?: string;
  emptyMessage?: string;
  onCreate?: () => void;
  onEdit?: (row: ApiRow) => void;
  onDelete?: (row: ApiRow) => void;
  notice?: string;
  mutationError?: string;
  editLabel?: string;
  viewLabel?: string;
  rowActions?: (row: ApiRow) => ReactNode;
  canEdit?: (row: ApiRow) => boolean;
  canDelete?: (row: ApiRow) => boolean;
}

export function CustomTable({
  columns,
  rows,
  total,
  onRefresh,
  onSelect,
  rowClick = true,
  loading = false,
  error = "",
  emptyMessage = "Aucun élément trouvé.",
  onCreate,
  onEdit,
  onDelete,
  notice,
  mutationError,
  editLabel = 'Modifier',
  viewLabel = 'Voir les détails et le statut',
  rowActions,
  canEdit,
  canDelete,
}: CustomTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeMenu, setActiveMenu] = useState<string | number | null>(null);
  const activeMenuRef = useRef<HTMLDivElement>(null);
  const activeTriggerRef = useRef<HTMLButtonElement>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const visiblePage = Math.min(currentPage, pageCount);
  const startIndex = (visiblePage - 1) * pageSize;
  const pageRows = rows.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [rows]);

  useEffect(() => {
    if (activeMenu === null) return;
    const closeOutside = (event: PointerEvent) => {
      if (!activeMenuRef.current?.contains(event.target as Node) && !activeTriggerRef.current?.contains(event.target as Node)) setActiveMenu(null);
    };
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') setActiveMenu(null); };
    const closeOnScroll = () => setActiveMenu(null);
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('keydown', closeOnEscape);
    document.addEventListener('scroll', closeOnScroll, true);
    window.addEventListener('resize', closeOnScroll);
    return () => { document.removeEventListener('pointerdown', closeOutside); document.removeEventListener('keydown', closeOnEscape); document.removeEventListener('scroll', closeOnScroll, true); window.removeEventListener('resize', closeOnScroll); };
  }, [activeMenu]);

  if (loading)
    return (
      <div className="panel api-state">
        <RefreshCw className="spin" size={20} />
        <b>Chargement des données…</b>
        <span>Veuillez patienter</span>
      </div>
    );
  if (error)
    return (
      <div className="panel api-error-state">
        <h2>Impossible de charger cette section</h2>
        <p>{error}</p>
        <button className="button subtle" onClick={onRefresh}>
          <RefreshCw size={15} />
          Réessayer
        </button>
      </div>
    );
  return (
    <section className={`panel data-table-panel ${onSelect && rowClick ? 'is-row-clickable' : ''}`}>
      <div className="data-table-toolbar">
        <p>{total ?? rows.length} résultat(s)</p>
        <div className="data-table-actions">
          {onCreate && <button className="button primary" onClick={onCreate}><Plus size={15} />Ajouter</button>}
          <button className="button subtle" onClick={onRefresh}><RefreshCw size={15} />Actualiser</button>
        </div>
      </div>
      {notice && <div className="mutation-notice" role="status">{notice}</div>}
      {mutationError && <div className="api-error mutation-api-error" role="alert">{mutationError}</div>}
      {rows.length ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.key}>{column.label}</th>
                ))}
                {(onEdit || onDelete || rowActions) && <th className="table-row-actions-heading">ACTIONS</th>}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row, index) => {
                const rowKey = row._id ?? startIndex + index;
                const serviceLabels: Record<string, string> = { domicile: 'À domicile', ac: 'Climatisation', warranty: 'Garantie', workshop: 'Atelier', flexible: 'Flexible' };
                const customActions = rowActions?.(row);
                const canViewRow = Boolean(onSelect);
                const canEditRow = Boolean(onEdit && (!canEdit || canEdit(row)));
                const canDeleteRow = Boolean(onDelete && (!canDelete || canDelete(row)));
                const hasRowActions = canViewRow || canEditRow || canDeleteRow || Boolean(customActions);
                return (
                <tr
                  key={rowKey}
                  onClick={onSelect && rowClick ? () => onSelect(row) : undefined}
                >
                  {columns.map((column) => {
                    const value = row[column.key as keyof ApiRow];
                    return (
                      <td key={column.key}>
                        {column.status ? (
                          <Status>{String(value ?? "—")}</Status>
                        ) : column.pill ? (
                          <span className={`table-service-pill service-${String(value ?? '').toLowerCase().replace(/[^a-z]+/g, '-')}`}>{serviceLabels[String(value)] || String(value ?? '—')}</span>
                        ) : (
                          String(value ?? "—")
                        )}
                      </td>
                    );
                  })}
                  {hasRowActions && <td className="table-row-actions" onClick={event => event.stopPropagation()}>
                    <div className="table-action-menu-wrap">
                      <button type="button" ref={activeMenu === rowKey ? activeTriggerRef : null} className={`table-more-action ${activeMenu === rowKey ? 'is-open' : ''}`} aria-label="Ouvrir les actions" aria-haspopup="menu" aria-expanded={activeMenu === rowKey} title="Actions" onClick={event => {
                        if (activeMenu === rowKey) { setActiveMenu(null); return; }
                        const rect = event.currentTarget.getBoundingClientRect();
                        const above = window.innerHeight - rect.bottom < 200;
                        setMenuPosition({ top: Math.max(8, above ? rect.top - 175 : rect.bottom + 5), left: Math.max(8, Math.min(window.innerWidth - 190, rect.right - 178)) });
                        setActiveMenu(rowKey);
                      }}><MoreHorizontal size={18} /></button>
                      {activeMenu === rowKey && createPortal(<div ref={activeMenuRef} className="table-action-menu" style={{ top: menuPosition.top, left: menuPosition.left }} role="menu">
                        {canViewRow && <button type="button" role="menuitem" onClick={() => { setActiveMenu(null); onSelect?.(row); }}><Eye size={14} /><span>{viewLabel}</span></button>}
                        {canEditRow && <button type="button" role="menuitem" onClick={() => { setActiveMenu(null); onEdit?.(row); }}><Pencil size={14} /><span>{editLabel}</span></button>}
                        {canDeleteRow && <button type="button" role="menuitem" className="is-danger" onClick={() => { setActiveMenu(null); onDelete?.(row); }}><Trash2 size={14} /><span>Supprimer</span></button>}
                        {customActions && <div className="table-action-custom" onClick={event => { if ((event.target as HTMLElement).closest('button')) setActiveMenu(null); }}>{customActions}</div>}
                      </div>, document.body)}
                    </div>
                  </td>}
                </tr>
              );})}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="table-empty">{emptyMessage}</div>
      )}
      {rows.length > 0 && (
        <div className="table-pagination">
          <div className="pagination-summary">
            <span>Lignes par page</span>
            <select
              aria-label="Lignes par page"
              value={pageSize}
              onChange={event => { setPageSize(Number(event.target.value)); setCurrentPage(1); }}
            >
              {[10, 25, 50].map(size => <option key={size} value={size}>{size}</option>)}
            </select>
            <span className="pagination-range">
              {startIndex + 1}–{Math.min(startIndex + pageSize, rows.length)} sur {rows.length} chargés
              {total != null && total > rows.length ? ` · ${total} au total` : ''}
            </span>
          </div>
          <nav className="pagination-buttons" aria-label="Pagination du tableau">
            <button type="button" aria-label="Première page" disabled={visiblePage === 1} onClick={() => setCurrentPage(1)}><ChevronsLeft size={15} /></button>
            <button type="button" aria-label="Page précédente" disabled={visiblePage === 1} onClick={() => setCurrentPage(page => Math.max(1, page - 1))}><ChevronLeft size={15} /></button>
            <span>Page {visiblePage} / {pageCount}</span>
            <button type="button" aria-label="Page suivante" disabled={visiblePage >= pageCount} onClick={() => setCurrentPage(page => Math.min(pageCount, page + 1))}><ChevronRight size={15} /></button>
            <button type="button" aria-label="Dernière page" disabled={visiblePage >= pageCount} onClick={() => setCurrentPage(pageCount)}><ChevronsRight size={15} /></button>
          </nav>
        </div>
      )}
      <div className="readonly-foot">
        {onCreate || onEdit || onDelete || rowActions ? 'Les actions disponibles dépendent de vos autorisations.' : 'Actions de modification non disponibles pour cette section.'}
      </div>
    </section>
  );
}

