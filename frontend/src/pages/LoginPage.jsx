import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { loginSchema } from '../schemas/authSchemas';
import GoogleAuthButton from '../components/GoogleAuthButton';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [showPwd, setShowPwd] = useState(false);
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data) => {
    setLoading(true);
    setApiError('');
    try {
      const res = await api.post('/auth/login', data);
      login(res.data.data.user);
      toast.success(`Welcome back, ${res.data.data.user.name}! 👋`);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || 'Login failed. Please try again.';
      const code = err.response?.data?.code;

      if (status === 403 && code === 'UNVERIFIED') {
        setApiError('');
        toast.error('Email not verified. Redirecting...');
        setTimeout(() => navigate('/verify-otp', { state: { email: data.email } }), 1500);
      } else if (status === 400 && code === 'GOOGLE_ACCOUNT') {
        // Account exists but is Google-only — guide user to Google login
        setApiError('');
        toast.error('This account uses Google Sign-In. Use the button below.', { duration: 5000 });
      } else {
        setApiError(msg);
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

        <h1 className="form-title">Welcome Back</h1>
        <p className="form-subtitle">Sign in to access your secure dashboard.</p>

        {apiError && (
          <div className="alert alert-error">
            <ShieldCheck size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="form-input-wrapper">
              <Mail className="form-input-icon" size={18} />
              <input
                {...register('email')}
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
              />
            </div>
            {errors.email && <p className="form-error">⚠ {errors.email.message}</p>}
          </div>

          {/* Password */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Password</label>
              <Link to="/forgot-password" className="auth-link" style={{ fontSize: '0.8rem', fontWeight: 500 }}>
                Forgot Password?
              </Link>
            </div>
            <div className="form-input-wrapper">
              <Lock className="form-input-icon" size={18} />
              <input
                {...register('password')}
                type={showPwd ? 'text' : 'password'}
                placeholder="Your password"
                autoComplete="current-password"
                className={`form-input ${errors.password ? 'error' : ''}`}
                style={{ paddingRight: '2.75rem' }}
              />
              <button type="button" className="password-toggle" onClick={() => setShowPwd(!showPwd)}>
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="form-error">⚠ {errors.password.message}</p>}
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <span className="spinner" /> Signing In...
              </span>
            ) : 'Sign In →'}
          </button>
        </form>

        {/* ── Divider ───────────────────────────────────────────────────── */}
        <div className="divider">
          <span>or continue with</span>
        </div>

        {/* ── Google Sign-In ─────────────────────────────────────────────── */}
        <GoogleAuthButton label="Continue with Google" />

        <div className="auth-link-row" style={{ marginTop: '1rem' }}>
          Don&apos;t have an account?{' '}
          <Link to="/register" className="auth-link">Create one</Link>
        </div>
      </div>
    </div>
  );
}
