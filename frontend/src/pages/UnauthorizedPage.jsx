import { Link } from 'react-router-dom';
import { ShieldX } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <div className="auth-page">
      <div className="auth-bg-orb auth-bg-orb-1" />
      <div className="auth-bg-orb auth-bg-orb-2" />
      <div className="glass-card" style={{ textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(239,68,68,0.12)', border: '2px solid rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <ShieldX size={40} color="#ef4444" />
        </div>
        <h1 style={{ fontSize: '4rem', fontWeight: 900, background: 'linear-gradient(135deg, #ef4444, #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1, marginBottom: '0.5rem' }}>403</h1>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.75rem' }}>Access Denied</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
          You don't have permission to view this page.<br />
          Please contact your administrator if you believe this is an error.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/dashboard" style={{ textDecoration: 'none' }}>
            <button className="btn-primary" style={{ width: 'auto', padding: '0.75rem 1.5rem' }}>
              Go to Dashboard
            </button>
          </Link>
          <Link to="/login" style={{ textDecoration: 'none' }}>
            <button className="btn-ghost">Sign In</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
