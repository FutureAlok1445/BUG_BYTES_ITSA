import axios from 'axios';

const BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: BASE_URL,
});

export const getDashboard = async () => {
  const response = await api.get('/dashboard');
  return response.data;
};

export const getInsights = async () => {
  const response = await api.get('/insights');
  return response.data;
};

export const sendChat = async (message) => {
  const response = await api.post('/chat', { message });
  return response.data;
};

export const addTransaction = async (transaction) => {
  const response = await api.post('/transactions', transaction);
  return response.data;
};

export const addGoal = async (goal) => {
  const response = await api.post('/goals', goal);
  return response.data;
};
