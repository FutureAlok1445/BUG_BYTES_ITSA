/**
 * FinCoach AI — Global Theme Configuration
 */

export const THEME = {
  COLORS: {
    bg: '#0a0a0a',
    surface: '#111111',
    surfaceHover: '#1a1a1a',
    border: '#222222',
    primary: '#00FF87',        // electric green (main accent)
    primaryDim: '#00FF8720',   // transparent green (backgrounds)
    accent: '#FF6B35',         // orange (warnings, highlights)
    danger: '#FF3B5C',         // red (critical alerts)
    warning: '#FFB800',        // yellow (caution)
    success: '#00FF87',        // same as primary
    muted: '#666666',
    text: '#F0F0F0',
    textSecondary: '#999999'
  },
  FONTS: {
    heading: "'Space Grotesk', sans-serif",
    body: "'Inter', sans-serif",
    mono: "'Space Mono', monospace"
  },
  SHADOWS: {
    brutalist: '4px 4px 0px #00FF87',
    brutalistRed: '4px 4px 0px #FF3B5C',
    brutalistOrange: '4px 4px 0px #FF6B35',
    glow: '0 0 30px #00FF8730',
    card: '0 4px 24px rgba(0,0,0,0.4)'
  },
  CHART_COLORS: [
    '#00FF87', '#FF6B35', '#FFB800', '#FF3B5C',
    '#00D4FF', '#A855F7', '#F472B6'
  ],
  BORDER_RADIUS: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px'
  }
};
