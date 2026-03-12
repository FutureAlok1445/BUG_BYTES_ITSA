import React, { useState, useEffect, useRef } from 'react';
import { THEME } from '../../styles/theme';

const TypewriterText = ({ text, speed = 15, onDone }) => {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    let i = 0;
    setDisplayed('');
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.substring(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        if (onDone) onDone();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, onDone]);
  return <span>{displayed}</span>;
};

const ChatWindow = ({ messages }) => {
  const bottomRef = useRef(null);
  const [typingStates, setTypingStates] = useState({});

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingStates]);

  const handleTypeDone = (idx) => {
    setTypingStates(prev => ({ ...prev, [idx]: true }));
  };

  return (
    <div style={{
      height: '420px',
      overflowY: 'auto',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }} className="custom-scrollbar">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: ${THEME.COLORS.primary}40; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: ${THEME.COLORS.primary}80; }
      `}</style>

      {messages.map((msg, idx) => {
        const isUser = msg.role === 'user';
        const isLatestAI = !isUser && idx === messages.length - 1;
        const isTyped = typingStates[idx];

        return (
          <div key={idx} style={{
            display: 'flex',
            flexDirection: isUser ? 'row-reverse' : 'row',
            gap: '10px',
            alignItems: 'flex-start'
          }}>
            {/* AI avatar */}
            {!isUser && (
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                backgroundColor: THEME.COLORS.bg,
                border: `2px solid ${THEME.COLORS.primary}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                flexShrink: 0
              }}>
                🤖
              </div>
            )}

            <div style={{
              maxWidth: '75%',
              padding: '12px 16px',
              fontFamily: THEME.FONTS.heading,
              fontSize: '14px',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
              ...(isUser ? {
                backgroundColor: THEME.COLORS.primary,
                color: '#0a0a0a',
                borderRadius: '12px 12px 0 12px',
              } : {
                backgroundColor: '#1a1a1a',
                color: '#FFFFFF',
                border: `1px solid #222`,
                borderRadius: '0 12px 12px 12px',
                boxShadow: '2px 2px 0px #00FF8730',
              })
            }}>
              {isUser || !isLatestAI || isTyped ? (
                msg.text
              ) : (
                <TypewriterText text={msg.text} speed={15} onDone={() => handleTypeDone(idx)} />
              )}
            </div>
          </div>
        );
      })}

      {/* Typing indicator */}
      {messages.length > 0 && messages[messages.length - 1].role === 'loading' && (
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            backgroundColor: THEME.COLORS.bg, border: `2px solid ${THEME.COLORS.primary}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px'
          }}>🤖</div>
          <div style={{ display: 'flex', gap: '6px', padding: '12px 16px' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: '8px', height: '8px', borderRadius: '50%',
                backgroundColor: THEME.COLORS.primary,
                animation: `bounce 1.2s infinite ${i * 0.2}s`
              }} />
            ))}
          </div>
          <style>{`
            @keyframes bounce {
              0%, 60%, 100% { transform: translateY(0); }
              30% { transform: translateY(-8px); }
            }
          `}</style>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
};

export default ChatWindow;
