import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  timeout: 15000,
});

export const getDashboard = async () => {
  try {
    const res = await api.get('/dashboard');
    return res.data;
  } catch (error) {
    console.error('getDashboard Error:', error);
    return null;
  }
};

export const getInsights = async () => {
  try {
    const res = await api.get('/insights');
    return res.data;
  } catch (error) {
    console.error('getInsights Error:', error);
    return null;
  }
};

export const sendChat = async (message) => {
  try {
    const res = await api.post('/chat', { message });
    return res.data;
  } catch (error) {
    console.error('sendChat Error:', error);
    return null;
  }
};

export const addTransaction = async (data) => {
  try {
    const res = await api.post('/transactions', data);
    return res.data;
  } catch (error) {
    console.error('addTransaction Error:', error);
    return null;
  }
};

export const addGoal = async (data) => {
  try {
    const res = await api.post('/goals', data);
    return res.data;
  } catch (error) {
    console.error('addGoal Error:', error);
    return null;
  }
};

export const downloadReport = async () => {
  try {
    const res = await api.get('/reports/download', {
      responseType: 'blob'
    });
    return res.data;
  } catch (error) {
    console.error('downloadReport Error:', error);
    return null;
  }
};

export default api;
