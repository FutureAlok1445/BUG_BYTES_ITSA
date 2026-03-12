import React from 'react';
import { motion } from 'framer-motion';
import { THEME } from '../../styles/theme';

import PersonalityCard from './PersonalityCard';
import InsightsPanel from './InsightsPanel';
import ChatWindow from './ChatWindow';

const AICoach = ({ data }) => {
  if (!data) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ padding: '32px 24px', position: 'relative' }}
    >
      {/* Background ambient glow */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '-10%',
        width: '500px',
        height: '500px',
        background: `radial-gradient(circle, ${THEME.COLORS.primaryDim} 0%, transparent 60%)`,
        filter: 'blur(80px)',
        zIndex: -1,
        pointerEvents: 'none'
      }} />

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          fontFamily: THEME.FONTS.heading,
          fontSize: '36px',
          fontWeight: 800,
          marginBottom: '8px'
        }}>
          AI Fin<span style={{ color: THEME.COLORS.primary }}>Coach</span>
        </h1>
        <p style={{ color: THEME.COLORS.textSecondary }}>
          Personalized guidance based on your financial habits.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(350px, 400px) 1fr',
        gap: '32px',
        alignItems: 'start'
      }}>
        {/* Left Column: Personality & Insights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <PersonalityCard profile={data.profile} />
          <InsightsPanel fallbackData={null} />
        </div>

        {/* Right Column: Chat Window */}
        <div style={{ height: '100%' }}>
          <ChatWindow />
        </div>
      </div>

    </motion.div>
  );
};

export default AICoach;
