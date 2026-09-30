import React from 'react';

/**
 * StudentHealthLogo - Dual-tone brand logo matching design mockup
 * Colors: Navy #0E1B38 & Vibrant Orange #EB5A1D
 */
export default function StudentHealthLogo({ size = 44, showText = true, isWhite = false }) {
  const navyColor = isWhite ? '#FFFFFF' : '#0E1B38';
  const orangeColor = '#EB5A1D';

  return (
    <div className="brand-header-row" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <div 
        className="brand-logo-icon" 
        style={{ width: `${size}px`, height: `${size}px`, flexShrink: 0 }}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ width: '100%', height: '100%' }}
        >
          {/* Adult Figure in Navy */}
          <circle cx="36" cy="28" r="10" fill={navyColor} />
          <path
            d="M24 78C24 55 35 48 50 48C42 54 39 63 42 78H24Z"
            fill={navyColor}
          />
          {/* Child / Caring Arc Figure in Orange */}
          <circle cx="68" cy="24" r="11" fill={orangeColor} />
          <path
            d="M48 84C40 76 38 65 42 52C48 46 58 44 68 50C76 55 78 68 70 78C64 85 54 86 48 84Z"
            fill={orangeColor}
          />
          <path
            d="M32 76C40 84 55 88 74 72"
            stroke={orangeColor}
            strokeWidth="6"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {showText && (
        <div className="brand-title-group">
          <span 
            className="brand-title-primary" 
            style={{ color: navyColor, fontSize: `${Math.round(size * 0.44)}px` }}
          >
            Student Health
          </span>
          <span 
            className="brand-title-sub" 
            style={{ color: orangeColor, fontSize: `${Math.round(size * 0.33)}px` }}
          >
            Admin Portal
          </span>
        </div>
      )}
    </div>
  );
}
