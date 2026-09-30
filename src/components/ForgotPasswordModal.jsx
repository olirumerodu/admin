import React, { useState } from 'react';
import { X, Mail, KeyRound, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

export default function ForgotPasswordModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password, 3: Success
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your administrator email address.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.forgotPassword(email);
      setMessage(`A 6-digit verification code was dispatched to ${email}. (Demo OTP: 123456)`);
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to dispatch reset code.');
    } finally {
      setLoading(false);
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
    setLoading(true);
    setError('');
    try {
      await api.verifyOtpAndReset(email, otp, newPassword);
      setStep(3);
    } catch (err) {
      setError(err.message || 'Failed to verify code.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setEmail('');
    setOtp('');
    setNewPassword('');
    setError('');
    setMessage('');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 className="modal-title">Password Recovery</h3>
            <p style={{ fontSize: '13.5px', color: '#64748B', marginTop: '4px' }}>
              Student Health Administrator Security
            </p>
          </div>
          <button className="btn-close-modal" onClick={handleClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="alert-banner danger" style={{ marginBottom: '16px' }}>
            <span>{error}</span>
          </div>
        )}

        {message && step === 2 && (
          <div className="alert-banner success" style={{ marginBottom: '16px' }}>
            <span>{message}</span>
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <p style={{ fontSize: '14px', color: '#475569', lineHeight: 1.5 }}>
              Enter the administrator email address associated with your account to receive a security verification code.
            </p>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-container">
                <span className="input-icon"><Mail size={18} /></span>
                <input
                  type="email"
                  className="form-input"
                  placeholder="admin@oehealth.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-submit-primary" 
              disabled={loading}
              style={{ marginTop: '6px' }}
            >
              {loading ? 'Sending Code...' : (
                <>
                  <span>Send Recovery Code</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Verification Code (OTP)</label>
              <div className="input-container">
                <span className="input-icon"><KeyRound size={18} /></span>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter 6-digit code (e.g. 123456)"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <div className="input-container">
                <span className="input-icon"><ShieldCheck size={18} /></span>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter at least 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-submit-primary" 
              disabled={loading}
              style={{ marginTop: '8px' }}
            >
              {loading ? 'Resetting...' : 'Update Password'}
            </button>
          </form>
        )}

        {step === 3 && (
          <div style={{ textAlign: 'center', padding: '20px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <CheckCircle size={56} color="#10B981" />
            <h4 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A' }}>Password Reset Complete!</h4>
            <p style={{ fontSize: '14px', color: '#64748B', maxWidth: '340px' }}>
              Your administrator credentials have been successfully updated. You may now sign in with your new password.
            </p>
            <button 
              type="button" 
              className="btn-primary" 
              onClick={handleClose} 
              style={{ marginTop: '10px', width: '100%', justifyContent: 'center' }}
            >
              Back to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
