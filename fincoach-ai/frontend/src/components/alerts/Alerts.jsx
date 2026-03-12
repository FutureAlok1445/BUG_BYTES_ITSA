import React from 'react';
import { THEME } from '../../styles/theme';

import AlertCard from './AlertCard';
import ForecastBar from './ForecastBar';
import AddTransaction from './AddTransaction';

const GoalsSection = ({ goals }) => {
  if (!goals || goals.length === 0) return null;
  return (
    <div>
      {goals.map((goal, idx) => {
        const pct = Math.min(Math.round((goal.current_amount / goal.target_amount) * 100), 100);
        const done = pct >= 100;
        return (
          <div key={idx} style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontFamily: THEME.FONTS.heading, fontSize: '14px', fontWeight: 600, color: THEME.COLORS.text }}>
                {goal.name} {done && '✅'}
              </span>
              <span style={{ fontFamily: THEME.FONTS.mono, fontSize: '13px', color: done ? THEME.COLORS.primary : THEME.COLORS.muted }}>
                ₹{goal.current_amount.toLocaleString('en-IN')} / ₹{goal.target_amount.toLocaleString('en-IN')}
              </span>
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: THEME.COLORS.surfaceHover, borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%', width: `${pct}%`, borderRadius: '4px',
                backgroundColor: done ? THEME.COLORS.primary : THEME.COLORS.accent,
                transition: 'width 1s ease-out',
                boxShadow: `0 0 8px ${done ? THEME.COLORS.primary : THEME.COLORS.accent}40`
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
              <span style={{ fontFamily: THEME.FONTS.mono, fontSize: '11px', color: THEME.COLORS.muted }}>
                {new Date(goal.deadline).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
              </span>
              <span style={{ fontFamily: THEME.FONTS.mono, fontSize: '11px', color: done ? THEME.COLORS.primary : THEME.COLORS.accent, fontWeight: 700 }}>
                {pct}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Alerts = ({ data, onRefresh }) => {
  if (!data) return null;

  return (
    <div style={{ padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontFamily: THEME.FONTS.heading, fontSize: '32px', fontWeight: 800, color: THEME.COLORS.text }}>
          ⚠️ Alerts & Goals
        </h1>
        <button onClick={onRefresh} style={{
          background: 'transparent', border: `1px solid ${THEME.COLORS.border}`,
          color: THEME.COLORS.muted, padding: '8px 16px', borderRadius: THEME.BORDER_RADIUS.md,
          fontFamily: THEME.FONTS.body, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s'
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = THEME.COLORS.primary; e.currentTarget.style.color = THEME.COLORS.primary; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = THEME.COLORS.border; e.currentTarget.style.color = THEME.COLORS.muted; }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Two Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '55% 1fr', gap: '32px', alignItems: 'start' }}>

        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

          {/* Active Alerts */}
          <div>
            <h2 style={{
              fontFamily: THEME.FONTS.heading, fontSize: '14px', fontWeight: 700,
              color: THEME.COLORS.muted, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px'
            }}>ACTIVE ALERTS</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data.alerts && data.alerts.length > 0 ? (
                data.alerts.map((alert, idx) => (
                  <AlertCard key={idx} index={idx} type={alert.type} msg={alert.msg} />
                ))
              ) : (
                <p style={{ color: THEME.COLORS.muted, fontStyle: 'italic' }}>No active alerts. You're doing great!</p>
              )}
            </div>
          </div>

          <div style={{ height: '1px', backgroundColor: THEME.COLORS.border }} />

          {/* Forecast */}
          <div>
            <h2 style={{
              fontFamily: THEME.FONTS.heading, fontSize: '14px', fontWeight: 700,
              color: THEME.COLORS.muted, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px'
            }}>MONTH-END FORECAST</h2>
            <ForecastBar forecast={data.forecast} income={data.income} spent={data.spent} />
          </div>

          <div style={{ height: '1px', backgroundColor: THEME.COLORS.border }} />

          {/* Goals */}
          <div>
            <h2 style={{
              fontFamily: THEME.FONTS.heading, fontSize: '14px', fontWeight: 700,
              color: THEME.COLORS.muted, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px'
            }}>🎯 SAVINGS GOALS</h2>
            <GoalsSection goals={data.goals} />
          </div>
        </div>

        {/* Right Column — sticky AddTransaction */}
        <div style={{ position: 'sticky', top: '80px' }}>
          <AddTransaction onAdd={onRefresh} />
        </div>
      </div>
    </div>
  );
};

export default Alerts;
