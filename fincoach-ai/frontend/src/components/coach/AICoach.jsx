import React, { useState, useEffect } from 'react';
import { THEME } from '../../styles/theme';
import { sendChat, getInsights } from '../../api';

import PersonalityCard from './PersonalityCard';
import InsightsPanel from './InsightsPanel';
import ChatWindow from './ChatWindow';
import ChatInput from './ChatInput';

const BACKUP_INSIGHTS = `📊 Spending Pattern Analysis:
Your food spending (₹9,800) accounts for 29% of your income — the healthy limit for Indian freelancers is 20%.

💡 Key Insight:
Weekend spending is 3x higher than weekdays. Most impulse purchases happen Friday-Sunday.

📅 Monthly Forecast:
At your current pace, you'll have only ₹1,200 remaining by March 31. Consider reducing dining-out frequency.

💡 Goal Progress:
Emergency Fund is at 80% — you're close! Redirect ₹2,000/week from entertainment to hit your June target.`;

const AICoach = ({ data }) => {
  const [insights, setInsights] = useState(null);
  const [insightLoading, setInsightLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);
  const [chatLoading, setChatLoading] = useState(false);

  const score = data?.profile?.finscore || 67;
  const personalityType = data?.profile?.personality_type || "Impulsive Spender";

  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: `Namaste! 👋 Main hoon FinCoach AI — \naapka personal financial coach.\nAapka FinScore ${score}/100 hai.\nKoi bhi financial sawaal poochh sakte hain! 💰`,
      timestamp: new Date()
    }
  ]);

  useEffect(() => {
    let mounted = true;
    const fetchInsights = async () => {
      setInsightLoading(true);
      const res = await getInsights();
      if (mounted) {
        if (res && res.insights) {
          setInsights(res.insights);
          setIsFallback(res.is_fallback || false);
        } else {
          setInsights(BACKUP_INSIGHTS);
          setIsFallback(true);
        }
        setInsightLoading(false);
      }
    };
    fetchInsights();
    return () => { mounted = false; };
  }, []);

  const handleSend = async (msg) => {
    setMessages(prev => [...prev, { role: 'user', text: msg, timestamp: new Date() }]);
    setChatLoading(true);
    setMessages(prev => [...prev, { role: 'loading', text: '', timestamp: new Date() }]);

    const res = await sendChat(msg);

    // Remove loading indicator
    setMessages(prev => prev.filter(m => m.role !== 'loading'));
    setChatLoading(false);

    if (res && res.response) {
      setMessages(prev => [...prev, { role: 'ai', text: res.response, timestamp: new Date() }]);
    } else {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: "Network issue ho gaya hai! 🔌 Backend se connect nahi ho pa raha. Demo mode mein hoon — phir se try karein!",
        timestamp: new Date()
      }]);
    }
    setQuestionCount(prev => prev + 1);
  };

  const isOnline = !isFallback;

  return (
    <div style={{ padding: '32px 24px', position: 'relative' }}>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontFamily: THEME.FONTS.heading,
          fontSize: '32px',
          fontWeight: 800,
          color: THEME.COLORS.text,
          marginBottom: '4px'
        }}>
          🤖 AI Financial Coach
        </h1>
        <p style={{
          fontFamily: THEME.FONTS.body,
          fontSize: '14px',
          color: THEME.COLORS.muted
        }}>
          Powered by LLaMA 3 via Groq ⚡
        </p>
      </div>

      {/* ROW 1: Personality + Insights */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '40% 1fr',
        gap: '24px',
        marginBottom: '40px',
        alignItems: 'stretch'
      }}>
        <PersonalityCard personality_type={personalityType} finscore={score} />
        <InsightsPanel insights={insights} loading={insightLoading} is_fallback={isFallback} />
      </div>

      {/* ROW 2: Chat Section */}
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{
          fontFamily: THEME.FONTS.heading,
          fontSize: '20px',
          fontWeight: 700,
          color: THEME.COLORS.text,
          marginBottom: '20px',
          textTransform: 'uppercase',
          letterSpacing: '2px'
        }}>
          💬 TALK TO YOUR COACH
        </h2>
      </div>

      <div style={{
        backgroundColor: THEME.COLORS.surface,
        border: `1px solid ${THEME.COLORS.border}`,
        borderRadius: THEME.BORDER_RADIUS.lg,
        overflow: 'hidden',
        display: 'grid',
        gridTemplateColumns: '28% 1fr',
      }}>
        {/* Left Sidebar */}
        <div style={{
          borderRight: `1px solid ${THEME.COLORS.border}`,
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          backgroundColor: THEME.COLORS.surfaceHover
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '12px' }}>🤖</div>
            <p style={{
              fontFamily: THEME.FONTS.heading,
              fontSize: '16px',
              fontWeight: 700,
              color: THEME.COLORS.text
            }}>FinCoach AI</p>
            <p style={{
              fontFamily: THEME.FONTS.mono,
              fontSize: '12px',
              color: isOnline ? THEME.COLORS.primary : THEME.COLORS.danger,
              marginTop: '4px'
            }}>
              {isOnline ? '🟢 Online' : '🔴 Demo Mode'}
            </p>
          </div>

          <div style={{ height: '1px', backgroundColor: THEME.COLORS.border }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: THEME.FONTS.body, fontSize: '12px', color: THEME.COLORS.muted }}>
                Questions asked:
              </span>
              <span style={{ fontFamily: THEME.FONTS.mono, fontSize: '12px', color: THEME.COLORS.text }}>
                {questionCount}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontFamily: THEME.FONTS.body, fontSize: '12px', color: THEME.COLORS.muted }}>
                Model:
              </span>
              <span style={{ fontFamily: THEME.FONTS.mono, fontSize: '12px', color: THEME.COLORS.text }}>
                LLaMA 3 70B
              </span>
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: THEME.COLORS.border }} />

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {['Income ✓', 'Spending ✓', 'Goals ✓', 'FinScore ✓'].map(badge => (
              <span key={badge} style={{
                backgroundColor: THEME.COLORS.primaryDim,
                color: THEME.COLORS.primary,
                fontSize: '11px',
                fontFamily: THEME.FONTS.mono,
                padding: '3px 8px',
                borderRadius: '12px',
                border: `1px solid ${THEME.COLORS.primary}30`
              }}>{badge}</span>
            ))}
          </div>
        </div>

        {/* Right: Chat */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <ChatWindow messages={messages} />
          <div style={{
            padding: '16px 20px',
            borderTop: `1px solid ${THEME.COLORS.border}`
          }}>
            <ChatInput onSend={handleSend} loading={chatLoading} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICoach;
