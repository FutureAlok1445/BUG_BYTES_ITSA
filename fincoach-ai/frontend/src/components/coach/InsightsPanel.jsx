import React, { useState, useEffect } from 'react';
import { THEME } from '../../styles/theme';

const InsightsPanel = ({ insights, loading, is_fallback }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [cursorVisible, setCursorVisible] = useState(true);
  const [typingDone, setTypingDone] = useState(false);

  // Typewriter effect
  useEffect(() => {
    if (loading || !insights) {
      setDisplayedText('');
      setTypingDone(false);
      return;
    }

    let i = 0;
    setDisplayedText('');
    setTypingDone(false);

    const interval = setInterval(() => {
      if (i < insights.length) {
        setDisplayedText(insights.substring(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setTypingDone(true);
      }
    }, 15);

    return () => clearInterval(interval);
  }, [insights, loading]);

  // Blinking cursor
  useEffect(() => {
    if (typingDone) { setCursorVisible(false); return; }
    const blink = setInterval(() => setCursorVisible(v => !v), 500);
    return () => clearInterval(blink);
  }, [typingDone]);

  // Format lines with special prefixes
  const formatLine = (line, idx) => {
    let bgColor = 'transparent';
    if (line.startsWith('📊')) bgColor = 'rgba(168,85,247,0.08)';
    else if (line.startsWith('💡')) bgColor = 'rgba(0,255,135,0.08)';
    else if (line.startsWith('📅')) bgColor = 'rgba(0,212,255,0.08)';

    return (
      <div key={idx} style={{
        backgroundColor: bgColor,
        padding: bgColor !== 'transparent' ? '8px 12px' : '2px 0',
        borderRadius: '6px',
        marginBottom: '4px'
      }}>
        {line}
      </div>
    );
  };

  return (
    <div style={{
      backgroundColor: THEME.COLORS.surface,
      borderLeft: '4px solid #A855F7',
      borderTop: `1px solid ${THEME.COLORS.border}`,
      borderRight: `1px solid ${THEME.COLORS.border}`,
      borderBottom: `1px solid ${THEME.COLORS.border}`,
      borderRadius: `0 ${THEME.BORDER_RADIUS.lg} ${THEME.BORDER_RADIUS.lg} 0`,
      padding: '24px',
      height: '100%',
      minHeight: '260px',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <h3 style={{
          fontFamily: THEME.FONTS.heading,
          fontSize: '18px',
          fontWeight: 700,
          color: THEME.COLORS.text
        }}>
          🧠 AI Behavioral Analysis
        </h3>
        <span style={{
          backgroundColor: '#A855F720',
          color: '#A855F7',
          border: '1px solid #A855F740',
          padding: '2px 10px',
          borderRadius: '20px',
          fontSize: '11px',
          fontFamily: THEME.FONTS.mono,
          fontWeight: 600
        }}>
          ⚡ Groq AI
        </span>
        {is_fallback && (
          <span style={{
            backgroundColor: '#00D4FF20',
            color: '#00D4FF',
            border: '1px solid #00D4FF40',
            padding: '2px 10px',
            borderRadius: '20px',
            fontSize: '11px',
            fontFamily: THEME.FONTS.mono,
            fontWeight: 600
          }}>
            Demo Mode
          </span>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        {loading ? (
          <div>
            {/* Shimmer skeleton lines */}
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                height: '14px',
                marginBottom: '12px',
                borderRadius: '4px',
                width: i === 3 ? '60%' : '100%',
                background: `linear-gradient(90deg, ${THEME.COLORS.surfaceHover} 25%, #2a2a2a 50%, ${THEME.COLORS.surfaceHover} 75%)`,
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite'
              }} />
            ))}
            <p style={{
              fontFamily: THEME.FONTS.body,
              fontSize: '14px',
              color: THEME.COLORS.muted,
              marginTop: '16px',
              animation: 'pulse 2s infinite'
            }}>
              🤖 Analyzing your financial behavior...
            </p>
            <style>{`
              @keyframes shimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
              }
              @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
              }
            `}</style>
          </div>
        ) : (
          <div style={{
            fontFamily: THEME.FONTS.body,
            fontSize: '14px',
            color: THEME.COLORS.text,
            lineHeight: 1.8,
            whiteSpace: 'pre-wrap'
          }}>
            {displayedText.split('\n').map((line, idx) => formatLine(line, idx))}
            {!typingDone && (
              <span style={{
                color: THEME.COLORS.primary,
                fontWeight: 700,
                opacity: cursorVisible ? 1 : 0
              }}>|</span>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {!loading && typingDone && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '16px',
          paddingTop: '12px',
          borderTop: `1px solid ${THEME.COLORS.border}`
        }}>
          <span style={{
            fontFamily: THEME.FONTS.mono,
            fontSize: '11px',
            color: THEME.COLORS.muted
          }}>
            {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <button
            style={{
              background: 'transparent',
              border: `1px solid ${THEME.COLORS.border}`,
              color: THEME.COLORS.muted,
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontFamily: THEME.FONTS.body,
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = THEME.COLORS.primary;
              e.currentTarget.style.color = THEME.COLORS.primary;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = THEME.COLORS.border;
              e.currentTarget.style.color = THEME.COLORS.muted;
            }}
          >
            🔄 Regenerate
          </button>
        </div>
      )}
    </div>
  );
};

export default InsightsPanel;
