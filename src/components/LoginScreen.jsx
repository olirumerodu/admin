import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Check, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import StudentHealthLogo from './StudentHealthLogo';
import ForgotPasswordModal from './ForgotPasswordModal';

export default function LoginScreen({ onLoginSuccess }) {
  const { login, loading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  const [focusedField, setFocusedField] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email.trim()) {
      setErrorMsg('Please enter your administrator email address.');
      return;
    }
    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    try {
      await login(email.trim(), password, rememberMe);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      const msg = err.message || '';
      if (msg.toLowerCase().includes('deactivated')) {
        setErrorMsg('Account is deactivated. Please contact administrator.');
      } else {
        setErrorMsg('Invalid email or password');
      }
    }
  };

  return (
    <div className="split-login-container">
      {/* ================= ONE SIDE: IMAGE BACKGROUND ================= */}
      <section className="split-login-left">
        <div className="split-login-left-overlay" />

        <div className="split-login-left-content">
          {/* Brand Logo Header - Centered with Increased Size */}
          <div className="hero-logo-center-wrapper">
            <StudentHealthLogo size={110} showText={false} isWhite={true} />
          </div>

          {/* Accent Line */}
          <div className="brand-accent-pill" />

          {/* Large Hero Headline */}
          <h1 className="hero-main-title">
            <span className="hero-title-dark">Waattasaattam</span>
            <span className="hero-title-orange">Admin Portal</span>
          </h1>

          {/* Subtitle */}
          <p className="hero-description">
            Manage access, monitor student data and understand school health insights.
          </p>
        </div>
      </section>

      {/* ================= ANOTHER SIDE: WHITE BACKGROUND LOGIN SCREEN ================= */}
      <section className="split-login-right">
        <div className="login-card">
          {/* Card Header */}
          <div className="login-card-header">
            <h2 className="card-heading">Welcome back</h2>
            <p className="card-subheading">Sign in to Admin Portal</p>
          </div>

          {/* Error Notification */}
          {errorMsg && (
            <div className="alert-banner danger" style={{ marginBottom: '18px' }}>
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {/* Email Field */}
            <div className="form-group">
              <label className="form-label" htmlFor="admin-email">
                Email Address
              </label>
              <div 
                className={`input-container ${focusedField === 'email' ? 'focused' : ''} ${errorMsg && !email ? 'error' : ''}`}
              >
                <span className="input-icon">
                  <Mail size={18} />
                </span>
                <input
                  id="admin-email"
                  type="email"
                  className="form-input"
                  placeholder="admin@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label className="form-label" htmlFor="admin-password">
                Password
              </label>
              <div 
                className={`input-container ${focusedField === 'password' ? 'focused' : ''} ${errorMsg && !password ? 'error' : ''}`}
              >
                <span className="input-icon">
                  <Lock size={18} />
                </span>
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="input-action-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={-1}
                >
                  {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
              </div>
            </div>

            {/* Options Row: Remember Me & Forgot Password */}
            <div className="form-options-row">
              <label className="checkbox-label" onClick={() => setRememberMe(!rememberMe)}>
                <div className={`custom-checkbox ${rememberMe ? 'checked' : ''}`}>
                  {rememberMe && <Check size={14} strokeWidth={3} />}
                </div>
                <span className="checkbox-text">Remember me</span>
              </label>

              <button
                type="button"
                className="forgot-password-link"
                onClick={() => setIsForgotModalOpen(true)}
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn-submit-primary"
              disabled={loading}
              id="sign-in-submit-btn"
            >
              {loading ? (
                <>
                  <Loader2 size={19} className="animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={19} />
                </>
              )}
            </button>
          </form>

          {/* Card Footer: Authorized Badge */}
          <div className="login-card-footer">
            <div className="auth-badge">
              <span className="auth-badge-icon">
                <ShieldCheck size={16} />
              </span>
              <span>Authorized administrators only</span>
            </div>
            <div style={{ marginTop: '8px', fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
              <span>Multi-Admin Active: Super Admin & Cluster Admin can run side-by-side in parallel tabs</span>
            </div>
          </div>
        </div>
      </section>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
      />
    </div>
  );
}
