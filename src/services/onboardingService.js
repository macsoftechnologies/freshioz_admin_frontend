import api from './api';

export const getOnboardings = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  if (filters.startDate) queryParams.append('startDate', filters.startDate);
  if (filters.endDate) queryParams.append('endDate', filters.endDate);
  if (filters.type) queryParams.append('type', filters.type);
  if (filters.status) queryParams.append('status', filters.status);
  if (filters.addedBy) queryParams.append('addedBy', filters.addedBy);
  if (filters.search) queryParams.append('search', filters.search);

  const queryString = queryParams.toString();
  const url = `/onboarding${queryString ? `?${queryString}` : ''}`;
  
  const response = await api.get(url);
  return response.data;
};

export const getOnboardingDetails = async (id) => {
  const response = await api.get(`/onboarding/${id}`);
  return response.data;
};

export const addOnboarding = async (payload) => {
  const isFormData = payload instanceof FormData;
  const response = await api.post('/onboarding', payload, isFormData ? {
    headers: { 'Content-Type': 'multipart/form-data' }
  } : {});
  return response.data;
};

export const updateOnboarding = async (id, payload) => {
  const isFormData = payload instanceof FormData;
  const response = await api.put(`/onboarding/${id}`, payload, isFormData ? {
    headers: { 'Content-Type': 'multipart/form-data' }
  } : {});
  return response.data;
};

export const deleteOnboarding = async (id) => {
  const response = await api.delete(`/onboarding/${id}`);
  return response.data;
};

export const updateOnboardingStatus = async (id, status, rejectionReason = '') => {
  const payload = { status };
  if (rejectionReason) payload.rejectionReason = rejectionReason;
  
  const response = await api.patch(`/onboarding/${id}/status`, payload);
  return response.data;
};

export const getEmployeeOnboardings = async (employeeId, filters = {}) => {
  const queryParams = new URLSearchParams();
  if (filters.startDate) queryParams.append('startDate', filters.startDate);
  if (filters.endDate) queryParams.append('endDate', filters.endDate);

  const queryString = queryParams.toString();
  const url = `/onboarding/employee/${employeeId}${queryString ? `?${queryString}` : ''}`;
  
  const response = await api.get(url);
  return response.data;
};
