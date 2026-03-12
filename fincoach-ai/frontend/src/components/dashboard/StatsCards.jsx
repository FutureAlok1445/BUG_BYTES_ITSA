import React from 'react';
import { THEME } from '../../styles/theme';
import { useScrollReveal } from '../../hooks/useScrollReveal';

const StatsCards = ({ income, spent, saved, forecast }) => {
  const cards = [
    { title: 'Total Income', value: income, color: THEME.COLORS.primary, prefix: '₹' },
    { title: 'Total Spent', value: spent, color: THEME.COLORS.text, prefix: '₹' },
    { title: 'Total Saved', value: saved, color: THEME.COLORS.primary, prefix: '₹' },
    { title: 'Forecast (Month End)', value: forecast, color: THEME.COLORS.accent, prefix: '₹' }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '24px',
      marginBottom: '32px'
    }}>
      {cards.map((card, idx) => {
        const revealRef = useScrollReveal(0.1);
        
        return (
          <div 
            key={idx}
            ref={revealRef}
            className="reveal"
            style={{
              backgroundColor: THEME.COLORS.surface,
              border: `1px solid ${THEME.COLORS.border}`,
              borderRadius: THEME.BORDER_RADIUS.lg,
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              transition: 'all 0.3s ease',
              transitionDelay: `${idx * 0.1}s` // staggered entry
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = card.color;
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = `0 10px 20px ${THEME.COLORS.bg}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = THEME.COLORS.border;
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ 
              color: THEME.COLORS.textSecondary, 
              fontSize: '14px',
              fontFamily: THEME.FONTS.heading,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {card.title}
            </div>
            <div 
              className="number-font"
              style={{ 
                color: card.color, 
                fontSize: '32px',
                fontWeight: 700
              }}
            >
              {card.prefix}{card.value.toLocaleString('en-IN')}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
