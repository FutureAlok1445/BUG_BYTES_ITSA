import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { THEME } from '../../styles/theme';

const MESSAGES = [
  "Analyzing your finances...",
  "Calculating FinScore...",
  "Loading insights...",
  "Preparing your coach..."
];

const LoadingScreen = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    // Message rotation
    const msgInterval = setInterval(() => {
      setMsgIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 400);

    // Percentage counter
    const startTime = Date.now();
    const duration = 1500; // 1.5 seconds

    const animateProgress = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const newProgress = Math.min((elapsed / duration) * 100, 100);
      
      setProgress(newProgress);

      if (elapsed < duration) {
        requestAnimationFrame(animateProgress);
      } else {
        setTimeout(onComplete, 200); // Small delay before unmounting
      }
    };

    requestAnimationFrame(animateProgress);

    return () => clearInterval(msgInterval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: THEME.COLORS.bg,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          style={{ fontSize: '64px', marginBottom: '24px' }}
        >
          💰
        </motion.div>

        <h1 style={{
          fontFamily: THEME.FONTS.heading,
          color: THEME.COLORS.primary,
          fontSize: '32px',
          fontWeight: 800,
          marginBottom: '32px',
          letterSpacing: '-0.5px'
        }}>
          FinCoach AI
        </h1>

        <div style={{
          fontFamily: THEME.FONTS.mono,
          fontSize: '48px',
          color: THEME.COLORS.text,
          fontWeight: 700,
          marginBottom: '16px'
        }}>
          {Math.floor(progress)}%
        </div>

        <div style={{
          width: '300px',
          height: '2px',
          backgroundColor: THEME.COLORS.surfaceHover,
          borderRadius: '2px',
          overflow: 'hidden',
          marginBottom: '24px'
        }}>
          <motion.div
            style={{
              height: '100%',
              backgroundColor: THEME.COLORS.primary,
              width: `${progress}%`,
              boxShadow: THEME.SHADOWS.glow
            }}
          />
        </div>

        <motion.p
          key={msgIndex}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.2 }}
          style={{
            fontFamily: THEME.FONTS.mono,
            color: THEME.COLORS.primary,
            fontSize: '14px',
            opacity: 0.8
          }}
        >
          &gt; {MESSAGES[msgIndex]}
        </motion.p>

      </motion.div>
    </AnimatePresence>
  );
};

export default LoadingScreen;
