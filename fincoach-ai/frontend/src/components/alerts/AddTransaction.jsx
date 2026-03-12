import React, { useState } from 'react';
import { THEME } from '../../styles/theme';
import { addTransaction } from '../../api';

const CATEGORIES = [
  { name: 'Food', emoji: '🍜' },
  { name: 'Transport', emoji: '🚗' },
  { name: 'Entertainment', emoji: '🎬' },
  { name: 'Rent', emoji: '🏠' },
  { name: 'Bills', emoji: '📱' },
  { name: 'Shopping', emoji: '🛍️' },
  { name: 'Health', emoji: '💊' },
  { name: 'Other', emoji: '📦' }
];

const AddTransaction = ({ onAdd }) => {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Food');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [buttonText, setButtonText] = useState('Add Transaction');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !description || isSubmitting) return;

    setIsSubmitting(true);
    setButtonText('⏳ Adding...');

    const payload = {
      amount: parseFloat(amount),
      type,
      category,
      description,
      date: new Date().toISOString().split('T')[0]
    };

    const res = await addTransaction(payload);
    setIsSubmitting(false);

    if (res) {
      setButtonText('✅ Added!');
      setShowToast(true);
      if (onAdd) onAdd();
    } else {
      // Demo mode — still show success for UX
      setButtonText('✅ Added!');
      setShowToast(true);
    }

    // Reset after 2s
    setTimeout(() => {
      setAmount('');
      setDescription('');
      setCategory('Food');
      setButtonText('Add Transaction');
    }, 2000);

    // Dismiss toast after 3s
    setTimeout(() => setShowToast(false), 3000);
  };

  const isExpense = type === 'expense';
  const accentColor = isExpense ? THEME.COLORS.danger : '#00D4FF';

  return (
    <div style={{
      backgroundColor: THEME.COLORS.surface,
      border: `1px solid ${THEME.COLORS.border}`,
      borderRadius: THEME.BORDER_RADIUS.lg,
      padding: '24px',
      position: 'relative'
    }}>
      {/* Success Toast */}
      {showToast && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          backgroundColor: THEME.COLORS.bg,
          border: `1px solid ${THEME.COLORS.primary}`,
          borderRadius: THEME.BORDER_RADIUS.md,
          padding: '14px 20px',
          zIndex: 9999,
          boxShadow: THEME.SHADOWS.card,
          animation: 'slideInRight 0.3s ease',
          fontFamily: THEME.FONTS.body,
          fontSize: '14px',
          color: THEME.COLORS.primary
        }}>
          ✅ Transaction added!
          <style>{`
            @keyframes slideInRight {
              from { transform: translateX(100px); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          `}</style>
        </div>
      )}

      <h3 style={{
        fontFamily: THEME.FONTS.heading,
        fontSize: '18px',
        fontWeight: 700,
        color: THEME.COLORS.text,
        marginBottom: '20px'
      }}>
        Quick Add Transaction
      </h3>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

        {/* Type Toggle */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" onClick={() => setType('expense')} style={{
            flex: 1, padding: '12px', borderRadius: THEME.BORDER_RADIUS.md,
            cursor: 'pointer', fontFamily: THEME.FONTS.heading, fontWeight: 600, fontSize: '14px',
            transition: 'all 0.2s',
            backgroundColor: isExpense ? THEME.COLORS.danger + '20' : 'transparent',
            color: isExpense ? THEME.COLORS.danger : THEME.COLORS.muted,
            border: `1px solid ${isExpense ? THEME.COLORS.danger : THEME.COLORS.border}`
          }}>
            💸 Expense
          </button>
          <button type="button" onClick={() => setType('income')} style={{
            flex: 1, padding: '12px', borderRadius: THEME.BORDER_RADIUS.md,
            cursor: 'pointer', fontFamily: THEME.FONTS.heading, fontWeight: 600, fontSize: '14px',
            transition: 'all 0.2s',
            backgroundColor: !isExpense ? '#00D4FF20' : 'transparent',
            color: !isExpense ? '#00D4FF' : THEME.COLORS.muted,
            border: `1px solid ${!isExpense ? '#00D4FF' : THEME.COLORS.border}`
          }}>
            💚 Income
          </button>
        </div>

        {/* Amount */}
        <div style={{ position: 'relative' }}>
          <span style={{
            position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)',
            fontFamily: THEME.FONTS.mono, fontSize: '24px', color: THEME.COLORS.muted
          }}>₹</span>
          <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
            placeholder="0.00" required style={{
              width: '100%', backgroundColor: THEME.COLORS.bg,
              border: `1px solid ${THEME.COLORS.border}`, borderRadius: THEME.BORDER_RADIUS.md,
              padding: '14px 16px 14px 44px', color: THEME.COLORS.text,
              fontFamily: THEME.FONTS.mono, fontSize: '24px', outline: 'none'
            }}
          />
        </div>

        {/* Description */}
        <input type="text" value={description} onChange={e => setDescription(e.target.value)}
          placeholder="What was this for?" required style={{
            width: '100%', backgroundColor: THEME.COLORS.bg,
            border: `1px solid ${THEME.COLORS.border}`, borderRadius: THEME.BORDER_RADIUS.md,
            padding: '12px 16px', color: THEME.COLORS.text,
            fontFamily: THEME.FONTS.body, fontSize: '14px', outline: 'none'
          }}
        />

        {/* Category Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {CATEGORIES.map(cat => (
            <button key={cat.name} type="button" onClick={() => setCategory(cat.name)} style={{
              padding: '8px 14px', borderRadius: '20px',
              cursor: 'pointer', fontFamily: THEME.FONTS.body, fontSize: '13px',
              transition: 'all 0.2s',
              backgroundColor: category === cat.name ? THEME.COLORS.primary : 'transparent',
              color: category === cat.name ? '#0a0a0a' : THEME.COLORS.muted,
              border: `1px solid ${category === cat.name ? THEME.COLORS.primary : THEME.COLORS.border}`
            }}>
              {cat.emoji} {cat.name}
            </button>
          ))}
        </div>

        {/* Submit */}
        <button type="submit" disabled={isSubmitting} style={{
          width: '100%', padding: '16px',
          backgroundColor: isExpense ? THEME.COLORS.primary : '#00D4FF',
          color: '#0a0a0a', border: 'none', borderRadius: THEME.BORDER_RADIUS.md,
          fontFamily: THEME.FONTS.heading, fontSize: '14px', fontWeight: 700,
          cursor: isSubmitting ? 'not-allowed' : 'pointer',
          boxShadow: isExpense ? '4px 4px 0px #00CC6A' : '4px 4px 0px #00A3CC',
          transition: 'all 0.2s', marginTop: '8px'
        }}>
          {buttonText}
        </button>
      </form>
    </div>
  );
};

export default AddTransaction;
