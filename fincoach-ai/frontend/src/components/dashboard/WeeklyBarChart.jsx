import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { THEME } from '../../styles/theme';
import { useScrollReveal } from '../../hooks/useScrollReveal';

const WeeklyBarChart = ({ weeklyData }) => {
  const revealRef = useScrollReveal(0.2);

  if (!weeklyData || Object.keys(weeklyData).length === 0) {
    return null;
  }

  // Convert weekly trend object to array
  const data = Object.entries(weeklyData).map(([week, amount]) => ({
    name: week,
    amount: amount
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: THEME.COLORS.surfaceHover,
          border: `1px solid ${THEME.COLORS.primary}`,
          padding: '12px',
          borderRadius: THEME.BORDER_RADIUS.sm,
          boxShadow: THEME.SHADOWS.brutalist,
        }}>
          <p style={{ 
            color: THEME.COLORS.textSecondary, 
            fontFamily: THEME.FONTS.heading,
            fontSize: '12px',
            marginBottom: '4px',
            textTransform: 'uppercase'
          }}>
            Week {label.replace('W', '')}
          </p>
          <p className="number-font" style={{ 
            color: THEME.COLORS.primary,
            fontSize: '18px',
            fontWeight: 700
          }}>
            ₹{payload[0].value.toLocaleString('en-IN')}
          </p>
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
        backgroundColor: THEME.COLORS.surface,
        border: `1px solid ${THEME.COLORS.border}`,
        borderRadius: THEME.BORDER_RADIUS.lg,
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        height: '400px'
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
            Weekly Trend
          </h3>
          <p style={{ 
            color: THEME.COLORS.textSecondary,
            fontSize: '14px'
          }}>
            Expense velocity mapping
          </p>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, marginLeft: '-20px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
          >
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
            <Tooltip content={<CustomTooltip />} cursor={{ fill: THEME.COLORS.surfaceHover }} />
            <Bar 
              dataKey="amount" 
              radius={[4, 4, 0, 0]}
              animationDuration={1500}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={index === data.length - 1 ? THEME.COLORS.accent : THEME.COLORS.primary} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WeeklyBarChart;
