import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Check, CircleHelp, LockKeyhole, LogIn, RefreshCw, ShieldCheck, Sparkles, Wrench } from 'lucide-react';
import { API_BASE_URL } from '../../config/api';
import { clearLoginError, loginAdmin, useAppDispatch, useAppSelector } from '../../state';
import appIcon from '../../assets/intech-app-icon.png';
import brandLogo from '../../assets/intech-brand-logo.png';

export function LoginPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { checking, loginLoading: busy, loginError: error } = useAppSelector(state => state.auth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      await dispatch(loginAdmin({ email, password })).unwrap();
      navigate('/', { replace: true });
    } catch {
      // The rejected thunk stores its message in Redux.
    }
  }

  return (
    <main className="auth-page">
      <section className="login-visual" aria-label="InTech service platform">
        <div className="login-visual-brand"><img className="login-brand-logo" src={brandLogo} alt="InTech" /></div>
        <div className="login-visual-copy">
          <span className="login-kicker"><Sparkles size={14} /> ESPACE PROFESSIONNEL</span>
          <h1>Le service InTech,<br /><span>en toute maîtrise.</span></h1>
          <p>Suivez les demandes, accompagnez vos techniciens et pilotez votre réseau depuis un seul espace.</p>
        </div>
        <div className="login-illustration" aria-hidden="true">
          <div className="illustration-orbit orbit-one" /><div className="illustration-orbit orbit-two" />
          <div className="illustration-main-card"><span className="illustration-tool"><Wrench size={35} /></span><div className="illustration-spark spark-one"><Sparkles size={17} /></div><div className="illustration-spark spark-two"><Check size={16} /></div><div className="illustration-lines"><i /><i /><i /></div></div>
          <div className="illustration-float float-request"><span className="float-icon"><Wrench size={16} /></span><div><b>Demande suivie</b><small>Prise en charge en cours</small></div><ArrowUpRight size={15} /></div>
          <div className="illustration-float float-shield"><ShieldCheck size={23} /><span>Réseau de confiance</span></div>
          <div className="illustration-dot dot-one" /><div className="illustration-dot dot-two" /><div className="illustration-dot dot-three" />
        </div>
        <div className="login-visual-foot"><span>INTECH · ADMINISTRATION</span><span>Un espace. Toute votre activité.</span></div>
      </section>

      <section className="login-content">
        {checking ? (
          <div className="auth-check login-check-card"><span className="login-lock"><LockKeyhole size={19} /></span><RefreshCw size={18} className="spin" /><b>Vérification de la session InTech…</b></div>
        ) : (
          <form className="api-login-card" onSubmit={submit}>
            <div className="login-form-mark"><span className="brand-mark brand-image-mark"><img src={appIcon} alt="" /></span><span>INTECH ADMIN</span></div>
            <span className="eyebrow">CONNEXION SÉCURISÉE</span>
            <h2>Ravi de vous revoir</h2>
            <p>Connectez-vous à votre espace administrateur InTech.</p>
            <label>Email administrateur<input required type="email" autoComplete="username" placeholder="nom@intech.dz" value={email} onChange={e => { setEmail(e.target.value); dispatch(clearLoginError()); }} /></label>
            <label>Mot de passe<input required type="password" autoComplete="current-password" placeholder="Saisissez votre mot de passe" value={password} onChange={e => { setPassword(e.target.value); dispatch(clearLoginError()); }} /></label>
            {error && <div className="api-error" role="alert">{error}</div>}
            {API_BASE_URL.startsWith('http://') && <div className="api-http-warning"><CircleHelp size={15} /><span>API HTTP sans chiffrement : utilisez uniquement un compte de test.</span></div>}
            <div className="login-security-note"><LockKeyhole size={14} /><span>Votre session reste limitée à cet onglet.</span></div>
            <button className="button primary full-button" disabled={busy}>{busy ? <><RefreshCw size={15} className="spin" />Connexion…</> : <><LogIn size={16} />Se connecter</>}</button>
            <div className="login-form-foot"><ShieldCheck size={14} /><span>Accès réservé aux administrateurs autorisés</span></div>
          </form>
        )}
      </section>
    </main>
  );
}
