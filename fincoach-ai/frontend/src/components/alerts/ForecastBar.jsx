import React, { useState, useEffect } from 'react';
import { THEME } from '../../styles/theme';

const ForecastBar = ({ forecast, income, spent }) => {
  const [animWidth, setAnimWidth] = useState(0);
  const pct = income > 0 ? Math.min((spent / income) * 100, 100) : 0;

  const remaining = income - spent;
  const isDeficit = remaining < 0;

  let fillColor = THEME.COLORS.primary;
  if (pct >= 90) fillColor = THEME.COLORS.danger;
  else if (pct >= 75) fillColor = THEME.COLORS.warning;

  const daysLeft = Math.max(1, 30 - new Date().getDate());
  const dailySpend = spent > 0 ? Math.round(spent / Math.max(1, new Date().getDate())) : 0;

  useEffect(() => {
    const timer = setTimeout(() => setAnimWidth(pct), 300);
    return () => clearTimeout(timer);
  }, [pct]);

  return (
    <div style={{
      backgroundColor: THEME.COLORS.surface,
      border: `1px solid ${THEME.COLORS.border}`,
      borderRadius: THEME.BORDER_RADIUS.lg,
      padding: '24px'
    }}>
      <h3 style={{
        fontFamily: THEME.FONTS.heading,
        fontSize: '18px',
        fontWeight: 700,
        color: THEME.COLORS.text,
        marginBottom: '16px'
      }}>
        📅 Month-End Forecast
      </h3>

      {/* Large Number */}
      <p style={{
        fontFamily: THEME.FONTS.mono,
        fontSize: '32px',
        fontWeight: 700,
        color: isDeficit ? THEME.COLORS.danger : THEME.COLORS.primary,
        marginBottom: '20px'
      }}>
        ₹{Math.abs(remaining).toLocaleString('en-IN')} {isDeficit ? 'deficit' : 'remaining'}
      </p>

      {/* Progress Bar */}
      <div style={{
        width: '100%',
        height: '20px',
        backgroundColor: THEME.COLORS.surfaceHover,
        borderRadius: '10px',
        overflow: 'hidden',
        marginBottom: '16px'
      }}>
        <div style={{
          height: '100%',
          width: `${animWidth}%`,
          backgroundColor: fillColor,
          borderRadius: '10px',
          transition: 'width 1s ease-out',
          boxShadow: `0 0 10px ${fillColor}40`
        }} />
      </div>

      {/* 3 Stats Row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: '8px'
      }}>
        <span style={{ fontFamily: THEME.FONTS.mono, fontSize: '12px', color: THEME.COLORS.muted }}>
          Spent: <span style={{ color: THEME.COLORS.text }}>₹{spent.toLocaleString('en-IN')}</span>
        </span>
        <span style={{ fontFamily: THEME.FONTS.mono, fontSize: '12px', color: THEME.COLORS.muted }}>
          Daily: <span style={{ color: THEME.COLORS.text }}>₹{dailySpend.toLocaleString('en-IN')}/day</span>
        </span>
        <span style={{ fontFamily: THEME.FONTS.mono, fontSize: '12px', color: THEME.COLORS.muted }}>
          Days left: <span style={{ color: THEME.COLORS.text }}>{daysLeft}</span>
        </span>
      </div>
    </div>
  );
};

export default ForecastBar;
