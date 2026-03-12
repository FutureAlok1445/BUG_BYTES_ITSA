import React, { useState, useEffect } from 'react';
import { THEME } from './styles/theme';
import { getDashboard } from './api';

import LoadingScreen from './components/layout/LoadingScreen';
import Header from './components/layout/Header';
import Dashboard from './components/dashboard/Dashboard';
import AICoach from './components/coach/AICoach';
import Alerts from './components/alerts/Alerts';
import ReportPage from './pages/ReportPage';

const MOCK_DATA = {
  profile: {
    name: "Ravi Kumar",
    finscore: 67,
    personality_type: "Impulsive Spender",
    streak_days: 12,
    income_type: "irregular"
  },
  income: 34000,
  spent: 28500,
  saved: 5500,
  savings_rate: 16.2,
  forecast: 1200,
  categories: {
    Food: 9800,
    Rent: 12000,
    Transport: 3200,
    Entertainment: 2100,
    Bills: 850
  },
  weekly_trend: { W1: 4200, W2: 6800, W3: 5100, W4: 7100 },
  goals: [
    { name: "Emergency Fund", target_amount: 20000, current_amount: 16000, deadline: "2026-06-01" },
    { name: "New Bike", target_amount: 80000, current_amount: 9600, deadline: "2026-09-01" },
    { name: "Goa Trip", target_amount: 15000, current_amount: 3200, deadline: "2026-05-01" }
  ],
  alerts: [
    { type: "warning", msg: "🟡 Food ₹9,800 = 28% of income (limit: 20%)" },
    { type: "warning", msg: "🟡 At current pace: only ₹1,200 left March 31" }
  ],
  weekly_budget: {
    this_week_budget: 4000,
    this_week_spent: 2800,
    remaining_today: 400,
    daily_safe_limit: 500
  }
};

function App() {
  const [showLoader, setShowLoader] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [showDemoToast, setShowDemoToast] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getDashboard();
      if (res) {
        setData(res);
        setIsDemo(false);
      } else {
        setData(MOCK_DATA);
        setIsDemo(true);
        setShowDemoToast(true);
        setTimeout(() => setShowDemoToast(false), 5000);
      }
    } catch (e) {
      console.error(e);
      setData(MOCK_DATA);
      setIsDemo(true);
      setShowDemoToast(true);
      setTimeout(() => setShowDemoToast(false), 5000);
    }
    setLoading(false);
  };

  const refetch = () => fetchData();

  if (showLoader) {
    return <LoadingScreen onComplete={() => setShowLoader(false)} />;
  }

  if (!data && !loading) {
    return <div style={{ color: 'white', padding: '40px', textAlign: 'center' }}>Fatal Error: Data not initializing.</div>;
  }

  return (
    <div className="App" style={{ backgroundColor: THEME.COLORS.bg, color: THEME.COLORS.text, minHeight: '100vh' }}>

      {/* Demo mode toast */}
      {showDemoToast && (
        <div style={{
          position: 'fixed', top: '72px', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: THEME.COLORS.bg, border: `1px solid ${THEME.COLORS.accent}`,
          borderRadius: THEME.BORDER_RADIUS.md, padding: '10px 24px', zIndex: 9999,
          boxShadow: THEME.SHADOWS.card, fontFamily: THEME.FONTS.body, fontSize: '14px',
          color: THEME.COLORS.accent, whiteSpace: 'nowrap',
          animation: 'fadeIn 0.3s ease'
        }}>
          ⚠️ Running in demo mode — backend offline
          <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateX(-50%) translateY(-10px); } to { opacity: 1; transform: translateX(-50%) translateY(0); } }`}</style>
        </div>
      )}

      {/* Fixed Sticky Header */}
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        userData={data?.profile}
        onReportDownload={() => setActiveTab('report')}
      />

      {/* Backend Offline Banner */}
      {isDemo && !showDemoToast && (
        <div style={{
          position: 'fixed', top: '64px', left: 0, right: 0,
          backgroundColor: THEME.COLORS.accent, color: '#0a0a0a',
          textAlign: 'center', padding: '4px',
          fontFamily: THEME.FONTS.heading, fontSize: '12px', fontWeight: 600, zIndex: 999
        }}>
          ⚠️ Demo mode — backend offline
        </div>
      )}

      {/* Tab Content */}
      <main style={{
        paddingTop: isDemo ? '100px' : '84px',
        paddingBottom: '60px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        minHeight: 'calc(100vh - 64px)'
      }}>
        <div style={{ opacity: loading ? 0.5 : 1, transition: 'opacity 0.3s' }}>
          {activeTab === 'dashboard' && <Dashboard data={data || MOCK_DATA} />}
          {activeTab === 'coach' && <AICoach data={data || MOCK_DATA} />}
          {activeTab === 'alerts' && <Alerts data={data || MOCK_DATA} onRefresh={refetch} />}
          {activeTab === 'report' && <ReportPage data={data || MOCK_DATA} />}
        </div>
      </main>
    </div>
  );
}

export default App;
