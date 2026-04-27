import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, ShieldCheck, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { forgotPasswordSchema } from '../schemas/authSchemas';

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);   // true = show "check email" screen
  const [serverError, setServerError] = useState('');  // non-empty = show error banner in form

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = async (data) => {
    setLoading(true);
    setServerError('');
    try {
      await api.post('/auth/forgot-password', { email: data.email });
      // ✅ Real 200 from server — email was queued successfully
      setSubmitted(true);
      toast.success('Reset link sent! Check your inbox.');
    } catch (err) {
      const status = err.response?.status;
      const msg    = err.response?.data?.message || 'Something went wrong. Please try again.';

      if (status === 429) {
        // Rate limit — safe to tell the user directly
        toast.error(msg, { duration: 6000 });
      } else if (status === 500) {
        // ❌ Real email delivery failure (Brevo error, bad API key, etc.)
        // Keep the form visible so the user can retry — do NOT fake a success screen
        setServerError(msg);
        toast.error('Failed to send reset email. Please try again.');
      } else {
        // Network error, CORS, etc. — keep form visible
        setServerError('Could not connect to server. Please check your connection and retry.');
        toast.error('Request failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="auth-page">
      <div className="auth-bg-orb auth-bg-orb-1" />
      <div className="auth-bg-orb auth-bg-orb-2" />

      <div className="glass-card">
        {/* Logo */}
        <div className="logo">
          <div className="logo-icon">🔐</div>
          <span className="logo-text">NexusAuth</span>
        </div>

        {submitted ? (
          /* ── Success State ────────────────────────────────────────── */
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 72, height: 72,
              background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,182,212,0.2))',
              border: '2px solid rgba(16,185,129,0.4)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', margin: '0 auto 1.5rem',
            }}>
              📬
            </div>
            <h1 className="form-title">Check Your Email</h1>
            <p className="form-subtitle" style={{ marginBottom: '0.75rem' }}>
              If an account exists for{' '}
              <strong style={{ color: 'var(--primary)' }}>{getValues('email')}</strong>,
              a password reset link has been sent.
            </p>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.6 }}>
              The link expires in <strong style={{ color: 'var(--warning)' }}>15 minutes</strong>.
              Check your spam folder if you don&apos;t see it.
            </p>
            <div className="alert alert-info" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
              <ShieldCheck size={16} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>For your security, we don&apos;t confirm whether an email is registered.</span>
            </div>
            <Link to="/login" className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', textDecoration: 'none' }}>
              <ArrowLeft size={16} /> Back to Sign In
            </Link>
          </div>
        ) : (
          /* ── Form State ───────────────────────────────────────────── */
          <>
            {/* Icon */}
            <div style={{
              width: 64, height: 64,
              background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
              border: '2px solid rgba(99,102,241,0.4)',
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.8rem', margin: '0 auto 1.5rem',
            }}>
              🔑
            </div>

            <h1 className="form-title">Forgot Password?</h1>
            <p className="form-subtitle">
              Enter your email and we&apos;ll send you a secure reset link.
            </p>

            {/* ── Server error banner (email delivery failure) ──────────── */}
            {serverError && (
              <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
                <ShieldCheck size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>{serverError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <div className="form-input-wrapper">
                  <Mail className="form-input-icon" size={18} />
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    autoFocus
                    className={`form-input ${errors.email ? 'error' : ''}`}
                  />
                </div>
                {errors.email && <p className="form-error">⚠ {errors.email.message}</p>}
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
              >
                {loading ? (
                  <><span className="spinner" /> Sending Link...</>
                ) : (
                  <><Send size={16} /> Send Reset Link</>
                )}
              </button>
            </form>

            <div className="auth-link-row" style={{ marginTop: '1.25rem' }}>
              <Link to="/login" className="auth-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                <ArrowLeft size={14} /> Back to Sign In
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
