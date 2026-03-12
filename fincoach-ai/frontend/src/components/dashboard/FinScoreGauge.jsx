import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { THEME } from '../../styles/theme';

const FinScoreGauge = ({ score }) => {
  const [animatedScore, setAnimatedScore] = useState(0);

  // Animating the score number
  useEffect(() => {
    let startTime;
    const duration = 1500;
    
    const animate = (time) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / duration, 1);
      
      // Easing function (easeOutExpo)
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      
      setAnimatedScore(Math.floor(easeProgress * score));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [score]);

  // Determine color based on score
  let scoreColor = THEME.COLORS.danger;
  let statusText = "Needs Work";
  
  if (score >= 70) {
    scoreColor = THEME.COLORS.success;
    statusText = "Excellent";
  } else if (score >= 40) {
    scoreColor = THEME.COLORS.warning;
    statusText = "Fair";
  }

  // SVG metrics for circular gauge
  const size = 200;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      backgroundColor: THEME.COLORS.surface,
      borderRadius: THEME.BORDER_RADIUS.xl,
      border: `1px solid ${THEME.COLORS.border}`,
      boxShadow: THEME.SHADOWS.card
    }}>
      <h3 style={{ 
        fontFamily: THEME.FONTS.heading, 
        color: THEME.COLORS.text,
        marginBottom: '20px',
        fontSize: '18px'
      }}>
        FinScore
      </h3>

      <div style={{ position: 'relative', width: size, height: size }}>
        {/* Background Circle */}
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={THEME.COLORS.border}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Animated Foreground Circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={scoreColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{
              strokeDasharray: circumference,
              filter: `drop-shadow(0 0 8px ${scoreColor}40)`
            }}
          />
        </svg>

        {/* Center Text Area */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span 
            className="number-font"
            style={{ 
              fontSize: '48px', 
              fontWeight: 700,
              color: scoreColor,
              lineHeight: 1
            }}
          >
            {animatedScore}
          </span>
          <span style={{ 
            fontSize: '12px', 
            color: THEME.COLORS.textSecondary,
            marginTop: '4px',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            / 100
          </span>
        </div>
      </div>

      <div style={{ 
        marginTop: '20px',
        padding: '6px 16px',
        borderRadius: '20px',
        backgroundColor: `${scoreColor}15`,
        color: scoreColor,
        fontSize: '14px',
        fontWeight: 600,
        fontFamily: THEME.FONTS.heading
      }}>
        {statusText}
      </div>
    </div>
  );
};

export default FinScoreGauge;
