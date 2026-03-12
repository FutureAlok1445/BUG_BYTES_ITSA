import React from 'react';
import { THEME } from '../../styles/theme';

const Header = ({ activeTab, onTabChange, userData, onReportDownload }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'coach', label: 'AI Coach' },
    { id: 'alerts', label: 'Alerts & Goals' }
  ];

  const first_name = userData?.name?.split(' ')[0] || 'User';

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '64px',
      backgroundColor: 'rgba(10,10,10,0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: `1px solid ${THEME.COLORS.border}`,
      zIndex: 1000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px'
    }}>
      
      {/* Left: Logo */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{
          fontFamily: THEME.FONTS.heading,
          fontSize: '20px',
          fontWeight: 800,
          color: THEME.COLORS.primary,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span>💰</span> FinCoach
        </div>
        <div style={{
          fontFamily: THEME.FONTS.mono,
          fontSize: '10px',
          color: THEME.COLORS.muted,
          letterSpacing: '0.5px',
          textTransform: 'uppercase'
        }}>
          AI Financial Coach
        </div>
      </div>

      {/* Center: Tabs */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              style={{
                background: isActive ? THEME.COLORS.primary : 'transparent',
                color: isActive ? '#000000' : THEME.COLORS.textSecondary,
                border: 'none',
                padding: '8px 20px',
                borderRadius: THEME.BORDER_RADIUS.sm,
                fontFamily: THEME.FONTS.heading,
                fontSize: '14px',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: isActive ? THEME.SHADOWS.brutalist : 'none',
                transform: isActive ? 'translate(-2px, -2px)' : 'none'
              }}
              onMouseEnter={(e) => {
                if(!isActive) {
                  e.currentTarget.style.color = THEME.COLORS.text;
                  e.currentTarget.style.background = THEME.COLORS.surfaceHover;
                }
              }}
              onMouseLeave={(e) => {
                if(!isActive) {
                  e.currentTarget.style.color = THEME.COLORS.textSecondary;
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Right: User & Action */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        
        {/* User Chip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ 
            width: '8px', 
            height: '8px', 
            borderRadius: '50%', 
            background: THEME.COLORS.primary,
            boxShadow: THEME.SHADOWS.glow
          }}></div>
          
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>
              {first_name}
            </span>
            <span style={{ 
              fontSize: '11px', 
              color: THEME.COLORS.accent,
              fontFamily: THEME.FONTS.mono
            }}>
              🔥 {userData?.streak_days} days
            </span>
          </div>
        </div>

        {/* Report Button */}
        <button 
          onClick={onReportDownload}
          style={{
            background: THEME.COLORS.surface,
            border: `1px solid ${THEME.COLORS.border}`,
            color: THEME.COLORS.text,
            padding: '8px 16px',
            borderRadius: THEME.BORDER_RADIUS.sm,
            fontFamily: THEME.FONTS.body,
            fontSize: '13px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = THEME.COLORS.primary;
            e.currentTarget.style.color = THEME.COLORS.primary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = THEME.COLORS.border;
            e.currentTarget.style.color = THEME.COLORS.text;
          }}
        >
          📄 Report
        </button>

      </div>
    </header>
  );
};

export default Header;
