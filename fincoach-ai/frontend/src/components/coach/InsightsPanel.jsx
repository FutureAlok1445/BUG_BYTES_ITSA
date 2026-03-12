import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { THEME } from '../../styles/theme';
import { getInsights } from '../../api';

const InsightsPanel = ({ fallbackData }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    // Simulate typewriter effect text gradually appearing
    const fetchAI = async () => {
      setLoading(true);
      const res = await getInsights();
      if (isMounted) {
        if (res && res.insights) {
          setInsights(res.insights);
        } else {
          setInsights(fallbackData || "Analyzing your spending patterns... Based on your recent transactions, consider cutting down on dining out to boost your savings rate this month.");
        }
        setLoading(false);
      }
    };
    
    fetchAI();
    return () => { isMounted = false; };
  }, [fallbackData]);

  // Typewriter effect setup
  const insightsText = insights || "";
  const words = insightsText.split(" ");

  return (
    <div style={{
      backgroundColor: THEME.COLORS.surface,
      border: `1px solid ${THEME.COLORS.border}`,
      borderRadius: THEME.BORDER_RADIUS.lg,
      padding: '32px',
      position: 'relative',
      overflow: 'hidden',
      height: '100%',
      minHeight: '250px'
    }}>
      {/* Decorative quotes */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        fontSize: '80px',
        color: THEME.COLORS.primaryDim,
        fontFamily: THEME.FONTS.heading,
        fontWeight: 800,
        lineHeight: 0.5,
        opacity: 0.3,
        pointerEvents: 'none'
      }}>
        "
      </div>

      <h3 style={{ 
        fontFamily: THEME.FONTS.heading, 
        color: THEME.COLORS.text,
        fontSize: '20px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span style={{ color: THEME.COLORS.primary }}>✨</span> 
        Deep Dive Insights
      </h3>

      <div style={{ 
        fontFamily: THEME.FONTS.body,
        fontSize: '16px',
        color: THEME.COLORS.text,
        lineHeight: 1.8,
        position: 'relative',
        zIndex: 1
      }}>
        {loading ? (
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            style={{ color: THEME.COLORS.textSecondary }}
          >
            Groq LLaMA3 is analyzing your transaction history...
          </motion.div>
        ) : (
          <p>
            {words.map((word, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 0.2,
                  delay: i * 0.05 // Staggered word appearance
                }}
                style={{ 
                  display: 'inline-block',
                  marginRight: '0.25em'
                }}
              >
                {word}
              </motion.span>
            ))}
          </p>
        )}
      </div>
      
      {!loading && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: words.length * 0.05 + 0.5 }}
          style={{ 
            marginTop: '32px',
            fontSize: '12px',
            color: THEME.COLORS.textSecondary,
            fontFamily: THEME.FONTS.mono,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: THEME.COLORS.primary, boxShadow: THEME.SHADOWS.glow }}></div>
          Powered by Groq 70B & Elasticsearch
        </motion.div>
      )}
    </div>
  );
};

export default InsightsPanel;
