import api from './client';

export const integrations = {
  // Upload file
  uploadFile: async ({ file }) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const result = await api.post('/upload', formData);
    return { file_url: result.url || result.file_url || result.path };
  },

  // Send email
  sendEmail: async ({ to, subject, body, html }) => {
    return await api.post('/email', {
      to,
      subject,
      body,
      html,
    });
  },
};

export default integrations;

