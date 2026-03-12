import React, { useState } from 'react';
import { useDashboard } from './hooks/useDashboard';
import { THEME } from './styles/theme';
import { downloadReport } from './api';

import LoadingScreen from './components/layout/LoadingScreen';
import Header from './components/layout/Header';
import Dashboard from './components/dashboard/Dashboard';
import AICoach from './components/coach/AICoach';
import Alerts from './components/alerts/Alerts';

// Placeholders until built
const DashboardPlaceholder = () => <div style={{padding:'40px', textAlign:'center'}}>Dashboard Building...</div>;
const CoachPlaceholder = () => <div style={{padding:'40px', textAlign:'center'}}>AI Coach Building...</div>;

function App() {
  const [showLoader, setShowLoader] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const { data, loading, error, refetch } = useDashboard();

  const handleReportDownload = async () => {
    try {
      const blob = await downloadReport();
      if (blob) {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'fincoach_report.pdf');
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        alert("Failed to download report. Please try again.");
      }
    } catch (e) {
      console.error(e);
      alert("Error downloading report");
    }
  };

  // Keep showing loader if data is still fetching even after anim is done
  if (showLoader) {
    return <LoadingScreen onComplete={() => setShowLoader(false)} />;
  }

  // Very edge case fallback
  if (!data && !loading) {
    return <div style={{color:'white'}}>Fatal Error: Data not initializing.</div>;
  }

  return (
    <div className="App" style={{ backgroundColor: THEME.COLORS.bg, color: THEME.COLORS.text, minHeight: '100vh' }}>
      
      {/* Fixed Sticky Header */}
      <Header 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        userData={data?.profile}
        onReportDownload={handleReportDownload}
      />

      {/* Backend Offline Warning Banner */}
      {error && !loading && (
        <div style={{
          position: 'fixed',
          top: '64px',
          left: 0,
          right: 0,
          backgroundColor: THEME.COLORS.danger,
          color: '#000',
          textAlign: 'center',
          padding: '6px',
          fontFamily: THEME.FONTS.heading,
          fontSize: '13px',
          fontWeight: 600,
          zIndex: 999
        }}>
          ⚠️ Backend is offline — Displaying demo snapshot data
        </div>
      )}

      {/* Tab Content Area (with padding for sticky header) */}
      <main style={{ 
        paddingTop: error ? '100px' : '84px', // 64px header + 20px space (more if error banner)
        paddingBottom: '60px',
        maxWidth: '1200px',
        margin: '0 auto',
        width: '100%',
        minHeight: 'calc(100vh - 64px)'
      }}>
        
        {activeTab === 'dashboard' && <Dashboard data={data} />}
        {activeTab === 'coach' && <AICoach data={data} />}
        {activeTab === 'alerts' && <Alerts data={data} onRefresh={refetch} />}

      </main>

    </div>
  );
}

export default App;
