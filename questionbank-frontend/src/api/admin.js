import client from './client';

export const getAdminStats = async () => {
  const response = await client.get('/admin/stats');
  return response.data;
};

export const getAdminUsers = async () => {
  const response = await client.get('/admin/users');
  return response.data;
};

export const updateAdminUserRole = async (id, role) => {
  const response = await client.patch(`/admin/users/${id}/role`, { role });
  return response.data;
};

export const approveAdminQuestion = async (id) => {
  const response = await client.patch(`/admin/questions/${id}/approve`);
  return response.data;
};

export const rejectAdminQuestion = async (id) => {
  const response = await client.patch(`/admin/questions/${id}/reject`);
  return response.data;
};

export const fetchOnlineQuestions = async ({ source, topic, category_id, subcategory_id }) => {
  const response = await client.post('/admin/fetch-online', {
    source,
    topic,
    category_id,
    subcategory_id
  });
  return response.data;
};

// Generates the download URL with authentication parameters
export const getPdfExportUrl = (filters = {}) => {
  const token = localStorage.getItem('token');
  const query = new URLSearchParams({ ...filters, token }).toString();
  const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
  
  // Note: Since browsers navigate away for direct file downloads, we can stream using this URL 
  // or construct a request. To bypass auth middleware in a normal browser redirect, 
  // we can append the token as a query parameter and customize Laravel's auth check,
  // OR fetch the blob via Axios and download it client-side.
  // Let's implement the Axios blob download client-side as it is much more secure!
  return `/admin/export/pdf?${new URLSearchParams(filters).toString()}`;
};

export const downloadPdfExport = async (filters = {}) => {
  const response = await client.get('/admin/export/pdf', {
    params: filters,
    responseType: 'blob', // Important for handling file downloads
  });
  return response.data;
};
