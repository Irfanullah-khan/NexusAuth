import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Mail, RefreshCw, ShieldCheck, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api/axios';

const OTP_LENGTH = 6;
const RESEND_DELAY = 60;

export default function OTPPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || '';

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(RESEND_DELAY);
  const inputRefs = useRef([]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  // Focus first input
  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  // Redirect if no email
  useEffect(() => {
    if (!email) navigate('/register', { replace: true });
  }, [email, navigate]);

  const handleChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (pasted.length === OTP_LENGTH) {
      setOtp(pasted.split(''));
      inputRefs.current[OTP_LENGTH - 1]?.focus();
    }
  };

  const handleVerify = useCallback(async () => {
    const otpString = otp.join('');
    if (otpString.length !== OTP_LENGTH) {
      setApiError('Please enter the complete 6-digit OTP.');
      return;
    }

    setLoading(true);
    setApiError('');
    try {
      await api.post('/auth/verify-otp', { email, otp: otpString });
      setSuccess(true);
      toast.success('Email verified successfully! 🎉');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [otp, email, navigate]);

  const handleResend = async () => {
    setResending(true);
    setApiError('');
    try {
      await api.post('/auth/resend-otp', { email });
      setCountdown(RESEND_DELAY);
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
      toast.success('A new OTP has been sent to your email.');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-bg-orb auth-bg-orb-1" />
        <div className="glass-card" style={{ textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(16,185,129,0.15)', border: '2px solid rgba(16,185,129,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', animation: 'slideUp 0.4s ease' }}>
            <CheckCircle size={36} color="#10b981" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem' }}>Verified!</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Redirecting you to login...</p>
          <div className="spinner" style={{ margin: '1.5rem auto 0', width: 28, height: 28 }} />
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-bg-orb auth-bg-orb-1" />
      <div className="auth-bg-orb auth-bg-orb-2" />

      <div className="glass-card">
        <div className="logo">
          <div className="logo-icon">🔐</div>
          <span className="logo-text">NEXUSAUTH</span>
        </div>

        <h1 className="form-title">Verify Your Email</h1>
        <p className="form-subtitle">
          We sent a 6-digit code to{' '}
          <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{email}</span>
        </p>

        {apiError && (
          <div className="alert alert-error">
            <ShieldCheck size={16} style={{ flexShrink: 0 }} />
            <span>{apiError}</span>
          </div>
        )}

        {/* Email Icon Graphic */}
        <div style={{ textAlign: 'center', margin: '1rem 0' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(99,102,241,0.12)', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
            <Mail size={28} color="var(--primary)" />
          </div>
        </div>

        {/* OTP Inputs */}
        <div className="otp-container" onPaste={handlePaste}>
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className={`otp-input ${digit ? 'filled' : ''}`}
              id={`otp-${i}`}
            />
          ))}
        </div>

        <button
          className="btn-primary"
          onClick={handleVerify}
          disabled={loading || otp.join('').length !== OTP_LENGTH}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <span className="spinner" /> Verifying...
            </span>
          ) : 'Verify Email →'}
        </button>

        {/* Resend */}
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          {countdown > 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Resend code in <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{countdown}s</span>
            </p>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', fontWeight: 600, fontSize: '0.875rem', display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontFamily: 'Inter, sans-serif' }}
            >
              <RefreshCw size={14} className={resending ? 'spinner' : ''} />
              {resending ? 'Sending...' : 'Resend OTP'}
            </button>
          )}
        </div>

        <div className="auth-link-row">
          Wrong email?{' '}
          <Link to="/register" className="auth-link">Go back</Link>
        </div>
      </div>
    </div>
  );
}
