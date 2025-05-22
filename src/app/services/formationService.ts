import axios from 'axios';

const API_URL = 'http://localhost:3001/formateur';

export const getFormations = async () => {
  const token = localStorage.getItem('token');
  const response = await axios.get(`${API_URL}/formations`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const createFormation = async (formationData: any) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(`${API_URL}/formations`, formationData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};
