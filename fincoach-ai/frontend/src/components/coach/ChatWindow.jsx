import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User } from 'lucide-react';
import { THEME } from '../../styles/theme';
import { sendChat } from '../../api';

const ChatMessage = ({ message, isUser }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        gap: '12px',
        marginBottom: '24px',
        width: '100%'
      }}
    >
      <div style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        backgroundColor: isUser ? THEME.COLORS.primary : THEME.COLORS.surfaceHover,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        boxShadow: isUser ? THEME.SHADOWS.glow : 'none'
      }}>
        {isUser ? <User size={16} color="#000" /> : <Bot size={16} color={THEME.COLORS.primary} />}
      </div>

      <div style={{
        backgroundColor: isUser ? THEME.COLORS.primaryDim : THEME.COLORS.surfaceHover,
        border: `1px solid ${isUser ? THEME.COLORS.primary : THEME.COLORS.border}`,
        borderRadius: THEME.BORDER_RADIUS.lg,
        padding: '16px',
        maxWidth: '80%',
        color: THEME.COLORS.text,
        fontFamily: THEME.FONTS.body,
        fontSize: '14px',
        lineHeight: 1.6,
        whiteSpace: 'pre-wrap'
      }}>
        {message}
      </div>
    </motion.div>
  );
};

const ChatWindow = () => {
  const [messages, setMessages] = useState([
    { text: "Hi Ravi! I'm your AI FinCoach. Want to discuss how to save up faster for that New Bike, or analyze this week's food expenses?", isUser: false }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
    setIsLoading(true);

    const response = await sendChat(userMessage);
    
    setIsLoading(false);
    if (response && response.response) {
      setMessages(prev => [...prev, { text: response.response, isUser: false }]);
    } else {
      setMessages(prev => [...prev, { text: "I'm having trouble connecting to my servers right now. Can we try again later? 🔌", isUser: false }]);
    }
  };

  return (
    <div style={{
      backgroundColor: THEME.COLORS.surface,
      border: `1px solid ${THEME.COLORS.border}`,
      borderRadius: THEME.BORDER_RADIUS.lg,
      display: 'flex',
      flexDirection: 'column',
      height: '600px',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 24px',
        borderBottom: `1px solid ${THEME.COLORS.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        backgroundColor: THEME.COLORS.surfaceHover
      }}>
        <div style={{
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          backgroundColor: THEME.COLORS.primary,
          boxShadow: THEME.SHADOWS.glow
        }} />
        <h3 style={{ 
          fontFamily: THEME.FONTS.heading,
          fontSize: '16px',
          fontWeight: 600
        }}>
          FinCoach Chat
        </h3>
      </div>

      {/* Messages Area */}
      <div style={{
        flex: 1,
        padding: '24px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {messages.map((msg, index) => (
          <ChatMessage key={index} message={msg.text} isUser={msg.isUser} />
        ))}
        
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ display: 'flex', gap: '8px', padding: '16px' }}
          >
            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, delay: 0 }} style={dotStyle} />
            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, delay: 0.2 }} style={dotStyle} />
            <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, delay: 0.4 }} style={dotStyle} />
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form 
        onSubmit={handleSend}
        style={{
          padding: '20px',
          borderTop: `1px solid ${THEME.COLORS.border}`,
          display: 'flex',
          gap: '12px',
          backgroundColor: THEME.COLORS.surfaceHover
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your spending, goals, or budgeting..."
          style={{
            flex: 1,
            backgroundColor: THEME.COLORS.bg,
            border: `1px solid ${THEME.COLORS.border}`,
            borderRadius: THEME.BORDER_RADIUS.md,
            padding: '12px 16px',
            color: THEME.COLORS.text,
            fontFamily: THEME.FONTS.body,
            fontSize: '14px',
            outline: 'none',
            transition: 'border-color 0.2s',
          }}
          onFocus={(e) => e.target.style.borderColor = THEME.COLORS.primary}
          onBlur={(e) => e.target.style.borderColor = THEME.COLORS.border}
        />
        <button
          type="submit"
          disabled={!input.trim() || isLoading}
          style={{
            backgroundColor: input.trim() && !isLoading ? THEME.COLORS.primary : THEME.COLORS.border,
            color: '#000',
            border: 'none',
            borderRadius: THEME.BORDER_RADIUS.md,
            width: '44px',
            height: '44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s'
          }}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

const dotStyle = {
  width: '8px',
  height: '8px',
  backgroundColor: THEME.COLORS.primary,
  borderRadius: '50%'
};

export default ChatWindow;
