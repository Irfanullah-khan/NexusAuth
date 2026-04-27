import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, ShieldCheck, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { resetPasswordSchema } from '../schemas/authSchemas';

/* ── Password strength helper (same as RegisterPage) ─────────────────────── */
const getStrength = (pwd) => {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[!@#$%^&*]/.test(pwd)) score++;
  return score;
};
const strengthConfig = [
  { label: '', color: '' },
  { label: 'Weak', color: '#ef4444' },
  { label: 'Fair', color: '#f59e0b' },
  { label: 'Good', color: '#06b6d4' },
  { label: 'Strong', color: '#10b981' },
];

export default function ResetPasswordPage() {
  const { token } = useParams();          // raw token from URL
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);

  // Redirect to login if no token in URL
  useEffect(() => {
    if (!token) {
      toast.error('Invalid reset link.');
      navigate('/login', { replace: true });
    }
  }, [token, navigate]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(resetPasswordSchema) });

  const pwdValue = watch('password', '');
  const strength = getStrength(pwdValue);
  const { label: strengthLabel, color: strengthColor } = strengthConfig[strength] || {};

  const onSubmit = async (data) => {
    setLoading(true);
    setApiError('');
    try {
      await api.post('/auth/reset-password', {
        token,                  // raw token from URL params
        password: data.password,
      });
      setSuccess(true);
      toast.success('Password updated successfully!');
      // Auto-redirect to login after 3 seconds
      setTimeout(() => navigate('/login', { replace: true }), 3000);
    } catch (err) {
      const msg = err.response?.data?.message || 'Reset failed. The link may have expired.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ── Success screen ──────────────────────────────────────────────────────── */
  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-bg-orb auth-bg-orb-1" />
        <div className="auth-bg-orb auth-bg-orb-2" />
        <div className="glass-card" style={{ textAlign: 'center' }}>
          <div style={{
            width: 80, height: 80,
            background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,182,212,0.15))',
            border: '2px solid rgba(16,185,129,0.5)',
            borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.5rem',
          }}>
            <CheckCircle size={36} color="#10b981" />
          </div>
          <h1 className="form-title" style={{ color: '#34d399' }}>Password Updated!</h1>
          <p className="form-subtitle" style={{ marginBottom: '1rem' }}>
            Your password has been reset successfully.
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
            Redirecting you to the login page in a few seconds…
          </p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <span className="spinner" style={{ borderTopColor: '#10b981', borderColor: 'rgba(16,185,129,0.2)' }} />
            <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Redirecting…</span>
          </div>
          <Link to="/login" className="btn-primary" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Go to Sign In →
          </Link>
        </div>
      </div>
    );
  }

  /* ── Form screen ─────────────────────────────────────────────────────────── */
  return (
    <div className="auth-page">
      <div className="auth-bg-orb auth-bg-orb-1" />
      <div className="auth-bg-orb auth-bg-orb-2" />
      <div className="auth-bg-orb auth-bg-orb-3" />

      <div className="glass-card">
        {/* Logo */}
        <div className="logo">
          <div className="logo-icon">🔐</div>
          <span className="logo-text">NexusAuth</span>
        </div>

        {/* Icon */}
        <div style={{
          width: 64, height: 64,
          background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
          border: '2px solid rgba(99,102,241,0.4)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.8rem', margin: '0 auto 1.5rem',
        }}>
          🛡️
        </div>

        <h1 className="form-title">Set New Password</h1>
        <p className="form-subtitle">
          Choose a strong password to protect your account.
        </p>

        {/* Error Banner */}
        {apiError && (
          <div className="alert alert-error">
            <ShieldCheck size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* New Password */}
          <div className="form-group">
            <label className="form-label">New Password</label>
            <div className="form-input-wrapper">
              <Lock className="form-input-icon" size={18} />
              <input
                {...register('password')}
                type={showPwd ? 'text' : 'password'}
                placeholder="Min. 8 chars, 1 upper, 1 number, 1 symbol"
                autoComplete="new-password"
                autoFocus
                className={`form-input ${errors.password ? 'error' : ''}`}
                style={{ paddingRight: '2.75rem' }}
              />
              <button type="button" className="password-toggle" onClick={() => setShowPwd(!showPwd)}>
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Strength Bar */}
            {pwdValue && (
              <>
                <div className="strength-bar">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="strength-segment"
                      style={{ background: i <= strength ? strengthColor : undefined }}
                    />
                  ))}
                </div>
                <p className="strength-label" style={{ color: strengthColor }}>{strengthLabel}</p>
              </>
            )}
            {errors.password && <p className="form-error">⚠ {errors.password.message}</p>}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <div className="form-input-wrapper">
              <Lock className="form-input-icon" size={18} />
              <input
                {...register('confirmPassword')}
                type={showConfirm ? 'text' : 'password'}
                placeholder="Re-enter your new password"
                autoComplete="new-password"
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                style={{ paddingRight: '2.75rem' }}
              />
              <button type="button" className="password-toggle" onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && <p className="form-error">⚠ {errors.confirmPassword.message}</p>}
          </div>

          {/* Session warning */}
          <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
            <ShieldCheck size={15} style={{ flexShrink: 0, marginTop: 2 }} />
            <span style={{ fontSize: '0.82rem' }}>
              For security, all active sessions will be signed out after the reset.
            </span>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ marginTop: '0.25rem' }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <span className="spinner" /> Updating Password…
              </span>
            ) : 'Update Password →'}
          </button>
        </form>

        <div className="auth-link-row" style={{ marginTop: '1rem' }}>
          Remember your password?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
