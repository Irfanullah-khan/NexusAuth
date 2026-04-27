import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Mail, ShieldCheck, Star, Clock, Activity, KeyRound, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully.');
    navigate('/login', { replace: true });
  };

  // ── Provider badge config ────────────────────────────────────────────────────
  const isGoogle = user?.provider === 'google';
  const providerLabel = isGoogle ? 'Google OAuth' : 'Email / Password';
  const providerBadgeClass = isGoogle ? 'badge-google' : 'badge-local';

  const stats = [
    {
      icon: '✅',
      iconBg: 'rgba(16,185,129,0.15)',
      label: 'Account Status',
      value: user?.isVerified ? 'Verified' : 'Unverified',
      badge: user?.isVerified ? 'badge-success' : 'badge-warning',
    },
    {
      icon: '🛡️',
      iconBg: 'rgba(99,102,241,0.15)',
      label: 'Role',
      value: user?.role === 'admin' ? 'Administrator' : 'User',
      badge: user?.role === 'admin' ? 'badge-admin' : 'badge-user',
    },
    {
      icon: isGoogle ? '🌐' : '🔐',
      iconBg: isGoogle ? 'rgba(66,133,244,0.15)' : 'rgba(245,158,11,0.15)',
      label: 'Auth Method',
      value: providerLabel,
      badge: providerBadgeClass,
    },
    {
      icon: '⚡',
      iconBg: 'rgba(6,182,212,0.15)',
      label: 'Session',
      value: 'Active',
      badge: 'badge-success',
    },
  ];

  const securityFeatures = [
    { icon: <KeyRound size={16} />, text: 'bcrypt password hashing (12 rounds)' },
    { icon: <ShieldCheck size={16} />, text: 'JWT Access + Refresh token rotation' },
    { icon: <Activity size={16} />, text: 'HTTP-only cookies — no localStorage' },
    { icon: <Star size={16} />, text: 'OTP email verification via Brevo' },
    { icon: <Clock size={16} />, text: 'Rate limiting & brute-force protection' },
    { icon: <User size={16} />, text: 'Role-Based Access Control (RBAC)' },
    { icon: <Globe size={16} />, text: 'Google OAuth 2.0 (GIS ID token)' },
  ];

  return (
    <div className="dashboard-page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo" style={{ marginBottom: 0 }}>
          <div className="logo-icon" style={{ width: 34, height: 34, fontSize: '1rem' }}>🔐</div>
          <span className="logo-text" style={{ fontSize: '1.1rem' }}>NEXUSAUTH</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            {/* Avatar: Google photo OR gradient initial */}
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user?.name}
                style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(99,102,241,0.5)' }}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 700 }}>
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {user?.name}
            </span>
          </div>
          <button
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '0.5rem 1rem', color: '#fca5a5', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'Inter, sans-serif', transition: 'all 0.2s' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
          >
            <LogOut size={15} />
            Logout
          </button>
        </div>
      </nav>

      <div className="dashboard-content">
        {/* Welcome Banner */}
        <div className="welcome-banner">
          <p style={{ color: 'var(--primary)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
             Authentication Successful
          </p>
          <h1 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', fontWeight: 800, marginBottom: '0.5rem' }}>
            Welcome back, <span style={{ background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{user?.name}</span>! 
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 520 }}>
            You&apos;re securely authenticated into the NexusAuth dashboard. Your session is protected with enterprise-grade JWT tokens stored in HTTP-only cookies.
          </p>

          {/* Provider pill */}
          <div style={{ marginTop: '1rem' }}>
            <span className={`badge ${providerBadgeClass}`}>
              {isGoogle ? '🌐' : '🔑'} signed in via {providerLabel}
            </span>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="stat-grid">
          {stats.map((s, i) => (
            <div key={i} className="stat-card">
              <div className="stat-icon" style={{ background: s.iconBg }}>
                <span>{s.icon}</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>
                {s.label}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span className={`badge ${s.badge}`}>{s.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Two column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
          {/* User Profile Card */}
          <div className="stat-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={18} color="var(--primary)" /> Profile Details
            </h3>

            {/* Avatar section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: 12, border: '1px solid var(--border)' }}>
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user?.name}
                  style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(99,102,241,0.4)', flexShrink: 0 }}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 800, flexShrink: 0 }}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1rem' }}>{user?.name}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{user?.email}</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { label: 'Full Name', value: user?.name, icon: <User size={15} /> },
                { label: 'Email Address', value: user?.email, icon: <Mail size={15} /> },
                { label: 'User Role', value: user?.role?.toUpperCase(), icon: <ShieldCheck size={15} /> },
                { label: 'Auth Provider', value: providerLabel, icon: isGoogle ? <Globe size={15} /> : <KeyRound size={15} /> },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '0.875rem', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    {item.icon} {item.label}
                  </span>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem' }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Security Features */}
          <div className="stat-card" style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} color="var(--primary)" /> Security Features Active
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {securityFeatures.map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem 0.875rem', background: 'rgba(16,185,129,0.06)', borderRadius: 10, border: '1px solid rgba(16,185,129,0.15)' }}>
                  <span style={{ color: '#10b981', flexShrink: 0 }}>{f.icon}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
