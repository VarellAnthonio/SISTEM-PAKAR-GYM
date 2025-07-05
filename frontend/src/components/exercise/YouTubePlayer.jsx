// frontend/src/components/exercise/YouTubePlayer.jsx
import { useState } from 'react';
import { PlayIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const YouTubePlayer = ({ 
  videoId, 
  title, 
  className = "",
  width = "100%",
  height = "315",
  autoplay = false,
  controls = true,
  showTitle = true,
  thumbnail = true
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showPlayer, setShowPlayer] = useState(!thumbnail);

  // Generate embed URL with options
  const generateEmbedUrl = () => {
    if (!videoId) return null;
    
    const params = new URLSearchParams({
      autoplay: autoplay ? 1 : 0,
      controls: controls ? 1 : 0,
      rel: 0,
      modestbranding: 1,
      playsinline: 1,
      enablejsapi: 1
    });
    
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  };

  // Generate thumbnail URL
  const getThumbnailUrl = (quality = 'hqdefault') => {
    if (!videoId) return null;
    return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
  };

  // Handle iframe load
  const handleIframeLoad = () => {
    setIsLoaded(true);
    setHasError(false);
  };

  // Handle iframe error
  const handleIframeError = () => {
    setIsLoaded(false);
    setHasError(true);
  };

  // Handle play button click
  const handlePlayClick = () => {
    setShowPlayer(true);
  };

  // If no video ID provided
  if (!videoId) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center p-8">
          <ExclamationTriangleIcon className="h-12 w-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No video available</p>
        </div>
      </div>
    );
  }

  // Error state
  if (hasError) {
    return (
      <div className={`flex items-center justify-center bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <div className="text-center p-8">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto mb-2" />
          <p className="text-red-600 text-sm">Failed to load video</p>
          <button
            onClick={() => {
              setHasError(false);
              setShowPlayer(true);
            }}
            className="mt-2 text-xs text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  // Thumbnail view with play button
  if (thumbnail && !showPlayer) {
    return (
      <div className={`relative group cursor-pointer ${className}`}>
        {showTitle && title && (
          <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
            {title}
          </h3>
        )}
        
        <div className="relative overflow-hidden rounded-lg bg-gray-900">
          <img
            src={getThumbnailUrl()}
            alt={title || 'Video thumbnail'}
            className="w-full h-auto object-cover transition-transform duration-200 group-hover:scale-105"
            style={{ aspectRatio: '16/9' }}
            onError={(e) => {
              e.target.src = getThumbnailUrl('mqdefault');
            }}
          />
          
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={handlePlayClick}
              className="bg-red-600 hover:bg-red-700 text-white rounded-full p-4 transform transition-all duration-200 hover:scale-110 shadow-lg group-hover:shadow-xl"
            >
              <PlayIcon className="h-8 w-8 ml-1" />
            </button>
          </div>
          
          {/* YouTube logo */}
          <div className="absolute bottom-2 right-2">
            <div className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
              YouTube
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full player view
  return (
    <div className={`${className}`}>
      {showTitle && title && (
        <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">
          {title}
        </h3>
      )}
      
      <div className="relative">
        {/* Loading indicator */}
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        )}
        
        {/* YouTube iframe */}
        <iframe
          src={generateEmbedUrl()}
          title={title || 'YouTube video player'}
          width={width}
          height={height}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          className="w-full rounded-lg shadow-lg"
          style={{ minHeight: height }}
        />
      </div>
      
      {/* Video info */}
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        <span>YouTube Video</span>
        <a
          href={`https://www.youtube.com/watch?v=${videoId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-red-600 transition-colors"
        >
          Watch on YouTube ↗
        </a>
      </div>
    </div>
  );
};

// Responsive YouTube Player component
export const ResponsiveYouTubePlayer = ({ 
  videoId, 
  title, 
  className = "",
  aspectRatio = "16:9"
}) => {
  const [showPlayer, setShowPlayer] = useState(false);

  if (!videoId) {
    return (
      <div className={`aspect-video flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center">
          <ExclamationTriangleIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">No video</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div 
        className="relative overflow-hidden rounded-lg"
        style={{ aspectRatio }}
      >
        <YouTubePlayer
          videoId={videoId}
          title={title}
          thumbnail={!showPlayer}
          className="absolute inset-0 w-full h-full"
          width="100%"
          height="100%"
        />
      </div>
    </div>
  );
};

// Mini YouTube Player for cards
export const MiniYouTubePlayer = ({ 
  videoId, 
  title,
  className = ""
}) => {
  const getThumbnailUrl = () => {
    if (!videoId) return null;
    return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
  };

  if (!videoId) {
    return (
      <div className={`w-full h-24 bg-gray-100 rounded flex items-center justify-center ${className}`}>
        <ExclamationTriangleIcon className="h-6 w-6 text-gray-400" />
      </div>
    );
  }

  return (
    <div className={`relative group ${className}`}>
      <img
        src={getThumbnailUrl()}
        alt={title || 'Video thumbnail'}
        className="w-full h-24 object-cover rounded"
        onError={(e) => {
          e.target.src = `https://img.youtube.com/vi/${videoId}/default.jpg`;
        }}
      />
      
      {/* Play icon overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="bg-black bg-opacity-50 rounded-full p-2">
          <PlayIcon className="h-4 w-4 text-white" />
        </div>
      </div>
      
      {/* YouTube badge */}
      <div className="absolute bottom-1 right-1">
        <div className="bg-red-600 text-white text-xs px-1 rounded">
          YT
        </div>
      </div>
    </div>
  );
};

export default YouTubePlayer;