import React from 'react';
import { motion } from 'framer-motion';
import { THEME } from '../../styles/theme';

import AlertCard from './AlertCard';
import ForecastBar from './ForecastBar';
import AddTransaction from './AddTransaction';
import GoalsTracker from '../dashboard/GoalsTracker';

const Alerts = ({ data, onRefresh }) => {
  if (!data) return null;

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
        top: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '600px',
        height: '400px',
        background: `radial-gradient(circle, ${THEME.COLORS.accent}15 0%, transparent 70%)`,
        filter: 'blur(80px)',
        zIndex: -1,
        pointerEvents: 'none'
      }} />

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ 
          fontFamily: THEME.FONTS.heading,
          fontSize: '36px',
          fontWeight: 800,
          marginBottom: '8px'
        }}>
          Action <span style={{ color: THEME.COLORS.accent }}>Center</span>
        </h1>
        <p style={{ color: THEME.COLORS.textSecondary }}>
          Smart alerts, forecasting, and goal tracking.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(300px, 1fr) minmax(350px, 400px)',
        gap: '32px',
        alignItems: 'start'
      }}>
        
        {/* Left Column: Forecast & Alerts & Goals */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          <div>
            <ForecastBar data={data} />
          </div>

          <div>
            <h2 style={{ 
              fontFamily: THEME.FONTS.heading,
              fontSize: '20px',
              fontWeight: 700,
              marginBottom: '16px',
              color: THEME.COLORS.text
            }}>
              System Alerts
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {data.alerts && data.alerts.map((alert, index) => (
                <AlertCard key={index} index={index} type={alert.type} message={alert.msg} />
              ))}
              {(!data.alerts || data.alerts.length === 0) && (
                <div style={{ color: THEME.COLORS.textSecondary, fontStyle: 'italic', padding: '16px' }}>
                  No active alerts. You're doing great!
                </div>
              )}
            </div>
          </div>

          <div>
            <GoalsTracker goals={data.goals} />
          </div>

        </div>

        {/* Right Column: Add Transaction */}
        <div style={{ position: 'sticky', top: '100px' }}>
          <AddTransaction onAdded={onRefresh} />
        </div>

      </div>
    </motion.div>
  );
};

export default Alerts;
