import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const saveFile = async (file, subfolder = '') => {
  const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');
  const targetDir = path.join(uploadDir, subfolder);
  
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  const ext = path.extname(file.originalname);
  const filename = `file-${uniqueSuffix}${ext}`;
  const filepath = path.join(targetDir, filename);

  fs.writeFileSync(filepath, file.buffer);

  // Return URL path (relative to uploads directory)
  const url = `/uploads/${subfolder ? subfolder + '/' : ''}${filename}`;
  
  return {
    url,
    path: filepath,
    filename,
    size: file.size,
    mimetype: file.mimetype,
  };
};

export const deleteFile = async (fileUrl) => {
  try {
    const uploadDir = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');
    const filepath = path.join(uploadDir, fileUrl.replace('/uploads/', ''));
    
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

