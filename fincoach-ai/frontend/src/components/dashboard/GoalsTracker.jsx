import React from 'react';
import { THEME } from '../../styles/theme';
import { useScrollReveal } from '../../hooks/useScrollReveal';
import { motion } from 'framer-motion';

const GoalsTracker = ({ goals }) => {
  const revealRef = useScrollReveal(0.3);

  if (!goals || goals.length === 0) {
    return null;
  }

  return (
    <div 
      ref={revealRef}
      className="reveal"
      style={{
        backgroundColor: THEME.COLORS.surface,
        border: `1px solid ${THEME.COLORS.border}`,
        borderRadius: THEME.BORDER_RADIUS.lg,
        padding: '24px',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h3 style={{ 
            fontFamily: THEME.FONTS.heading, 
            color: THEME.COLORS.text,
            marginBottom: '4px',
            fontSize: '18px'
          }}>
            Active Goals
          </h3>
          <p style={{ 
            color: THEME.COLORS.textSecondary,
            fontSize: '14px'
          }}>
            Your journey to financial targets
          </p>
        </div>
        <button style={{
          background: 'transparent',
          color: THEME.COLORS.primary,
          border: `1px solid ${THEME.COLORS.primary}`,
          padding: '6px 12px',
          borderRadius: THEME.BORDER_RADIUS.sm,
          fontFamily: THEME.FONTS.body,
          fontSize: '13px',
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = THEME.COLORS.primaryDim;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
        >
          + Add Goal
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {goals.map((goal, index) => {
          // Progress can be > 100 if they over-saved
          const actualProgress = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
          const isComplete = actualProgress >= 100;

          return (
            <div key={index} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ 
                  color: THEME.COLORS.text, 
                  fontFamily: THEME.FONTS.heading,
                  fontWeight: 600,
                  fontSize: '15px'
                }}>
                  {goal.name} {isComplete && '✅'}
                </span>
                <span className="number-font" style={{ 
                  color: isComplete ? THEME.COLORS.success : THEME.COLORS.textSecondary,
                  fontSize: '14px'
                }}>
                  ₹{goal.current_amount.toLocaleString('en-IN')} / ₹{goal.target_amount.toLocaleString('en-IN')}
                </span>
              </div>
              
              <div style={{
                width: '100%',
                height: '8px',
                backgroundColor: THEME.COLORS.surfaceHover,
                borderRadius: '4px',
                overflow: 'hidden',
                position: 'relative'
              }}>
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${actualProgress}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: index * 0.1 }}
                  style={{
                    height: '100%',
                    backgroundColor: isComplete ? THEME.COLORS.success : THEME.COLORS.primary,
                    borderRadius: '4px',
                    boxShadow: THEME.SHADOWS.glow
                  }}
                />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ 
                  fontSize: '12px', 
                  color: THEME.COLORS.textSecondary,
                  fontFamily: THEME.FONTS.mono
                }}>
                  Target: {new Date(goal.deadline).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                </span>
                <span style={{ 
                  fontSize: '12px', 
                  color: isComplete ? THEME.COLORS.success : THEME.COLORS.primary,
                  fontFamily: THEME.FONTS.mono,
                  fontWeight: 700
                }}>
                  {Math.round(actualProgress)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default GoalsTracker;
