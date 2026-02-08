import { storage } from '@/lib/insforge';

export const integrations = {
  // Upload file
  uploadFile: async ({ file, bucket = 'products' }) => {
    try {
      const timestamp = Date.now();
      const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const path = `${timestamp}-${safeName}`;

      const { data, error } = await storage.from(bucket).upload(path, file);
      if (error) throw error;

      const { data: { publicUrl } } = storage.from(bucket).getPublicUrl(path);
      return { file_url: publicUrl };
    } catch (err) {
      console.error('Integration Upload Error:', err);
      throw err;
    }
  },

  // Send email
  sendEmail: async ({ to, subject, body, html }) => {
    console.warn('Email service not configured in serverless mode');
    return { success: false, message: 'Email service requires Edge Function' };
  },
};

export default integrations;

