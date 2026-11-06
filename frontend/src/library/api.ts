import axios from 'axios';
import { UploadResponse, TaskStatusResponse } from '@/types';

const rawApiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/+$/, '');
export const ROOT_BASE = rawApiUrl.replace(/\/api\/v1$/, '');
export const API_BASE = `${ROOT_BASE}/api/v1`;
export const API_DOCS_URL = `${ROOT_BASE}/docs`;

const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

export const uploadDocument = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await apiClient.post<UploadResponse>('/extract', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return response.data;
};

export const checkTaskStatus = async (taskId: string): Promise<TaskStatusResponse> => {
  const response = await apiClient.get<TaskStatusResponse>(`/status/${taskId}`, {
    timeout: 10000,
  });
  return response.data;
};

export const checkHealth = async (): Promise<boolean> => {
  try {
    const healthUrl = `${ROOT_BASE}/health`;
    const response = await axios.get(healthUrl, { timeout: 3000 });
    return response.data?.status === 'healthy' || response.data?.status === 'degraded';
  } catch {
    return false;
  }
};
