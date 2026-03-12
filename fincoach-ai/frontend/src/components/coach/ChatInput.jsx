import React, { useState } from 'react';
import { THEME } from '../../styles/theme';

const SUGGESTION_CHIPS = [
  "💰 How to save more this month?",
  "🏍️ Bike ke liye kaise save karu?",
  "📊 Meri spending kaise theek karu?"
];

const ChatInput = ({ onSend, loading }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    onSend(input.trim());
    setInput('');
  };

  const handleChipClick = (chip) => {
    if (loading) return;
    onSend(chip);
  };

  return (
    <div>
      {/* Suggestion Chips */}
      <div style={{
        display: 'flex',
        gap: '8px',
        marginBottom: '12px',
        flexWrap: 'wrap'
      }}>
        {SUGGESTION_CHIPS.map((chip, i) => (
          <button
            key={i}
            onClick={() => handleChipClick(chip)}
            disabled={loading}
            style={{
              background: 'transparent',
              border: `1px solid #222`,
              borderRadius: '20px',
              padding: '6px 14px',
              fontFamily: THEME.FONTS.mono,
              fontSize: '12px',
              color: THEME.COLORS.muted,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              opacity: loading ? 0.5 : 1
            }}
            onMouseEnter={e => {
              if (!loading) {
                e.currentTarget.style.borderColor = THEME.COLORS.primary;
                e.currentTarget.style.color = THEME.COLORS.primary;
              }
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#222';
              e.currentTarget.style.color = THEME.COLORS.muted;
            }}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Row */}
      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask your FinCoach anything..."
          disabled={loading}
          style={{
            flex: 1,
            backgroundColor: THEME.COLORS.bg,
            border: `2px solid #222`,
            borderRadius: THEME.BORDER_RADIUS.md,
            padding: '14px 16px',
            color: THEME.COLORS.text,
            fontFamily: THEME.FONTS.body,
            fontSize: '14px',
            outline: 'none',
            transition: 'all 0.2s',
          }}
          onFocus={e => {
            e.target.style.borderColor = THEME.COLORS.primary;
            e.target.style.boxShadow = `0 0 0 3px ${THEME.COLORS.primary}20`;
          }}
          onBlur={e => {
            e.target.style.borderColor = '#222';
            e.target.style.boxShadow = 'none';
          }}
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          style={{
            width: '52px',
            height: '52px',
            backgroundColor: !input.trim() || loading ? THEME.COLORS.border : THEME.COLORS.primary,
            color: '#0a0a0a',
            border: 'none',
            borderRadius: THEME.BORDER_RADIUS.md,
            boxShadow: !input.trim() || loading ? 'none' : '3px 3px 0px #00CC6A',
            cursor: !input.trim() || loading ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            transition: 'all 0.2s',
            flexShrink: 0
          }}
          onMouseEnter={e => {
            if (input.trim() && !loading) {
              e.currentTarget.style.transform = 'translate(-1px,-1px)';
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translate(0,0)';
          }}
        >
          {loading ? (
            <div style={{
              width: '20px', height: '20px',
              border: '3px solid #0a0a0a40',
              borderTopColor: '#0a0a0a',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite'
            }} />
          ) : '➤'}
          <style>{`
            @keyframes spin { to { transform: rotate(360deg); } }
          `}</style>
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
