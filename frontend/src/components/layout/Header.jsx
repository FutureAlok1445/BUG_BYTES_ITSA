import React from 'react';
import { COLORS } from '../../styles/theme';

const Header = () => {
  return (
    <div style={{ padding: '1rem', border: `1px solid ${COLORS.border}` }}>
      <h3>Header Component</h3>
    </div>
  );
};

export default Header;
