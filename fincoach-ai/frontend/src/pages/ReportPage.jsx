import React, { useState } from 'react';
import { THEME } from '../../styles/theme';
import { downloadReport } from '../../api';

const ReportPage = ({ data }) => {
  const [btnText, setBtnText] = useState('📄 Download PDF Report');
  const [downloading, setDownloading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastColor, setToastColor] = useState(THEME.COLORS.primary);

  if (!data) return null;

  const handleDownload = async () => {
    setDownloading(true);
    setBtnText('⏳ Generating...');

    const blob = await downloadReport();

    if (blob) {
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'FinCoach_March_2026.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setBtnText('✅ Downloaded!');
      setToastMsg('✅ Report downloaded!');
      setToastColor(THEME.COLORS.primary);
    } else {
      setBtnText('❌ Backend offline');
      setToastMsg('❌ Backend offline — cannot generate PDF');
      setToastColor(THEME.COLORS.danger);
    }

    setShowToast(true);
    setDownloading(false);
    setTimeout(() => { setBtnText('📄 Download PDF Report'); setShowToast(false); }, 3000);
  };

  const categories = data.categories || {};
  const income = data.income || 0;

  const getStatus = (amt) => {
    const pct = income > 0 ? (amt / income) * 100 : 0;
    if (pct >= 25) return { label: 'Critical', color: THEME.COLORS.danger };
    if (pct >= 15) return { label: 'High', color: THEME.COLORS.warning };
    return { label: 'OK', color: THEME.COLORS.primary };
  };

  return (
    <div style={{ padding: '32px 24px', maxWidth: '800px', margin: '0 auto' }}>

      {/* Toast */}
      {showToast && (
        <div style={{
          position: 'fixed', top: '80px', right: '20px',
          backgroundColor: THEME.COLORS.bg, border: `1px solid ${toastColor}`,
          borderRadius: THEME.BORDER_RADIUS.md, padding: '14px 20px', zIndex: 9999,
          boxShadow: THEME.SHADOWS.card, fontFamily: THEME.FONTS.body, fontSize: '14px', color: toastColor,
          animation: 'slideIn 0.3s ease'
        }}>
          {toastMsg}
          <style>{`@keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`}</style>
        </div>
      )}

      {/* Report Card */}
      <div style={{
        backgroundColor: THEME.COLORS.surface,
        border: `1px solid ${THEME.COLORS.border}`,
        borderRadius: THEME.BORDER_RADIUS.lg,
        padding: '32px',
        marginBottom: '24px'
      }}>
        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontFamily: THEME.FONTS.heading, fontSize: '28px', fontWeight: 800, color: THEME.COLORS.text, marginBottom: '4px' }}>
            📄 Monthly Financial Report
          </h1>
          <p style={{ fontFamily: THEME.FONTS.body, fontSize: '14px', color: THEME.COLORS.muted }}>
            {data.profile?.name || 'Ravi Kumar'} • March 2026
          </p>
        </div>

        {/* Summary 4-Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Income', value: data.income, color: THEME.COLORS.primary },
            { label: 'Spent', value: data.spent, color: THEME.COLORS.accent },
            { label: 'Saved', value: data.saved, color: THEME.COLORS.primary },
            { label: 'FinScore', value: data.profile?.finscore, color: '#A855F7', isFin: true }
          ].map((item, idx) => (
            <div key={idx} style={{
              backgroundColor: THEME.COLORS.surfaceHover,
              borderRadius: THEME.BORDER_RADIUS.md,
              padding: '16px',
              textAlign: 'center',
              border: `1px solid ${THEME.COLORS.border}`
            }}>
              <p style={{ fontFamily: THEME.FONTS.body, fontSize: '12px', color: THEME.COLORS.muted, marginBottom: '6px', textTransform: 'uppercase' }}>
                {item.label}
              </p>
              <p style={{ fontFamily: THEME.FONTS.mono, fontSize: '20px', fontWeight: 700, color: item.color }}>
                {item.isFin ? `${item.value}/100` : `₹${(item.value || 0).toLocaleString('en-IN')}`}
              </p>
            </div>
          ))}
        </div>

        {/* Category Table */}
        <h3 style={{ fontFamily: THEME.FONTS.heading, fontSize: '16px', fontWeight: 700, color: THEME.COLORS.text, marginBottom: '16px' }}>
          Category Breakdown
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: THEME.FONTS.body, fontSize: '14px' }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${THEME.COLORS.border}` }}>
                {['Category', 'Amount', '% of Income', 'Status'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: THEME.COLORS.muted, fontWeight: 600, fontSize: '12px', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(categories).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => {
                const pct = income > 0 ? ((amt / income) * 100).toFixed(1) : '0.0';
                const status = getStatus(amt);
                return (
                  <tr key={cat} style={{ borderBottom: `1px solid ${THEME.COLORS.border}10` }}>
                    <td style={{ padding: '10px 12px', color: THEME.COLORS.text }}>{cat}</td>
                    <td style={{ padding: '10px 12px', fontFamily: THEME.FONTS.mono, color: THEME.COLORS.text }}>₹{amt.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '10px 12px', fontFamily: THEME.FONTS.mono, color: THEME.COLORS.muted }}>{pct}%</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        backgroundColor: status.color + '20', color: status.color,
                        padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600
                      }}>{status.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Goals Mini List */}
        <h3 style={{ fontFamily: THEME.FONTS.heading, fontSize: '16px', fontWeight: 700, color: THEME.COLORS.text, marginTop: '32px', marginBottom: '16px' }}>
          Goals Progress
        </h3>
        {(data.goals || []).map((g, idx) => {
          const pct = Math.min(Math.round((g.current_amount / g.target_amount) * 100), 100);
          return (
            <div key={idx} style={{ marginBottom: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '13px', color: THEME.COLORS.text }}>{g.name}</span>
                <span style={{ fontFamily: THEME.FONTS.mono, fontSize: '12px', color: THEME.COLORS.muted }}>{pct}%</span>
              </div>
              <div style={{ height: '6px', backgroundColor: THEME.COLORS.surfaceHover, borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${pct}%`, backgroundColor: THEME.COLORS.primary, borderRadius: '3px' }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Download Button */}
      <button onClick={handleDownload} disabled={downloading} style={{
        width: '100%', padding: '18px',
        backgroundColor: THEME.COLORS.primary, color: '#0a0a0a',
        border: 'none', borderRadius: THEME.BORDER_RADIUS.md,
        fontFamily: THEME.FONTS.heading, fontSize: '16px', fontWeight: 700,
        cursor: downloading ? 'not-allowed' : 'pointer',
        boxShadow: '6px 6px 0px #00CC6A',
        transition: 'all 0.2s'
      }}>
        {btnText}
      </button>

      <p style={{
        fontFamily: THEME.FONTS.body, fontSize: '12px', color: THEME.COLORS.muted,
        textAlign: 'center', marginTop: '12px', lineHeight: 1.5
      }}>
        Report includes AI insights, spending analysis, and personalized recommendations
      </p>
    </div>
  );
};

export default ReportPage;
