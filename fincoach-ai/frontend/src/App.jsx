import React from 'react';
import Dashboard from './components/dashboard/Dashboard';
import { COLORS } from './styles/theme';

function App() {
  return (
    <div className="App" style={{ backgroundColor: COLORS.background, color: COLORS.text, minHeight: '100vh' }}>
      <Dashboard />
    </div>
  );
}

export default App;
