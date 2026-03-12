import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { THEME } from '../../styles/theme';

const PersonalityCard = ({ profile }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const personality = profile?.personality_type || "Analyzer";
  
  // Mapping personalities to emojis and descriptions
  const personalityData = {
    "Impulsive Spender": { emoji: "🌪️", desc: "You tend to make quick purchasing decisions based on emotion rather than planning." },
    "Frugal Saver": { emoji: "🛡️", desc: "You are highly protective of your money and prioritize saving over spending." },
    "Analyzer": { emoji: "🧠", desc: "You carefully weigh every financial decision and track your expenses meticulously." },
    "Balanced": { emoji: "⚖️", desc: "You maintain a healthy equilibrium between enjoying today and saving for tomorrow." }
  };

  const data = personalityData[personality] || { emoji: "👤", desc: "Learning your financial habits..." };

  return (
    <div 
      style={{
        backgroundColor: 'transparent',
        perspective: '1000px',
        height: '250px',
        width: '100%',
        cursor: 'pointer'
      }}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d'
        }}
      >
        {/* Front of Card */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backfaceVisibility: 'hidden',
          backgroundColor: THEME.COLORS.surface,
          border: `2px solid ${THEME.COLORS.primary}`,
          borderRadius: THEME.BORDER_RADIUS.lg,
          boxShadow: THEME.SHADOWS.brutalist,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center'
        }}>
          <h3 style={{ 
            fontFamily: THEME.FONTS.heading, 
            color: THEME.COLORS.textSecondary,
            fontSize: '14px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '16px'
          }}>
            Financial Persona
          </h3>
          <div style={{ fontSize: '64px', marginBottom: '16px', filter: 'drop-shadow(0 0 10px rgba(0,255,135,0.3))' }}>
            {data.emoji}
          </div>
          <div style={{ 
            fontFamily: THEME.FONTS.heading,
            fontSize: '24px',
            fontWeight: 700,
            color: THEME.COLORS.primary
          }}>
            {personality}
          </div>
          <p style={{ 
            color: THEME.COLORS.textSecondary, 
            fontSize: '12px', 
            marginTop: '16px',
            opacity: 0.7 
          }}>
            Click to flip
          </p>
        </div>

        {/* Back of Card */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backfaceVisibility: 'hidden',
          backgroundColor: THEME.COLORS.primary,
          border: `2px solid ${THEME.COLORS.primary}`,
          borderRadius: THEME.BORDER_RADIUS.lg,
          boxShadow: THEME.SHADOWS.brutalist,
          transform: 'rotateY(180deg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          textAlign: 'center',
          color: '#000000'
        }}>
          <h3 style={{ 
            fontFamily: THEME.FONTS.heading, 
            fontSize: '18px',
            fontWeight: 800,
            marginBottom: '16px'
          }}>
            Behavior Analysis
          </h3>
          <p style={{ 
            fontFamily: THEME.FONTS.body,
            fontSize: '14px',
            fontWeight: 500,
            lineHeight: 1.6
          }}>
            {data.desc}
          </p>
          <div style={{ 
            marginTop: '24px',
            padding: '8px 16px',
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 600,
            fontFamily: THEME.FONTS.mono
          }}>
            AI Assessed
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PersonalityCard;
