/**
 * Image optimization utilities
 * Provides lazy loading, WebP support, and responsive image handling
 */

/**
 * Check if browser supports WebP
 */
export const supportsWebP = () => {
  if (typeof window === 'undefined') return false;
  
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
};

/**
 * Get optimized image URL
 * @param {string} url - Original image URL
 * @param {Object} options - Optimization options
 * @returns {string} Optimized image URL
 */
export const getOptimizedImageUrl = (url, options = {}) => {
  if (!url) return null;

  const {
    width,
    height,
    quality = 80,
    format = 'auto',
  } = options;

  // If using a CDN that supports image optimization (e.g., Cloudinary, Imgix)
  // You would add the transformation parameters here
  // For now, we'll return the original URL
  
  // Example for Cloudinary:
  // if (url.includes('cloudinary.com')) {
  //   const transformations = [];
  //   if (width) transformations.push(`w_${width}`);
  //   if (height) transformations.push(`h_${height}`);
  //   if (quality) transformations.push(`q_${quality}`);
  //   if (format === 'webp' && supportsWebP()) transformations.push('f_webp');
  //   return transformations.length > 0 
  //     ? url.replace('/upload/', `/upload/${transformations.join(',')}/`)
  //     : url;
  // }

  return url;
};

/**
 * Generate srcset for responsive images
 * @param {string} baseUrl - Base image URL
 * @param {Array} widths - Array of widths
 * @returns {string} srcset string
 */
export const generateSrcSet = (baseUrl, widths = [400, 800, 1200, 1600]) => {
  if (!baseUrl) return '';
  
  return widths
    .map((width) => {
      const optimizedUrl = getOptimizedImageUrl(baseUrl, { width });
      return `${optimizedUrl} ${width}w`;
    })
    .join(', ');
};

/**
 * Lazy load image component props
 */
export const getLazyImageProps = (src, alt, options = {}) => {
  const {
    placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWYxZjFmIi8+PC9zdmc+',
    loading = 'lazy',
    decoding = 'async',
  } = options;

  return {
    src,
    alt: alt || '',
    loading,
    decoding,
    srcSet: generateSrcSet(src),
    onError: (e) => {
      // Fallback to placeholder on error
      if (e.target.src !== placeholder) {
        e.target.src = placeholder;
      }
    },
  };
};

/**
 * Preload critical images
 * @param {Array<string>} urls - Array of image URLs to preload
 */
export const preloadImages = (urls) => {
  if (typeof window === 'undefined') return;

  urls.forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
};

/**
 * Check if image is loaded
 * @param {string} url - Image URL
 * @returns {Promise<boolean>}
 */
export const checkImageLoaded = (url) => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
};

/**
 * Get image dimensions
 * @param {string} url - Image URL
 * @returns {Promise<{width: number, height: number}>}
 */
export const getImageDimensions = (url) => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window not available'));
      return;
    }

    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
};

