/**
 * Photo validation utilities for verification photos
 */

import fs from 'fs';

const MIN_FILE_SIZE = 5 * 1024; // 5KB
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

/**
 * Validate photo file
 * @param {string} filePath - Path to the photo file
 * @param {number} fileSize - File size in bytes
 * @returns {Object} { valid: boolean, error?: string }
 */
export const validatePhoto = (filePath, fileSize) => {
  // Check file size
  if (fileSize < MIN_FILE_SIZE) {
    return {
      valid: false,
      error: `Foto ist zu klein. Mindestgröße: ${(MIN_FILE_SIZE / 1024).toFixed(0)}KB`,
    };
  }

  if (fileSize > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Foto ist zu groß. Maximale Größe: ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB`,
    };
  }

  // Check file extension
  const extension = filePath.toLowerCase().substring(filePath.lastIndexOf('.'));
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `Ungültiges Dateiformat. Erlaubt: JPG, PNG, WEBP`,
    };
  }

  // Check if file exists
  if (!fs.existsSync(filePath)) {
    return {
      valid: false,
      error: 'Datei nicht gefunden',
    };
  }

  // Basic file header check (magic numbers)
  try {
    const buffer = fs.readFileSync(filePath, { start: 0, end: 12 });
    const isValidImage = checkImageHeader(buffer);

    if (!isValidImage) {
      return {
        valid: false,
        error: 'Datei ist kein gültiges Bild',
      };
    }
  } catch (error) {
    return {
      valid: false,
      error: 'Fehler beim Lesen der Datei',
    };
  }

  return { valid: true };
};

/**
 * Validate an in-memory photo buffer
 * @param {Buffer} buffer - Photo data
 * @param {string} filename - Filename (used for extension validation)
 * @returns {Object} { valid: boolean, error?: string }
 */
export const validatePhotoBuffer = (buffer, filename = 'photo.jpg') => {
  const fileSize = buffer?.length || 0;

  // Check file size
  if (fileSize < MIN_FILE_SIZE) {
    return {
      valid: false,
      error: `Foto ist zu klein. Mindestgröße: ${(MIN_FILE_SIZE / 1024).toFixed(0)}KB`,
    };
  }

  if (fileSize > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Foto ist zu groß. Maximale Größe: ${(MAX_FILE_SIZE / 1024 / 1024).toFixed(0)}MB`,
    };
  }

  const extension = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `Ungültiges Dateiformat. Erlaubt: JPG, PNG, WEBP`,
    };
  }

  try {
    const header = buffer.subarray(0, 12);
    const isValidImage = checkImageHeader(header);
    if (!isValidImage) {
      return {
        valid: false,
        error: 'Datei ist kein gültiges Bild',
      };
    }
  } catch {
    return {
      valid: false,
      error: 'Fehler beim Prüfen der Datei',
    };
  }

  return { valid: true };
};

/**
 * Check image file header (magic numbers)
 * @param {Buffer} buffer - First bytes of the file
 * @returns {boolean} True if valid image
 */
const checkImageHeader = (buffer) => {
  // JPEG: FF D8 FF
  if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
    return true;
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
    return true;
  }

  // WEBP: RIFF ... WEBP
  if (buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46) {
    // Check for WEBP at position 8
    if (buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50) {
      return true;
    }
  }

  return false;
};

/**
 * Get photo dimensions (basic check)
 * @param {string} filePath - Path to the photo file
 * @returns {Promise<Object>} { width, height } or null if error
 */
export const getPhotoDimensions = async (filePath) => {
  // This is a basic implementation
  // For production, consider using sharp or jimp library
  try {
    // For now, return null - can be extended with image processing library
    return null;
  } catch (error) {
    console.error('Error getting photo dimensions:', error);
    return null;
  }
};
