import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { THEME } from '../../styles/theme';
import { useScrollReveal } from '../../hooks/useScrollReveal';

const TrendLine = ({ data }) => {
  const revealRef = useScrollReveal(0.3);

  // Since we only have total income and weekly spent in our MOCK_DATA right now, 
  // Let's create a cumulative spending trendline over the 4 weeks compared to income
  const weeklyTrend = data?.weekly_trend;
  if (!weeklyTrend) return null;

  const chartData = [
    { name: 'W1', spent: weeklyTrend.W1, income: data.income },
    { name: 'W2', spent: weeklyTrend.W1 + weeklyTrend.W2, income: data.income },
    { name: 'W3', spent: weeklyTrend.W1 + weeklyTrend.W2 + weeklyTrend.W3, income: data.income },
    { name: 'W4', spent: weeklyTrend.W1 + weeklyTrend.W2 + weeklyTrend.W3 + weeklyTrend.W4, income: data.income },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: THEME.COLORS.surfaceHover,
          border: `1px solid ${THEME.COLORS.border}`,
          padding: '12px',
          borderRadius: THEME.BORDER_RADIUS.sm,
          boxShadow: THEME.SHADOWS.card,
        }}>
          <p style={{ 
            color: THEME.COLORS.textSecondary, 
            fontFamily: THEME.FONTS.heading,
            fontSize: '12px',
            marginBottom: '8px',
            textTransform: 'uppercase'
          }}>
            Week {label.replace('W', '')} Cumulative
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <p className="number-font" style={{ color: payload[0].color, fontSize: '14px', fontWeight: 600 }}>
              Spent: ₹{payload[0].value.toLocaleString('en-IN')}
            </p>
            <p className="number-font" style={{ color: payload[1].color, fontSize: '14px', fontWeight: 600 }}>
              Income: ₹{payload[1].value.toLocaleString('en-IN')}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div 
      ref={revealRef}
      className="reveal"
      style={{
        gridColumn: '1 / -1', // Span full width
        backgroundColor: THEME.COLORS.surface,
        border: `1px solid ${THEME.COLORS.border}`,
        borderRadius: THEME.BORDER_RADIUS.lg,
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        height: '350px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <h3 style={{ 
            fontFamily: THEME.FONTS.heading, 
            color: THEME.COLORS.text,
            marginBottom: '8px',
            fontSize: '18px'
          }}>
            Income vs. Spent (Cumulative)
          </h3>
          <p style={{ 
            color: THEME.COLORS.textSecondary,
            fontSize: '14px'
          }}>
            Tracking your monthly trajectory
          </p>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, marginLeft: '-20px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorSpent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={THEME.COLORS.accent} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={THEME.COLORS.accent} stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={THEME.COLORS.border} />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: THEME.COLORS.textSecondary, fontSize: 12, fontFamily: THEME.FONTS.mono }}
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false}
              tick={{ fill: THEME.COLORS.textSecondary, fontSize: 12, fontFamily: THEME.FONTS.mono }}
              tickFormatter={(val) => `₹${val/1000}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="spent" 
              stroke={THEME.COLORS.accent} 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorSpent)" 
              animationDuration={2000}
            />
            <Line 
              type="stepAfter" 
              dataKey="income" 
              stroke={THEME.COLORS.primary} 
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TrendLine;
