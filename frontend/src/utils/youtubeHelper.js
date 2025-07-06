// frontend/src/utils/youtubeHelper.js - ROBUST VERSION
/**
 * Robust YouTube URL Helper Functions
 * Handles all possible YouTube URL formats
 */

/**
 * Extract YouTube video ID from any YouTube URL format
 * @param {string} url - The YouTube URL
 * @returns {string|null} - Video ID or null if not found
 */
export const extractVideoId = (url) => {
  if (!url || typeof url !== 'string') {
    console.warn('❌ Invalid URL provided:', url);
    return null;
  }

  try {
    // Clean the URL first
    const cleanUrl = url.trim();
    
    // Multiple YouTube URL patterns - MORE COMPREHENSIVE
    const patterns = [
      // Standard watch URLs
      /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/watch\?.*&v=)([a-zA-Z0-9_-]{11})/,
      /(?:youtube\.com\/watch\?.*\?v=)([a-zA-Z0-9_-]{11})/,
      
      // Short URLs
      /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      
      // Embed URLs
      /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      
      // V URLs
      /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
      
      // Mobile URLs
      /(?:m\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
      
      // Gaming URLs
      /(?:gaming\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
      
      // Playlist URLs
      /(?:youtube\.com\/watch\?.*list=.*&v=)([a-zA-Z0-9_-]{11})/,
      
      // Live URLs
      /(?:youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/,
      
      // Shorts URLs
      /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
      
      // Any URL with video ID pattern (fallback)
      /([a-zA-Z0-9_-]{11})/
    ];
    
    // Try each pattern
    for (let i = 0; i < patterns.length; i++) {
      const pattern = patterns[i];
      const match = cleanUrl.match(pattern);
      
      if (match && match[1]) {
        const videoId = match[1];
        
        // Validate video ID format (YouTube video IDs are always 11 characters)
        if (videoId.length === 11 && /^[a-zA-Z0-9_-]+$/.test(videoId)) {
          console.log('✅ Video ID extracted:', videoId, 'from URL:', url);
          return videoId;
        }
      }
    }
    
    console.warn('❌ Could not extract valid video ID from URL:', url);
    return null;
    
  } catch (error) {
    console.error('❌ Error extracting video ID:', error);
    return null;
  }
};

/**
 * Validate if URL is a valid YouTube URL
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if valid YouTube URL
 */
export const validateYouTubeUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return false;
  }

  // More permissive YouTube URL validation
  const youtubePatterns = [
    /^https?:\/\/(www\.)?youtube\.com\/.+/,
    /^https?:\/\/youtu\.be\/.+/,
    /^https?:\/\/(m\.)?youtube\.com\/.+/,
    /^https?:\/\/gaming\.youtube\.com\/.+/,
    // Allow URLs without protocol
    /^(www\.)?youtube\.com\/.+/,
    /^youtu\.be\/.+/,
    /^(m\.)?youtube\.com\/.+/
  ];

  return youtubePatterns.some(pattern => pattern.test(url.trim()));
};

/**
 * Normalize YouTube URL to standard format
 * @param {string} url - YouTube URL
 * @returns {string|null} - Normalized URL or null
 */
export const normalizeYouTubeUrl = (url) => {
  const videoId = extractVideoId(url);
  if (!videoId) return null;
  
  return `https://www.youtube.com/watch?v=${videoId}`;
};

/**
 * Generate YouTube embed URL
 * @param {string} videoId - YouTube video ID
 * @param {object} options - Embed options
 * @returns {string|null} - Embed URL
 */
export const generateEmbedUrl = (videoId, options = {}) => {
  if (!videoId) return null;
  
  const defaultOptions = {
    autoplay: 0,
    controls: 1,
    rel: 0,
    modestbranding: 1,
    playsinline: 1
  };
  
  const embedOptions = { ...defaultOptions, ...options };
  const params = new URLSearchParams(embedOptions);
  
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
};

/**
 * Generate YouTube thumbnail URL
 * @param {string} videoId - YouTube video ID
 * @param {string} quality - Thumbnail quality
 * @returns {string|null} - Thumbnail URL
 */
export const generateThumbnailUrl = (videoId, quality = 'hqdefault') => {
  if (!videoId) return null;
  
  const validQualities = ['default', 'mqdefault', 'hqdefault', 'sddefault', 'maxresdefault'];
  const thumbnailQuality = validQualities.includes(quality) ? quality : 'hqdefault';
  
  return `https://img.youtube.com/vi/${videoId}/${thumbnailQuality}.jpg`;
};

/**
 * Process YouTube URL for exercise
 * @param {string} url - YouTube URL
 * @returns {object} - Processed data
 */
export const processYouTubeUrl = (url) => {
  if (!url) {
    return {
      isValid: false,
      error: 'URL is required'
    };
  }

  // First normalize the URL if needed
  let processUrl = url.trim();
  
  // Add protocol if missing
  if (!processUrl.startsWith('http')) {
    if (processUrl.startsWith('www.') || processUrl.startsWith('youtube.') || processUrl.startsWith('youtu.be')) {
      processUrl = 'https://' + processUrl;
    }
  }

  const isValid = validateYouTubeUrl(processUrl);
  if (!isValid) {
    return {
      isValid: false,
      error: 'Invalid YouTube URL format'
    };
  }

  const videoId = extractVideoId(processUrl);
  if (!videoId) {
    return {
      isValid: false,
      error: 'Could not extract video ID from URL'
    };
  }

  const normalizedUrl = normalizeYouTubeUrl(processUrl);
  const embedUrl = generateEmbedUrl(videoId);
  const thumbnailUrl = generateThumbnailUrl(videoId);

  return {
    isValid: true,
    videoId,
    originalUrl: url,
    normalizedUrl,
    embedUrl,
    thumbnailUrl
  };
};

// Export default functions
export default {
  extractVideoId,
  validateYouTubeUrl,
  normalizeYouTubeUrl,
  generateEmbedUrl,
  generateThumbnailUrl,
  processYouTubeUrl
};