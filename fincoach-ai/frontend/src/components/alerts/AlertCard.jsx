import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { THEME } from '../../styles/theme';

const AlertCard = ({ type, message, index }) => {
  // Mapping alert types to colors and icons
  const typeConfig = {
    danger: { color: THEME.COLORS.danger, icon: <AlertCircle size={20} /> },
    warning: { color: THEME.COLORS.warning, icon: <AlertTriangle size={20} /> },
    info: { color: '#00D4FF', icon: <Info size={20} /> },
    success: { color: THEME.COLORS.success, icon: <CheckCircle2 size={20} /> }
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      style={{
        backgroundColor: THEME.COLORS.surface,
        borderLeft: `4px solid ${config.color}`,
        borderTop: `1px solid ${THEME.COLORS.border}`,
        borderRight: `1px solid ${THEME.COLORS.border}`,
        borderBottom: `1px solid ${THEME.COLORS.border}`,
        borderRadius: `0 ${THEME.BORDER_RADIUS.md} ${THEME.BORDER_RADIUS.md} 0`,
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
        boxShadow: THEME.SHADOWS.card
      }}
    >
      <div style={{ color: config.color, marginTop: '2px' }}>
        {config.icon}
      </div>
      <div>
        <p style={{ 
          fontFamily: THEME.FONTS.body,
          color: THEME.COLORS.text,
          fontSize: '15px',
          lineHeight: 1.5
        }}>
          {message}
        </p>
      </div>
    </motion.div>
  );
};

export default AlertCard;
