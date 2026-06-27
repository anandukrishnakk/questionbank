import client from './client';

export const getQuestions = async (params = {}) => {
  const response = await client.get('/questions', { params });
  return response.data;
};

export const getQuestionById = async (id) => {
  const response = await client.get(`/questions/${id}`);
  return response.data;
};

export const createQuestion = async (data) => {
  const response = await client.post('/questions', data);
  return response.data;
};

export const updateQuestion = async (id, data) => {
  const response = await client.put(`/questions/${id}`, data);
  return response.data;
};

export const deleteQuestion = async (id) => {
  const response = await client.delete(`/questions/${id}`);
  return response.data;
};

export const uploadQuestionImage = async (id, file, caption = '') => {
  const formData = new FormData();
  formData.append('image', file);
  if (caption) {
    formData.append('caption', caption);
  }
  const response = await client.post(`/questions/${id}/images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};
