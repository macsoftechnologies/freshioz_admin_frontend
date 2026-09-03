import api from './api';

export const getEmployees = async (filters = {}) => {
  const queryParams = new URLSearchParams();
  if (filters.role) queryParams.append('role', filters.role);
  if (filters.status) queryParams.append('status', filters.status);
  if (filters.startDate) queryParams.append('startDate', filters.startDate);
  if (filters.endDate) queryParams.append('endDate', filters.endDate);
  if (filters.search) queryParams.append('search', filters.search);

  const queryString = queryParams.toString();
  const url = `/users${queryString ? `?${queryString}` : ''}`;
  
  const response = await api.get(url);
  return response.data;
};

export const registerEmployee = async (payload) => {
  const response = await api.post('/users/register', payload);
  return response.data;
};

export const toggleEmployeeStatus = async (employeeId, status) => {
  const response = await api.patch('/users/status', {
    employeeId,
    status
  });
  return response.data;
};

export const updateEmployee = async (employeeId, payload) => {
  const response = await api.put(`/users/${employeeId}`, payload);
  return response.data;
};

export const deleteEmployee = async (employeeId) => {
  const response = await api.delete(`/users/${employeeId}`);
  return response.data;
};
