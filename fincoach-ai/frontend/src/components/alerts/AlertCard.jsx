import React, { useState, useEffect } from 'react';
import { THEME } from '../../styles/theme';

const TYPE_CONFIG = {
  danger: {
    bg: '#FF3B5C15', border: '#FF3B5C', shadow: '#FF3B5C',
    badge: '🔴 CRITICAL', pulse: true
  },
  warning: {
    bg: '#FFB80015', border: '#FFB800', shadow: '#FFB800',
    badge: '🟡 WARNING', pulse: false
  },
  success: {
    bg: '#00FF8715', border: '#00FF87', shadow: '#00FF87',
    badge: '✅ GOOD', pulse: false
  },
  info: {
    bg: '#00D4FF15', border: '#00D4FF', shadow: '#00D4FF',
    badge: 'ℹ️ INFO', pulse: false
  }
};

const AlertCard = ({ type, msg, index = 0 }) => {
  const [visible, setVisible] = useState(false);
  const config = TYPE_CONFIG[type] || TYPE_CONFIG.info;

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), index * 100);
    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div style={{
      backgroundColor: config.bg,
      borderLeft: `4px solid ${config.border}`,
      borderTop: `1px solid ${config.border}30`,
      borderRight: `1px solid ${config.border}30`,
      borderBottom: `1px solid ${config.border}30`,
      borderRadius: `0 ${THEME.BORDER_RADIUS.md} ${THEME.BORDER_RADIUS.md} 0`,
      boxShadow: `2px 2px 0px ${config.shadow}30`,
      padding: '16px 20px',
      transform: visible ? 'translateX(0)' : 'translateX(-20px)',
      opacity: visible ? 1 : 0,
      transition: 'all 0.4s ease',
      animation: config.pulse ? 'alertPulse 2s infinite' : 'none'
    }}>
      <style>{`
        @keyframes alertPulse {
          0%, 100% { border-left-color: ${config.border}; }
          50% { border-left-color: ${config.border}60; }
        }
      `}</style>

      <div style={{
        fontFamily: THEME.FONTS.mono,
        fontSize: '11px',
        fontWeight: 700,
        color: config.border,
        textTransform: 'uppercase',
        letterSpacing: '2px',
        marginBottom: '8px'
      }}>
        {config.badge}
      </div>

      <p style={{
        fontFamily: THEME.FONTS.body,
        fontSize: '14px',
        color: THEME.COLORS.text,
        lineHeight: 1.5
      }}>
        {msg}
      </p>
    </div>
  );
};

export default AlertCard;
