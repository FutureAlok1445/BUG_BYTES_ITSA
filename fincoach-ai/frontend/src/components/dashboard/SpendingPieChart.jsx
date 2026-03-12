import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { THEME } from '../../styles/theme';
import { useScrollReveal } from '../../hooks/useScrollReveal';

const SpendingPieChart = ({ categories }) => {
  const [activeIndex, setActiveIndex] = useState(-1);
  const revealRef = useScrollReveal();

  if (!categories || Object.keys(categories).length === 0) {
    return null;
  }

  // Convert categories object to array for Recharts
  const data = Object.entries(categories)
    .filter(([_, value]) => value > 0)
    .sort((a, b) => b[1] - a[1]) // Sort largest first
    .map(([name, value]) => ({ name, value }));

  const COLORS = THEME.CHART_COLORS;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div style={{
          backgroundColor: THEME.COLORS.surfaceHover,
          border: `1px solid ${payload[0].payload.fill}`,
          padding: '12px',
          borderRadius: THEME.BORDER_RADIUS.sm,
          boxShadow: THEME.SHADOWS.card,
        }}>
          <p style={{ 
            color: THEME.COLORS.text, 
            fontFamily: THEME.FONTS.heading,
            fontWeight: 600,
            marginBottom: '4px'
          }}>
            {payload[0].name}
          </p>
          <p className="number-font" style={{ 
            color: payload[0].payload.fill,
            fontSize: '16px',
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
      <h3 style={{ 
        fontFamily: THEME.FONTS.heading, 
        color: THEME.COLORS.text,
        marginBottom: '8px',
        fontSize: '18px'
      }}>
        Spending Breakdown
      </h3>
      <p style={{ 
        color: THEME.COLORS.textSecondary,
        fontSize: '14px',
        marginBottom: '24px'
      }}>
        Where your money goes this month
      </p>

      <div style={{ flex: 1, minHeight: 0 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(-1)}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  style={{
                    filter: activeIndex === index ? `drop-shadow(0 0 10px ${COLORS[index % COLORS.length]}80)` : 'none',
                    transform: activeIndex === index ? 'scale(1.05)' : 'scale(1)',
                    transformOrigin: 'center',
                    transition: 'all 0.3s ease'
                  }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              wrapperStyle={{
                fontFamily: THEME.FONTS.body,
                fontSize: '12px',
                color: THEME.COLORS.textSecondary
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SpendingPieChart;
