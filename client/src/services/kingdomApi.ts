import axios from 'axios';
import type { AxiosResponse } from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: `${API_URL}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export type DistrictLevelInfo = {
  level: number;
  currentXP: number;
  nextLevelXP: number;
  totalPoints: number;
  progressPercent: number;
};

export type KingdomOverviewResponse = {
  districtPoints: Record<string, number>;
  districtProgress: {
    health: DistrictLevelInfo;
    learning: DistrictLevelInfo;
    career: DistrictLevelInfo;
    finance: DistrictLevelInfo;
    social: DistrictLevelInfo;
    mindfulness: DistrictLevelInfo;
  };
};

export const kingdomAPI = {
  getOverview: (): Promise<AxiosResponse<KingdomOverviewResponse>> => api.get('/kingdom/overview'),
};





