// GPS and distance calculation utilities

/**
 * Calculate distance between two GPS points using Haversine formula
 * @param {Array} point1 - [lat, lng] of first point
 * @param {Array} point2 - [lat, lng] of second point
 * @returns {number} - Distance in kilometers
 */
export const calculateDistance = (point1, point2) => {
  const [lat1, lon1] = point1;
  const [lat2, lon2] = point2;
  
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  return R * c;
};

/**
 * Calculate total distance of a path
 * @param {Array} path - Array of [lat, lng] coordinates
 * @returns {number} - Total distance in kilometers
 */
export const calculatePathDistance = (path) => {
  if (path.length < 2) return 0;
  
  let totalDistance = 0;
  for (let i = 1; i < path.length; i++) {
    totalDistance += calculateDistance(path[i - 1], path[i]);
  }
  
  return totalDistance;
};

/**
 * Calculate the center point of a path
 * @param {Array} path - Array of [lat, lng] coordinates
 * @returns {Array} - [lat, lng] center point
 */
export const getPathCenter = (path) => {
  if (path.length === 0) return [0, 0];
  
  const sumLat = path.reduce((sum, point) => sum + point[0], 0);
  const sumLng = path.reduce((sum, point) => sum + point[1], 0);
  
  return [
    sumLat / path.length,
    sumLng / path.length
  ];
};

/**
 * Check if browser supports geolocation
 * @returns {boolean} - True if geolocation is supported
 */
export const isGeolocationSupported = () => {
  return 'geolocation' in navigator;
};

/**
 * Get user's current position
 * @returns {Promise} - Promise that resolves with position
 */
export const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (!isGeolocationSupported()) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000 // 1 minute
      }
    );
  });
};

/**
 * Watch user's position changes
 * @param {Function} onSuccess - Callback for successful position updates
 * @param {Function} onError - Callback for errors
 * @returns {number} - Watch ID that can be used to stop watching
 */
export const watchPosition = (onSuccess, onError) => {
  if (!isGeolocationSupported()) {
    onError(new Error('Geolocation is not supported by your browser'));
    return null;
  }

  return navigator.geolocation.watchPosition(
    onSuccess,
    onError,
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    }
  );
};

/**
 * Stop watching position changes
 * @param {number} watchId - The watch ID returned by watchPosition
 */
export const clearWatch = (watchId) => {
  if (watchId && navigator.geolocation) {
    navigator.geolocation.clearWatch(watchId);
  }
};

/**
 * Format distance for display
 * @param {number} distance - Distance in kilometers
 * @returns {string} - Formatted distance string
 */
export const formatDistance = (distance) => {
  if (distance < 1) {
    return `${(distance * 1000).toFixed(0)} m`;
  }
  return `${distance.toFixed(2)} km`;
};

/**
 * Format time for display
 * @param {number} seconds - Time in seconds
 * @returns {string} - Formatted time string
 */
export const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Calculate pace (minutes per kilometer)
 * @param {number} distance - Distance in kilometers
 * @param {number} time - Time in seconds
 * @returns {string} - Formatted pace string
 */
export const calculatePace = (distance, time) => {
  if (distance === 0) return '0:00';
  
  const paceSeconds = time / distance;
  const paceMinutes = Math.floor(paceSeconds / 60);
  const paceSecs = Math.floor(paceSeconds % 60);
  
  return `${paceMinutes}:${paceSecs.toString().padStart(2, '0')} /km`;
};
