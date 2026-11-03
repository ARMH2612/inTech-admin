import { useEffect, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { Status } from "../Status";
import type { ApiRow } from "../../types";

export interface TableColumn {
  key: keyof ApiRow | string;
  label: string;
  status?: boolean;
}

interface CustomTableProps {
  columns: TableColumn[];
  rows: ApiRow[];
  total?: number;
  onRefresh: () => void;
  onSelect?: (row: ApiRow) => void;
  loading?: boolean;
  error?: string;
  emptyMessage?: string;
  onCreate?: () => void;
  onEdit?: (row: ApiRow) => void;
  onDelete?: (row: ApiRow) => void;
  notice?: string;
  mutationError?: string;
  editLabel?: string;
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
  loading = false,
  error = "",
  emptyMessage = "Aucun élément trouvé.",
  onCreate,
  onEdit,
  onDelete,
  notice,
  mutationError,
  editLabel = 'Modifier',
  rowActions,
  canEdit,
  canDelete,
}: CustomTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const visiblePage = Math.min(currentPage, pageCount);
  const startIndex = (visiblePage - 1) * pageSize;
  const pageRows = rows.slice(startIndex, startIndex + pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [rows]);

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
    <section className="panel data-table-panel">
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
              {pageRows.map((row, index) => (
                <tr
                  key={row._id ?? startIndex + index}
                  onClick={onSelect ? () => onSelect(row) : undefined}
                >
                  {columns.map((column) => {
                    const value = row[column.key as keyof ApiRow];
                    return (
                      <td key={column.key}>
                        {column.status ? (
                          <Status>{String(value ?? "—")}</Status>
                        ) : (
                          String(value ?? "—")
                        )}
                      </td>
                    );
                  })}
                  {(onEdit || onDelete || rowActions) && <td className="table-row-actions" onClick={event => event.stopPropagation()}>
                    {onEdit && (!canEdit || canEdit(row)) && <button type="button" className="table-row-action" aria-label={`${editLabel} ${String(row[columns[0]?.key as keyof ApiRow] ?? 'cet élément')}`} title={editLabel} onClick={() => onEdit(row)}><Pencil size={14} /></button>}
                    {onDelete && (!canDelete || canDelete(row)) && <button type="button" className="table-row-action delete" aria-label="Supprimer" title="Supprimer" onClick={() => onDelete(row)}><Trash2 size={14} /></button>}
                    {rowActions?.(row)}
                  </td>}
                </tr>
              ))}
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

