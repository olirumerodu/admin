import React, { useEffect } from 'react';
import { LogOut, X, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function LogoutConfirmModal({ isOpen, onClose, onConfirm, user }) {
  // Listen for Escape key to dismiss modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const displayName = user?.name || 'Administrator';
  const displayEmail = user?.email || 'admin@gmail.com';
  const displayRole = user?.role === 'admin' ? 'Super Admin' : (user?.role || 'Administrator');
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <div 
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(5px)',
        WebkitBackdropFilter: 'blur(5px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '16px',
        animation: 'logoutFadeIn 0.18s ease-out'
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-dialog-title"
    >
      <div 
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '430px',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.3), 0 0 0 1px rgba(226, 232, 240, 0.8)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          animation: 'logoutSlideUp 0.22s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Row with Icon & Close Button */}
        <div 
          style={{
            padding: '20px 22px 14px 22px',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div 
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '12px',
                backgroundColor: '#FEE2E2',
                border: '1px solid #FECACA',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#DC2626',
                flexShrink: 0
              }}
            >
              <LogOut size={22} strokeWidth={2.2} />
            </div>
            <div>
              <h3 
                id="logout-dialog-title"
                style={{
                  fontSize: '17px',
                  fontWeight: 700,
                  color: '#0F172A',
                  margin: 0,
                  letterSpacing: '-0.01em'
                }}
              >
                Sign Out Confirmation
              </h3>
              <p 
                style={{
                  fontSize: '12.5px',
                  color: '#64748B',
                  margin: '3px 0 0 0'
                }}
              >
                Student Health Admin Portal
              </p>
            </div>
          </div>

          <button 
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              background: '#F8FAFC',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#64748B',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F1F5F9';
              e.currentTarget.style.color = '#0F172A';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#F8FAFC';
              e.currentTarget.style.color = '#64748B';
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '0 22px 20px 22px' }}>
          <p 
            style={{
              fontSize: '13.5px',
              color: '#334155',
              lineHeight: 1.55,
              margin: '0 0 16px 0'
            }}
          >
            Are you sure you want to end your current session? You will be signed out of the portal and need to log in again to access admin tools.
          </p>

          {/* User Account Info Card */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              backgroundColor: '#F8FAFC',
              borderRadius: '10px',
              border: '1px solid #E2E8F0',
              marginBottom: '14px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
              <div 
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #EB5A1D 0%, #C2410C 100%)',
                  color: '#FFFFFF',
                  fontSize: '13px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                {userInitial}
              </div>
              <div style={{ minWidth: 0 }}>
                <div 
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#0F172A',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {displayName}
                </div>
                <div 
                  style={{
                    fontSize: '11.5px',
                    color: '#64748B',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {displayEmail}
                </div>
              </div>
            </div>

            <span 
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#EA580C',
                backgroundColor: '#FFF7ED',
                padding: '3px 8px',
                borderRadius: '6px',
                border: '1px solid #FFEDD5',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              {displayRole}
            </span>
          </div>

          {/* Gentle Warning Hint */}
          <div 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              color: '#92400E',
              backgroundColor: '#FEF3C7',
              border: '1px solid #FDE68A',
              padding: '8px 12px',
              borderRadius: '8px'
            }}
          >
            <AlertTriangle size={15} style={{ flexShrink: 0 }} />
            <span>Any unsaved draft data or active forms will be discarded.</span>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div 
          style={{
            padding: '14px 22px 18px 22px',
            backgroundColor: '#F8FAFC',
            borderTop: '1px solid #F1F5F9',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '10px'
          }}
        >
          <button 
            type="button"
            onClick={onClose}
            style={{
              padding: '9px 18px',
              borderRadius: '8px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #CBD5E1',
              color: '#475569',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F1F5F9';
              e.currentTarget.style.borderColor = '#94A3B8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.borderColor = '#CBD5E1';
            }}
          >
            Cancel
          </button>

          <button 
            type="button"
            id="confirm-logout-btn"
            onClick={onConfirm}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '9px 20px',
              borderRadius: '8px',
              backgroundColor: '#DC2626',
              border: '1px solid #B91C1C',
              color: '#FFFFFF',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#B91C1C';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#DC2626';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <LogOut size={15} />
            <span>Yes, Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
