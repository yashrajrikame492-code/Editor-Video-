/**
 * Converts various YouTube and Vimeo URL formats into their clean Embed URLs.
 * Supports:
 * - YouTube watch URLs (youtube.com/watch?v=...)
 * - YouTube short URLs (youtu.be/...)
 * - YouTube Shorts (youtube.com/shorts/...)
 * - YouTube Embed URLs (youtube.com/embed/...)
 * - Vimeo standard URLs (vimeo.com/...)
 * - Vimeo embed URLs (player.vimeo.com/video/...)
 */
export const getEmbedUrl = (url) => {
  if (!url) return '';

  // If already YouTube embed or Vimeo player, keep it but strip query params for clean handling
  if (url.includes('youtube.com/embed/') || url.includes('player.vimeo.com/video/')) {
    return url;
  }

  // YouTube standard & short URLs
  const ytRegex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const ytMatch = url.match(ytRegex);
  if (ytMatch && ytMatch[2].length === 11) {
    return `https://www.youtube.com/embed/${ytMatch[2]}`;
  }

  // YouTube Shorts
  if (url.includes('/shorts/')) {
    const parts = url.split('/shorts/');
    if (parts.length > 1) {
      const id = parts[1].split(/[?#&]/)[0];
      return `https://www.youtube.com/embed/${id}`;
    }
  }

  // Vimeo standard & embed URLs
  const vimeoRegex = /vimeo\.com\/(?:video\/)?([0-9]+)/;
  const vimeoMatch = url.match(vimeoRegex);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  // Instagram URLs (p, reel, reels, tv)
  const igRegex = /instagram\.com\/(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)/;
  const igMatch = url.match(igRegex);
  if (igMatch) {
    return `https://www.instagram.com/p/${igMatch[1]}/embed/`;
  }

  return url;
};

/**
 * Extracts YouTube/Vimeo ID or returns a custom/fallback thumbnail.
 */
export const getThumbnailUrl = (video) => {
  if (video.thumbnail_file) return video.thumbnail_file;

  const url = video.thumbnail_url || video.embed_url || '';

  // YouTube ID extraction (works with embed or standard)
  const ytEmbedMatch = url.match(/embed\/([a-zA-Z0-9_-]+)/);
  if (ytEmbedMatch) {
    return `https://img.youtube.com/vi/${ytEmbedMatch[1]}/maxresdefault.jpg`;
  }
  const ytRegex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const ytMatch = url.match(ytRegex);
  if (ytMatch && ytMatch[2].length === 11) {
    return `https://img.youtube.com/vi/${ytMatch[2]}/maxresdefault.jpg`;
  }

  // YouTube Shorts
  if (url.includes('/shorts/')) {
    const parts = url.split('/shorts/');
    if (parts.length > 1) {
      const id = parts[1].split(/[?#&]/)[0];
      return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
    }
  }

  // Instagram Fallback
  if (url.includes('instagram.com')) {
    return 'https://placehold.co/640x360/111/333?text=Instagram+Reel';
  }

  // If a custom thumbnail_url is provided and it is a direct image URL (didn't match video patterns above)
  if (video.thumbnail_url) return video.thumbnail_url;

  // Fallback
  return 'https://placehold.co/640x360/111/333?text=Video';
};
