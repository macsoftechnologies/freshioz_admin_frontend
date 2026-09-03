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
  const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
  try {
    // Official API Reference (Page 14): [PUT] /onboarding/:id (Full Update)
    const response = await api.put(`/onboarding/${id}`, payload, config);
    return response.data;
  } catch (putErr) {
    // If PUT returns 405 Method Not Allowed or 404, fall back to PATCH (Page 10/Postman Item 6)
    if (putErr?.response?.status === 405 || putErr?.response?.status === 404) {
      const response = await api.patch(`/onboarding/${id}`, payload, config);
      return response.data;
    }
    throw putErr;
  }
};

// Official API Reference (Page 15): [DELETE] /onboarding/:id/image
// Param: id, Body/Query: imageUrl (string)
export const removeOnboardingImage = async (id, imageUrl) => {
  const response = await api.delete(`/onboarding/${id}/image`, {
    data: { imageUrl },
    params: { imageUrl },
    headers: { 'Content-Type': 'application/json' }
  });
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
