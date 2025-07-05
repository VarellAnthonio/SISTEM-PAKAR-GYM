// backend/utils/youtubeHelper.js

/**
 * YouTube URL Helper Functions
 * Pure JavaScript implementation for YouTube URL validation and utilities
 */

// YouTube URL patterns
const YOUTUBE_PATTERNS = [
  /^https?:\/\/(www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
  /^https?:\/\/(www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
  /^https?:\/\/youtu\.be\/([a-zA-Z0-9_-]{11})/,
  /^https?:\/\/(www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]{11})/
];

/**
 * Validate if URL is a valid YouTube URL
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if valid YouTube URL
 */
export const validateYouTubeUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return false;
  }

  return YOUTUBE_PATTERNS.some(pattern => pattern.test(url));
};

/**
 * Extract video ID from YouTube URL
 * @param {string} url - YouTube URL
 * @returns {string|null} - Video ID or null if not found
 */
export const extractVideoId = (url) => {
  if (!url || typeof url !== 'string') {
    return null;
  }

  for (const pattern of YOUTUBE_PATTERNS) {
    const match = url.match(pattern);
    if (match) {
      return match[2]; // Video ID is always in the second capture group
    }
  }

  return null;
};

/**
 * Generate YouTube embed URL from video ID
 * @param {string} videoId - YouTube video ID
 * @param {object} options - Embed options
 * @returns {string} - Embed URL
 */
export const generateEmbedUrl = (videoId, options = {}) => {
  if (!videoId) {
    return null;
  }

  const defaultOptions = {
    autoplay: 0,
    controls: 1,
    rel: 0,
    showinfo: 0,
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
 * @param {string} quality - Thumbnail quality (default, mqdefault, hqdefault, sddefault, maxresdefault)
 * @returns {string} - Thumbnail URL
 */
export const generateThumbnailUrl = (videoId, quality = 'hqdefault') => {
  if (!videoId) {
    return null;
  }

  const validQualities = ['default', 'mqdefault', 'hqdefault', 'sddefault', 'maxresdefault'];
  const thumbnailQuality = validQualities.includes(quality) ? quality : 'hqdefault';

  return `https://img.youtube.com/vi/${videoId}/${thumbnailQuality}.jpg`;
};

/**
 * Convert any YouTube URL to standard watch URL
 * @param {string} url - YouTube URL
 * @returns {string|null} - Standard YouTube watch URL
 */
export const normalizeYouTubeUrl = (url) => {
  const videoId = extractVideoId(url);
  if (!videoId) {
    return null;
  }

  return `https://www.youtube.com/watch?v=${videoId}`;
};

/**
 * Get video info from YouTube (basic info without API)
 * @param {string} videoId - YouTube video ID
 * @returns {object|null} - Basic video info or null
 */
export const getVideoInfo = async (videoId) => {
  if (!videoId) {
    return null;
  }

  try {
    // Since we're not using YouTube API, we'll return basic info
    // In a real implementation, you might want to use YouTube Data API
    return {
      videoId,
      embedUrl: generateEmbedUrl(videoId),
      thumbnailUrl: generateThumbnailUrl(videoId),
      watchUrl: `https://www.youtube.com/watch?v=${videoId}`,
      available: true // We assume it's available since we can't check without API
    };
  } catch (error) {
    console.error('Error getting video info:', error);
    return null;
  }
};

/**
 * Validate and process YouTube URL for database storage
 * @param {string} url - Raw YouTube URL
 * @returns {object} - Processed URL data
 */
export const processYouTubeUrl = (url) => {
  if (!url) {
    return {
      isValid: false,
      error: 'URL is required'
    };
  }

  const isValid = validateYouTubeUrl(url);
  if (!isValid) {
    return {
      isValid: false,
      error: 'Invalid YouTube URL format'
    };
  }

  const videoId = extractVideoId(url);
  if (!videoId) {
    return {
      isValid: false,
      error: 'Could not extract video ID'
    };
  }

  const normalizedUrl = normalizeYouTubeUrl(url);
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

/**
 * Generate YouTube iframe HTML
 * @param {string} videoId - YouTube video ID
 * @param {object} options - Iframe options
 * @returns {string} - HTML iframe string
 */
export const generateIframe = (videoId, options = {}) => {
  if (!videoId) {
    return '';
  }

  const defaultOptions = {
    width: 560,
    height: 315,
    frameborder: 0,
    allowfullscreen: true
  };

  const iframeOptions = { ...defaultOptions, ...options };
  const embedUrl = generateEmbedUrl(videoId, {
    autoplay: 0,
    controls: 1,
    rel: 0,
    modestbranding: 1
  });

  const attributes = Object.entries(iframeOptions)
    .map(([key, value]) => {
      if (key === 'allowfullscreen' && value) {
        return 'allowfullscreen';
      }
      return `${key}="${value}"`;
    })
    .join(' ');

  return `<iframe src="${embedUrl}" ${attributes} title="YouTube video player"></iframe>`;
};

/**
 * Extract video ID from embed code
 * @param {string} embedCode - YouTube embed code
 * @returns {string|null} - Video ID or null
 */
export const extractVideoIdFromEmbed = (embedCode) => {
  if (!embedCode || typeof embedCode !== 'string') {
    return null;
  }

  // Match video ID in iframe src
  const iframeMatch = embedCode.match(/src=["']https?:\/\/(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (iframeMatch) {
    return iframeMatch[1];
  }

  // Fallback to URL patterns
  return extractVideoId(embedCode);
};

/**
 * Get video duration placeholder (would need API for real duration)
 * @param {string} videoId - YouTube video ID
 * @returns {string} - Duration placeholder
 */
export const getVideoDurationPlaceholder = (videoId) => {
  // In a real implementation, you'd use YouTube Data API to get actual duration
  return 'Duration not available';
};

/**
 * Check if video is likely available (basic check without API)
 * @param {string} videoId - YouTube video ID
 * @returns {Promise<boolean>} - True if likely available
 */
export const checkVideoAvailability = async (videoId) => {
  if (!videoId) {
    return false;
  }

  try {
    // Basic check by trying to load thumbnail
    const thumbnailUrl = generateThumbnailUrl(videoId);
    
    // In a real browser environment, you could check if thumbnail loads
    // For Node.js, we'll assume it's available since we can't easily check
    return true;
  } catch (error) {
    console.error('Error checking video availability:', error);
    return false;
  }
};

/**
 * Utility functions for exercise integration
 */
export const exerciseVideoHelpers = {
  /**
   * Process video URL for exercise
   * @param {string} url - YouTube URL
   * @returns {object} - Processed video data for exercise
   */
  processForExercise: (url) => {
    const processed = processYouTubeUrl(url);
    
    if (!processed.isValid) {
      return processed;
    }

    return {
      ...processed,
      // Additional fields for exercise model
      hasVideo: true,
      videoType: 'youtube',
      videoData: {
        videoId: processed.videoId,
        embedUrl: processed.embedUrl,
        thumbnailUrl: processed.thumbnailUrl
      }
    };
  },

  /**
   * Generate exercise video embed options
   * @param {object} options - Custom options
   * @returns {object} - Embed options optimized for exercise videos
   */
  getExerciseEmbedOptions: (options = {}) => {
    return {
      autoplay: 0,
      controls: 1,
      rel: 0,
      showinfo: 0,
      modestbranding: 1,
      playsinline: 1,
      start: 0, // Can be overridden to skip intro
      ...options
    };
  },

  /**
   * Validate exercise video URL
   * @param {string} url - YouTube URL
   * @returns {object} - Validation result with exercise-specific checks
   */
  validateExerciseVideo: (url) => {
    const processed = processYouTubeUrl(url);
    
    if (!processed.isValid) {
      return {
        isValid: false,
        error: processed.error,
        code: 'INVALID_URL'
      };
    }

    // Additional validations for exercise videos can be added here
    // For example, checking video length, content type, etc.

    return {
      isValid: true,
      videoId: processed.videoId,
      embedUrl: processed.embedUrl,
      thumbnailUrl: processed.thumbnailUrl,
      message: 'Valid exercise video URL'
    };
  }
};