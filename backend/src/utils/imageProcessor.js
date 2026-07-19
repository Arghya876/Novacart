/**
 * Utility to process and optimize image URLs into WebP format before database storage
 */

const toWebpUrl = (url) => {
  if (!url || typeof url !== 'string') return url;

  // 1. Cloudinary URLs: inject f_webp,q_auto transformation
  if (url.includes('res.cloudinary.com') && !url.includes('f_webp')) {
    return url.replace('/upload/', '/upload/f_webp,q_auto/');
  }

  // 2. Unsplash / CDN URLs with query parameters: add format=webp
  if (url.includes('unsplash.com') || url.includes('images.unsplash.com')) {
    if (url.includes('fm=')) {
      return url.replace(/fm=[a-z0-9]+/gi, 'fm=webp');
    }
    return url + (url.includes('?') ? '&fm=webp' : '?fm=webp');
  }

  // 3. Base64 data URIs: convert header prefix to image/webp
  if (url.startsWith('data:image/')) {
    return url.replace(/^data:image\/[a-zA-Z]+;/, 'data:image/webp;');
  }

  // 4. Standard image paths ending with .png, .jpg, .jpeg, .gif
  if (/\.(png|jpe?g|gif)(\?.*)?$/i.test(url)) {
    return url.replace(/\.(png|jpe?g|gif)(\?.*)?$/i, '.webp$2');
  }

  return url;
};

const processImages = (images) => {
  if (!images) return [];
  if (Array.isArray(images)) {
    return images.map(toWebpUrl);
  }
  if (typeof images === 'string') {
    return [toWebpUrl(images)];
  }
  return [];
};

module.exports = {
  toWebpUrl,
  processImages,
};
