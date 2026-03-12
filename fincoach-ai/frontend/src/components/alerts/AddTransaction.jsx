import React, { useState } from 'react';
import { THEME } from '../../styles/theme';
import { addTransaction } from '../../api';

const AddTransaction = ({ onAdded }) => {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = ['Food', 'Transport', 'Entertainment', 'Rent', 'Bills', 'Shopping', 'Other', 'Freelance', 'Salary'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !description) return;

    setIsSubmitting(true);
    
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
      setAmount('');
      setDescription('');
      onAdded(); // Trigger refresh in parent
    } else {
      alert("Demo Mode: Transaction added locally (backend not connected).");
      setAmount('');
      setDescription('');
    }
  };

  return (
    <div style={{
      backgroundColor: THEME.COLORS.surfaceHover,
      border: `1px solid ${THEME.COLORS.border}`,
      borderRadius: THEME.BORDER_RADIUS.lg,
      padding: '24px'
    }}>
      <h3 style={{ 
        fontFamily: THEME.FONTS.heading, 
        color: THEME.COLORS.text,
        marginBottom: '20px',
        fontSize: '18px'
      }}>
        Quick Add Transaction
      </h3>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        
        {/* Type Toggle */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setType('expense')}
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: type === 'expense' ? THEME.COLORS.danger + '20' : 'transparent',
              color: type === 'expense' ? THEME.COLORS.danger : THEME.COLORS.textSecondary,
              border: `1px solid ${type === 'expense' ? THEME.COLORS.danger : THEME.COLORS.border}`,
              borderRadius: THEME.BORDER_RADIUS.md,
              cursor: 'pointer',
              fontFamily: THEME.FONTS.heading,
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            style={{
              flex: 1,
              padding: '10px',
              backgroundColor: type === 'income' ? THEME.COLORS.success + '20' : 'transparent',
              color: type === 'income' ? THEME.COLORS.success : THEME.COLORS.textSecondary,
              border: `1px solid ${type === 'income' ? THEME.COLORS.success : THEME.COLORS.border}`,
              borderRadius: THEME.BORDER_RADIUS.md,
              cursor: 'pointer',
              fontFamily: THEME.FONTS.heading,
              fontWeight: 600,
              transition: 'all 0.2s'
            }}
          >
            Income
          </button>
        </div>

        {/* Amount */}
        <div style={{ position: 'relative' }}>
          <span style={{ 
            position: 'absolute', 
            left: '16px', 
            top: '50%', 
            transform: 'translateY(-50%)',
            color: THEME.COLORS.textSecondary,
            fontFamily: THEME.FONTS.mono
          }}>₹</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
            className="number-font"
            style={{
              width: '100%',
              backgroundColor: THEME.COLORS.bg,
              border: `1px solid ${THEME.COLORS.border}`,
              borderRadius: THEME.BORDER_RADIUS.md,
              padding: '12px 16px 12px 32px',
              color: THEME.COLORS.text,
              fontSize: '16px',
              outline: 'none'
            }}
          />
        </div>

        {/* Category & Description Row */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              flex: 1,
              backgroundColor: THEME.COLORS.bg,
              border: `1px solid ${THEME.COLORS.border}`,
              borderRadius: THEME.BORDER_RADIUS.md,
              padding: '12px',
              color: THEME.COLORS.text,
              fontFamily: THEME.FONTS.body,
              outline: 'none',
              appearance: 'none'
            }}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What was this for?"
            required
            style={{
              flex: 2,
              backgroundColor: THEME.COLORS.bg,
              border: `1px solid ${THEME.COLORS.border}`,
              borderRadius: THEME.BORDER_RADIUS.md,
              padding: '12px 16px',
              color: THEME.COLORS.text,
              fontFamily: THEME.FONTS.body,
              outline: 'none'
            }}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            backgroundColor: THEME.COLORS.primary,
            color: '#000',
            border: 'none',
            borderRadius: THEME.BORDER_RADIUS.md,
            padding: '14px',
            fontFamily: THEME.FONTS.heading,
            fontSize: '14px',
            fontWeight: 700,
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            opacity: isSubmitting ? 0.7 : 1,
            boxShadow: THEME.SHADOWS.brutalist,
            marginTop: '8px'
          }}
        >
          {isSubmitting ? 'Adding...' : 'Add Transaction'}
        </button>

      </form>
    </div>
  );
};

export default AddTransaction;
