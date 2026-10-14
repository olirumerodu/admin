import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  KeyRound, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  Loader2, 
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api';

export default function ForgotPasswordModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password, 3: Success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isResending, setIsResending] = useState(false);

  if (!isOpen) return null;

  const handleSendOtp = async (e) => {
    e?.preventDefault();
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please enter your administrator email address.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.forgotPassword(cleanEmail);
      setMessage(res.message || `A 6-digit verification code was sent to ${cleanEmail}.`);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to dispatch verification code. Please check the email.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (isResending) return;
    setIsResending(true);
    setError('');
    try {
      const res = await api.forgotPassword(email.trim());
      setMessage(res.message || `A new code was dispatched to ${email.trim()}.`);
    } catch (err) {
      setError(err.message || 'Failed to resend code.');
    } finally {
      setIsResending(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError('Please enter the 6-digit verification code.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match. Please re-enter your new password.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.verifyOtpAndReset(email.trim(), otp.trim(), newPassword);
      setStep(3);
    } catch (err) {
      setError(err.message || 'Verification failed. Please ensure the OTP is correct.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setEmail('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setMessage('');
    onClose();
  };

  return (
    <div 
      className="modal-overlay" 
      onClick={handleClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
    >
      <div 
        className="modal-card" 
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '460px',
          boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.3), 0 0 0 1px rgba(226, 232, 240, 0.8)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'modalScaleUp 0.22s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div 
          style={{
            padding: '24px 28px 20px',
            borderBottom: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            backgroundColor: '#FAFAFC',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div 
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: '#FFF7ED',
                border: '1px solid #FED7AA',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#EA580C',
                flexShrink: 0,
              }}
            >
              <KeyRound size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>
                Password Recovery
              </h3>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '3px 0 0', fontWeight: 500 }}>
                {step === 1 && 'Enter email to receive security code'}
                {step === 2 && 'Enter verification code & new password'}
                {step === 3 && 'Credentials updated successfully'}
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={handleClose} 
            aria-label="Close modal"
            style={{
              background: '#F1F5F9',
              border: 'none',
              color: '#64748B',
              cursor: 'pointer',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#E2E8F0';
              e.currentTarget.style.color = '#0F172A';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#F1F5F9';
              e.currentTarget.style.color = '#64748B';
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '24px 28px 28px' }}>
          {/* Error Alert Banner */}
          {error && (
            <div 
              style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                borderRadius: '10px',
                padding: '12px 14px',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                color: '#991B1B',
                fontSize: '13.5px',
                lineHeight: 1.45,
              }}
            >
              <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
              <span>{error}</span>
            </div>
          )}

          {/* Success / Notification Banner */}
          {message && step === 2 && (
            <div 
              style={{
                backgroundColor: '#F0FDF4',
                border: '1px solid #86EFAC',
                borderRadius: '10px',
                padding: '12px 14px',
                marginBottom: '18px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '10px',
                color: '#166534',
                fontSize: '13px',
                lineHeight: 1.45,
              }}
            >
              <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '1px' }} />
              <span>{message}</span>
            </div>
          )}

          {/* STEP 1: ENTER EMAIL */}
          {step === 1 && (
            <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.55, margin: 0 }}>
                Enter the administrator email associated with your account. A 6-digit verification code will be sent to your inbox via Resend.
              </p>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                  Administrator Email
                </label>
                <div 
                  style={{
                    height: '48px',
                    border: '1.5px solid #CBD5E1',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 14px',
                    gap: '10px',
                    backgroundColor: '#FFFFFF',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#EA580C';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(234, 88, 12, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#CBD5E1';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <Mail size={18} color="#94A3B8" />
                  <input
                    type="email"
                    placeholder="admin@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      fontSize: '14px',
                      color: '#0F172A',
                      backgroundColor: 'transparent',
                    }}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                style={{
                  height: '48px',
                  backgroundColor: '#EA580C',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#FFFFFF',
                  fontSize: '14.5px',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)',
                  transition: 'background-color 0.15s, transform 0.1s',
                  marginTop: '4px',
                  opacity: loading ? 0.75 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.backgroundColor = '#C2410C';
                }}
                onMouseLeave={(e) => {
                  if (!loading) e.currentTarget.style.backgroundColor = '#EA580C';
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="spin-animate" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Recovery Code</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              <div style={{ textAlign: 'center', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={handleClose}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#64748B',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  }}
                >
                  Remember your password? Sign In
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: ENTER OTP & NEW PASSWORD */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                    6-Digit Verification Code (OTP)
                  </label>
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isResending}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#EA580C',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: isResending ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <RefreshCw size={12} className={isResending ? 'spin-animate' : ''} />
                    <span>{isResending ? 'Sending...' : 'Resend Code'}</span>
                  </button>
                </div>
                <div 
                  style={{
                    height: '48px',
                    border: '1.5px solid #CBD5E1',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 14px',
                    gap: '10px',
                    backgroundColor: '#FFFFFF',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#EA580C';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(234, 88, 12, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#CBD5E1';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <KeyRound size={18} color="#EA580C" />
                  <input
                    type="text"
                    placeholder="Enter 6-digit OTP (e.g. 123456)"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    required
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      fontSize: '16px',
                      fontWeight: 700,
                      letterSpacing: '3px',
                      color: '#0F172A',
                      backgroundColor: 'transparent',
                    }}
                  />
                </div>
              </div>

              {/* New Password */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                  New Password
                </label>
                <div 
                  style={{
                    height: '48px',
                    border: '1.5px solid #CBD5E1',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 14px',
                    gap: '10px',
                    backgroundColor: '#FFFFFF',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#EA580C';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(234, 88, 12, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#CBD5E1';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <Lock size={18} color="#94A3B8" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="At least 6 characters (e.g. Admin@123)"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      fontSize: '14px',
                      color: '#0F172A',
                      backgroundColor: 'transparent',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                  Confirm New Password
                </label>
                <div 
                  style={{
                    height: '48px',
                    border: '1.5px solid #CBD5E1',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 14px',
                    gap: '10px',
                    backgroundColor: '#FFFFFF',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#EA580C';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(234, 88, 12, 0.15)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = '#CBD5E1';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <ShieldCheck size={18} color="#94A3B8" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    style={{
                      flex: 1,
                      border: 'none',
                      outline: 'none',
                      fontSize: '14px',
                      color: '#0F172A',
                      backgroundColor: 'transparent',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                style={{
                  height: '48px',
                  backgroundColor: '#EA580C',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#FFFFFF',
                  fontSize: '14.5px',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(234, 88, 12, 0.25)',
                  transition: 'background-color 0.15s',
                  marginTop: '6px',
                  opacity: loading ? 0.75 : 1,
                }}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="spin-animate" />
                    <span>Resetting Password...</span>
                  </>
                ) : (
                  <span>Reset & Update Password</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748B',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center',
                  marginTop: '2px',
                }}
              >
                ← Change Email Address
              </button>
            </form>
          )}

          {/* STEP 3: SUCCESS CONFIRMATION */}
          {step === 3 && (
            <div style={{ textAlign: 'center', padding: '16px 8px 6px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div 
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundColor: '#DCFCE7',
                  color: '#16A34A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                <CheckCircle2 size={36} />
              </div>
              <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: '0 0 8px' }}>
                Password Reset Successful!
              </h4>
              <p style={{ fontSize: '14px', color: '#64748B', lineHeight: 1.5, margin: '0 0 24px', maxWidth: '320px' }}>
                Your administrator password has been updated securely. You can now log in with your updated credentials.
              </p>
              <button 
                type="button" 
                onClick={handleClose} 
                style={{
                  height: '46px',
                  width: '100%',
                  backgroundColor: '#0F172A',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#FFFFFF',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.2)',
                }}
              >
                Back to Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
