import React, { useState, useEffect, useRef } from 'react';
import { 
  watchPosition, 
  clearWatch, 
  calculateDistance,
  formatDistance
} from '../utils/gpsUtils';

const RunTracker = ({ onPathUpdate, onStatsUpdate }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [currentPath, setCurrentPath] = useState([]);
  const [distance, setDistance] = useState(0);
  const [duration, setDuration] = useState(0);
  const [watchId, setWatchId] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [lastPosition, setLastPosition] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (watchId) {
        clearWatch(watchId);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [watchId]);

  const startRecording = () => {
    setIsRecording(true);
    setCurrentPath([]);
    setDistance(0);
    setDuration(0);
    setStartTime(Date.now());
    setLastPosition(null);

    // Start timer
    intervalRef.current = setInterval(() => {
      setDuration(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    // Start GPS tracking
    const id = watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newPosition = [latitude, longitude];
        
        setCurrentPath(prevPath => {
          const newPath = [...prevPath, newPosition];
          
          // Calculate distance from last position
          if (lastPosition) {
            const segmentDistance = calculateDistance(lastPosition, newPosition);
            setDistance(prevDistance => prevDistance + segmentDistance);
          }
          
          setLastPosition(newPosition);
          
          // Update parent components
          if (onPathUpdate) {
            onPathUpdate(newPath);
          }
          if (onStatsUpdate) {
            onStatsUpdate({
              distance: distance + (lastPosition ? calculateDistance(lastPosition, newPosition) : 0),
              duration: Math.floor((Date.now() - startTime) / 1000),
              pathLength: newPath.length
            });
          }
          
          return newPath;
        });
      },
      (error) => {
        console.error('GPS tracking error:', error);
        alert('GPS tracking failed. Please ensure location services are enabled.');
        stopRecording();
      }
    );

    setWatchId(id);
  };

  const stopRecording = () => {
    setIsRecording(false);
    
    // Stop GPS tracking
    if (watchId) {
      clearWatch(watchId);
      setWatchId(null);
    }
    
    // Stop timer
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    console.log('Recording stopped:', { path: currentPath, distance, duration });
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculatePace = () => {
    if (distance === 0) return '0:00 /km';
    const paceSeconds = duration / distance;
    const paceMinutes = Math.floor(paceSeconds / 60);
    const paceSecs = Math.floor(paceSeconds % 60);
    return `${paceMinutes}:${paceSecs.toString().padStart(2, '0')} /km`;
  };

  return (
    <div className="run-tracker">
      <div className="card">
        <div className="card-header">Run Stats</div>
        <div className="stat-item">
          <span className="stat-label">Distance:</span>
          <span className="stat-value">{formatDistance(distance)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Time:</span>
          <span className="stat-value">{formatTime(duration)}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Pace:</span>
          <span className="stat-value">{calculatePace()}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Points:</span>
          <span className="stat-value">{currentPath.length}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">Status:</span>
          <span className="stat-value" style={{ color: isRecording ? '#ef4444' : '#10b981' }}>
            {isRecording ? 'Recording' : 'Not Recording'}
          </span>
        </div>
      </div>
      
      <div className="card">
        <div className="card-header">Controls</div>
        {!isRecording ? (
          <button className="btn btn-success btn-full" onClick={startRecording}>
            Start Recording
          </button>
        ) : (
          <button className="btn btn-danger btn-full" onClick={stopRecording}>
            Stop Recording
          </button>
        )}
      </div>
      
      <div className="card">
        <div className="card-header">Tips</div>
        <p className="text-small">
          <strong>Tip:</strong> Keep your phone with you and maintain a steady pace for better territory creation!
        </p>
        <p className="text-small mt-2">
          <strong>Note:</strong> GPS accuracy depends on your device and location. Try to run in open areas for best results.
        </p>
      </div>
    </div>
  );
};

export default RunTracker;
