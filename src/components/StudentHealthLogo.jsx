import React from 'react';
import logoImg from '../assets/images/wattasattam_logo.png';

/**
 * Waattasaattam Brand Logo - Official circular foundation logo & brand typography
 */
export default function StudentHealthLogo({ size = 44, showText = true, isWhite = false, style = {}, className = '' }) {
  const navyColor = isWhite ? '#FFFFFF' : '#0E1B38';
  const orangeColor = '#EB5A1D';
  const isLarge = size >= 70;

  return (
    <div 
      className={`brand-header-row ${className}`} 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        gap: '12px',
        ...style 
      }}
    >
      <div 
        className="brand-logo-icon" 
        style={{ 
          width: `${size}px`, 
          height: `${size}px`, 
          flexShrink: 0,
          borderRadius: '50%',
          overflow: 'hidden',
          backgroundColor: '#FFFFFF',
          border: isLarge ? '3.5px solid rgba(255, 255, 255, 0.9)' : '1.5px solid rgba(255, 255, 255, 0.4)',
          boxShadow: isLarge 
            ? '0 12px 32px rgba(0, 0, 0, 0.35), 0 4px 10px rgba(0, 0, 0, 0.2)' 
            : '0 2px 6px rgba(0, 0, 0, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.2s ease'
        }}
      >
        <img 
          src={logoImg} 
          alt="Waattasaattam Logo" 
          style={{ width: '100%', height: '100%', objectFit: 'contain' }} 
        />
      </div>

      {showText && (
        <div className="brand-title-group" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
          <span 
            className="brand-title-primary" 
            style={{ 
              color: navyColor, 
              fontSize: `${Math.round(size * 0.44)}px`,
              fontWeight: 800,
              letterSpacing: '-0.02em',
              fontFamily: "'Plus Jakarta Sans', sans-serif"
            }}
          >
            Waattasaattam
          </span>
          <span 
            className="brand-title-sub" 
            style={{ 
              color: orangeColor, 
              fontSize: `${Math.max(10, Math.round(size * 0.3))}px`,
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase'
            }}
          >
            Admin Portal
          </span>
        </div>
      )}
    </div>
  );
}
