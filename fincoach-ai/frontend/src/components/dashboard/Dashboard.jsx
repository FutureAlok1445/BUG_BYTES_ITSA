import React from 'react';
import { motion } from 'framer-motion';
import { THEME } from '../../styles/theme';

import FinScoreGauge from './FinScoreGauge';
import StatsCards from './StatsCards';
import SpendingPieChart from './SpendingPieChart';
import WeeklyBarChart from './WeeklyBarChart';
import TrendLine from './TrendLine';
import GoalsTracker from './GoalsTracker';





const Dashboard = ({ data }) => {
  if (!data) return null;

  const { profile, income, spent, saved, forecast } = data;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ padding: '32px 24px', position: 'relative' }}
    >
      {/* Background ambient glow */}
      <div style={{
        position: 'absolute',
        top: '-100px',
        right: '-10%',
        width: '400px',
        height: '400px',
        background: `radial-gradient(circle, ${THEME.COLORS.primaryDim} 0%, transparent 70%)`,
        filter: 'blur(60px)',
        zIndex: -1,
        pointerEvents: 'none'
      }} />

      {/* Header Section */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          fontFamily: THEME.FONTS.heading,
          fontSize: '36px',
          fontWeight: 800,
          marginBottom: '8px'
        }}>
          Welcome back, <span style={{ color: THEME.COLORS.primary }}>{profile?.name?.split(' ')[0] || 'User'}</span>
        </h1>
        <p style={{ color: THEME.COLORS.textSecondary }}>
          Here is your financial snapshot for this month.
        </p>
      </div>

      {/* Top Row: Gauge + Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(250px, 300px) 1fr',
        gap: '32px',
        marginBottom: '32px',
        alignItems: 'stretch'
      }}>
        {/* Left: FinScore */}
        <div style={{ display: 'flex' }}>
          <div style={{ flex: 1 }}>
            <FinScoreGauge score={profile?.finscore || 0} />
          </div>
        </div>

        {/* Right: Key Stats */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <StatsCards 
            income={income} 
            spent={spent} 
            saved={saved} 
            forecast={forecast} 
          />
        </div>
      </div>

      {/* Middle Row: Charts area */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '32px',
        marginBottom: '32px'
      }}>
        <SpendingPieChart categories={data.categories} />
        <WeeklyBarChart weeklyData={data.weekly_trend} />
      </div>

      {/* Third Row: Trend Line */}
      <div style={{
        marginBottom: '32px'
      }}>
        <TrendLine data={data} />
      </div>

      {/* Bottom Row: Goals area */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '32px',
        marginBottom: '32px'
      }}>
        <GoalsTracker goals={data.goals} />
      </div>

    </motion.div>
  );
};

export default Dashboard;
