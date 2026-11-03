import { useEffect, useState, type FormEvent } from 'react';
import { AlertTriangle, LoaderCircle, Save, X } from 'lucide-react';

export interface MutationField {
  name: string;
  label: string;
  type?: 'text' | 'number' | 'password' | 'textarea' | 'select' | 'checkbox' | 'date' | 'lines' | 'id-list' | 'file';
  required?: boolean;
  defaultValue?: unknown;
  placeholder?: string;
  min?: number;
  step?: number;
  help?: string;
  options?: { label: string; value: string }[];
}

interface MutationDrawerProps {
  title: string;
  mode: 'create' | 'edit' | 'delete';
  fields: MutationField[];
  initialValues: Record<string, unknown>;
  busy: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (values: Record<string, unknown>) => void;
}

export function MutationDrawer({ title, mode, fields, initialValues, busy, error, onClose, onSubmit }: MutationDrawerProps) {
  const [values, setValues] = useState<Record<string, unknown>>(initialValues);

  useEffect(() => setValues(initialValues), [initialValues]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(values);
  }

  return (
    <div className="mutation-overlay" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="mutation-drawer" role="dialog" aria-modal="true" aria-label={`${mode === 'delete' ? 'Confirmer la suppression' : `${mode === 'create' ? 'Créer' : 'Modifier'} ${title}`}`}>
        <div className="mutation-head"><div><span className="eyebrow">{mode === 'delete' ? 'ACTION IRRÉVERSIBLE' : 'MODIFICATION API'}</span><h2>{mode === 'delete' ? `Supprimer ${title.toLowerCase()} ?` : `${mode === 'create' ? 'Ajouter' : 'Modifier'} · ${title}`}</h2></div><button type="button" className="icon-button" aria-label="Fermer" onClick={onClose}><X size={19} /></button></div>
        {mode === 'delete' ? (
          <form onSubmit={submit}>
            <div className="mutation-warning"><AlertTriangle size={18} /><p>Cette suppression sera appliquée à l’API et ne peut pas être annulée.</p></div>
            {error && <div className="api-error" role="alert">{error}</div>}
            <div className="mutation-actions"><button type="button" className="button subtle" onClick={onClose}>Annuler</button><button className="button danger" disabled={busy}>{busy ? <LoaderCircle className="spin" size={15} /> : null}Supprimer</button></div>
          </form>
        ) : (
          <form onSubmit={submit}>
            <div className="mutation-fields">{fields.map(field => {
              const value = values[field.name];
              const update = (next: unknown) => setValues(current => ({ ...current, [field.name]: next }));
              if (field.type === 'checkbox') return <label className="mutation-checkbox" key={field.name}><input type="checkbox" checked={Boolean(value)} onChange={event => update(event.target.checked)} /><span>{field.label}</span></label>;
              if (field.type === 'textarea' || field.type === 'lines' || field.type === 'id-list') return <label className="mutation-field" key={field.name}><span>{field.label}{field.required && <i> *</i>}</span><textarea required={mode === 'create' && field.required} rows={field.type === 'textarea' ? 3 : 2} placeholder={field.placeholder} value={String(value ?? '')} onChange={event => update(event.target.value)} />{field.help && <small>{field.help}</small>}</label>;
              if (field.type === 'file') return <label className="mutation-field" key={field.name}><span>{field.label}</span><input type="file" accept="image/png,image/jpeg,image/webp" onChange={event => update(event.target.files?.[0] || null)} />{field.help && <small>{field.help}</small>}</label>;
              if (field.type === 'select') return <label className="mutation-field" key={field.name}><span>{field.label}{field.required && <i> *</i>}</span><select required={mode === 'create' && field.required} value={String(value ?? '')} onChange={event => update(event.target.value)}><option value="">Sélectionner…</option>{field.options?.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>;
              return <label className="mutation-field" key={field.name}><span>{field.label}{field.required && <i> *</i>}</span><input required={mode === 'create' && field.required} type={field.type || 'text'} min={field.min} step={field.step} placeholder={field.placeholder} value={String(value ?? '')} onChange={event => update(event.target.value)} />{field.help && <small>{field.help}</small>}</label>;
            })}</div>
            {error && <div className="api-error" role="alert">{error}</div>}
            <div className="mutation-actions"><button type="button" className="button subtle" onClick={onClose}>Annuler</button><button className="button primary" disabled={busy}>{busy ? <LoaderCircle className="spin" size={15} /> : <Save size={15} />}{busy ? 'Enregistrement…' : 'Enregistrer'}</button></div>
          </form>
        )}
      </section>
    </div>
  );
}
