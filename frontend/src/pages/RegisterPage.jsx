import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, User, Mail, Lock, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { registerSchema } from '../schemas/authSchemas';
import GoogleAuthButton from '../components/GoogleAuthButton';

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

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({ resolver: zodResolver(registerSchema) });

  const pwdValue = watch('password', '');
  const strength = getStrength(pwdValue);
  const { label: strengthLabel, color: strengthColor } = strengthConfig[strength] || {};

  const onSubmit = async (data) => {
    setLoading(true);
    setApiError('');
    try {
      await api.post('/auth/register', {
        name: data.name,
        email: data.email,
        password: data.password,
      });
      toast.success('Account created! Check your email for the OTP.');
      navigate('/verify-otp', { state: { email: data.email } });
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg-orb auth-bg-orb-1" />
      <div className="auth-bg-orb auth-bg-orb-2" />
      <div className="auth-bg-orb auth-bg-orb-3" />

      <div className="glass-card">
        {/* Logo */}
        <div className="logo">
          <div className="logo-icon">🔐</div>
          <span className="logo-text">NEXUSAUTH</span>
        </div>

        <h1 className="form-title">Create Account</h1>
        <p className="form-subtitle">Join NexusAuth – Secure Your Web.</p>

        {apiError && (
          <div className="alert alert-error">
            <ShieldCheck size={16} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Name */}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="form-input-wrapper">
              <User className="form-input-icon" size={18} />
              <input
                {...register('name')}
                type="text"
                placeholder="John Doe"
                autoComplete="name"
                className={`form-input ${errors.name ? 'error' : ''}`}
              />
            </div>
            {errors.name && <p className="form-error">⚠ {errors.name.message}</p>}
          </div>

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
            <label className="form-label">Password</label>
            <div className="form-input-wrapper">
              <Lock className="form-input-icon" size={18} />
              <input
                {...register('password')}
                type={showPwd ? 'text' : 'password'}
                placeholder="Min. 8 chars, 1 upper, 1 number, 1 symbol"
                autoComplete="new-password"
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
            <label className="form-label">Confirm Password</label>
            <div className="form-input-wrapper">
              <Lock className="form-input-icon" size={18} />
              <input
                {...register('confirmPassword')}
                type={showConfirm ? 'text' : 'password'}
                placeholder="Re-enter your password"
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

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '0.5rem' }}>
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <span className="spinner" /> Creating Account...
              </span>
            ) : 'Create Account →'}
          </button>
        </form>

        {/* ── Divider ───────────────────────────────────────────────────── */}
        <div className="divider">
          <span>or sign up with</span>
        </div>

        {/* ── Google Sign-Up ─────────────────────────────────────────────── */}
        <GoogleAuthButton label="Sign up with Google" />

        <div className="auth-link-row">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
