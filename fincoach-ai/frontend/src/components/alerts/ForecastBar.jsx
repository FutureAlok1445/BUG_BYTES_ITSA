import React from 'react';
import { motion } from 'framer-motion';
import { THEME } from '../../styles/theme';

const ForecastBar = ({ data }) => {
  if (!data?.weekly_budget) return null;

  const { this_week_budget, this_week_spent } = data.weekly_budget;
  
  const percentage = Math.min((this_week_spent / this_week_budget) * 100, 100);
  
  let statusColor = THEME.COLORS.primary;
  if (percentage > 90) statusColor = THEME.COLORS.danger;
  else if (percentage > 75) statusColor = THEME.COLORS.warning;

  return (
    <div style={{
      backgroundColor: THEME.COLORS.surface,
      border: `1px solid ${THEME.COLORS.border}`,
      borderRadius: THEME.BORDER_RADIUS.lg,
      padding: '24px',
      marginBottom: '24px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ 
          fontFamily: THEME.FONTS.heading, 
          color: THEME.COLORS.text,
          fontSize: '18px'
        }}>
          Weekly Budget Pacing
        </h3>
        <span className="number-font" style={{ 
          color: statusColor,
          fontSize: '16px',
          fontWeight: 700
        }}>
          ₹{this_week_spent.toLocaleString('en-IN')} / ₹{this_week_budget.toLocaleString('en-IN')}
        </span>
      </div>

      <div style={{
        width: '100%',
        height: '12px',
        backgroundColor: THEME.COLORS.surfaceHover,
        borderRadius: '6px',
        overflow: 'hidden',
        position: 'relative'
      }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{
            height: '100%',
            backgroundColor: statusColor,
            borderRadius: '6px',
            boxShadow: `0 0 10px ${statusColor}40`
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
        <p style={{ 
          fontSize: '13px', 
          color: THEME.COLORS.textSecondary 
        }}>
          {percentage.toFixed(1)}% consumed
        </p>
        <p style={{ 
          fontSize: '13px', 
          color: THEME.COLORS.textSecondary 
        }}>
          Safe to spend today: <span className="number-font" style={{ color: THEME.COLORS.text }}>₹{data.weekly_budget.daily_safe_limit}</span>
        </p>
      </div>
    </div>
  );
};

export default ForecastBar;
