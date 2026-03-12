import React, { useState } from 'react';
import { THEME } from '../../styles/theme';

const PERSONALITY_MAP = {
  "Impulsive Spender": {
    emoji: "🛍️",
    color: "#FF3B5C",
    desc: "Weekend spending 3x higher than weekdays",
    tip: "Wait 24hrs before any purchase over ₹500"
  },
  "Consistent Saver": {
    emoji: "💚",
    color: "#00FF87",
    desc: "Regular habits. Focus on investing surplus.",
    tip: "Automate investments on salary day"
  },
  "Irregular Earner": {
    emoji: "🌊",
    color: "#FFB800",
    desc: "Income fluctuates. Standard budgeting fails.",
    tip: "Use weekly micro-budgets instead of monthly"
  }
};

const PersonalityCard = ({ personality_type, finscore }) => {
  const [hovered, setHovered] = useState(false);
  const data = PERSONALITY_MAP[personality_type] || PERSONALITY_MAP["Impulsive Spender"];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          perspective: '1000px',
          width: '340px',
          height: '260px',
          cursor: 'pointer'
        }}
      >
        <div style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.6s',
          transform: hovered ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}>
          {/* FRONT */}
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            backgroundColor: data.color + '18',
            border: `2px solid ${data.color}`,
            borderRadius: THEME.BORDER_RADIUS.lg,
            boxShadow: `6px 6px 0px ${data.color}`,
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'flex-start',
            gap: '8px'
          }}>
            {/* FinScore badge top-right */}
            <div style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              backgroundColor: data.color + '30',
              border: `1px solid ${data.color}`,
              borderRadius: '20px',
              padding: '4px 12px',
              fontFamily: THEME.FONTS.mono,
              fontSize: '13px',
              fontWeight: 700,
              color: data.color
            }}>
              {finscore}/100
            </div>

            <div style={{ fontSize: '48px' }}>{data.emoji}</div>
            <p style={{
              fontFamily: THEME.FONTS.body,
              fontSize: '12px',
              color: THEME.COLORS.muted,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              marginTop: '4px'
            }}>
              You are:
            </p>
            <p style={{
              fontFamily: THEME.FONTS.heading,
              fontSize: '22px',
              fontWeight: 700,
              color: data.color
            }}>
              {personality_type}
            </p>
            <p style={{
              fontFamily: THEME.FONTS.body,
              fontSize: '14px',
              color: THEME.COLORS.muted,
              lineHeight: 1.5
            }}>
              {data.desc}
            </p>
          </div>

          {/* BACK */}
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            backgroundColor: '#111111',
            border: `2px solid ${data.color}`,
            borderRadius: THEME.BORDER_RADIUS.lg,
            boxShadow: `6px 6px 0px ${data.color}`,
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            gap: '16px'
          }}>
            <p style={{
              fontFamily: THEME.FONTS.heading,
              fontSize: '14px',
              color: THEME.COLORS.primary,
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              💡 Your Coaching Tip:
            </p>
            <p style={{
              fontFamily: THEME.FONTS.body,
              fontSize: '16px',
              color: '#FFFFFF',
              lineHeight: 1.6
            }}>
              {data.tip}
            </p>
            <p style={{
              fontFamily: THEME.FONTS.body,
              fontSize: '13px',
              color: THEME.COLORS.primary,
              cursor: 'pointer',
              marginTop: '12px'
            }}>
              Ask your coach about this →
            </p>
          </div>
        </div>
      </div>
      <p style={{
        fontFamily: THEME.FONTS.body,
        fontSize: '12px',
        color: THEME.COLORS.muted,
        marginTop: '12px'
      }}>
        Hover to reveal your tip →
      </p>
    </div>
  );
};

export default PersonalityCard;
