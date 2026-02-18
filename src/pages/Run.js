import React, { useState } from 'react';
import Navigation from '../components/Navigation';
import Map from '../components/Map';
import RunTracker from '../components/RunTracker';
import { createTerritoryFromPath, canCaptureTerritory } from '../utils/territoryUtils';
import { useAuth } from '../contexts/AuthContext';
import '../styles.css';

const Run = () => {
  const { user, isAuthenticated } = useAuth();
  const [currentPath, setCurrentPath] = useState([]);
  const [runStats, setRunStats] = useState({
    distance: 0,
    duration: 0,
    pathLength: 0
  });
  const [territories, setTerritories] = useState([]);
  const [isCreatingTerritory, setIsCreatingTerritory] = useState(false);

  const handlePathUpdate = (newPath) => {
    setCurrentPath(newPath);
  };

  const handleStatsUpdate = (stats) => {
    setRunStats(stats);
  };

  const handleCreateTerritory = async () => {
    if (currentPath.length < 3) {
      alert('You need at least 3 GPS points to create a territory!');
      return;
    }
    
    setIsCreatingTerritory(true);
    
    try {
      // Create territory from path
      const newTerritory = createTerritoryFromPath(currentPath, user);
      
      // Check if territory can be captured
      const validation = canCaptureTerritory(newTerritory, territories, user);
      
      if (!validation.canCapture) {
        alert(`Cannot create territory: ${validation.reason}`);
        return;
      }
      
      // Add territory to list
      setTerritories(prev => [...prev, newTerritory]);
      
      // Show success message
      alert(`Territory "${newTerritory.name}" created successfully!\n\n` +
            `Area: ${newTerritory.area.toFixed(3)} km²\n` +
            `Points: ${Math.floor(newTerritory.area * 1000) + 100}\n` +
            `GPS Points: ${newTerritory.pathLength}`);
      
      // Reset for next run
      setCurrentPath([]);
      setRunStats({ distance: 0, duration: 0, pathLength: 0 });
      
    } catch (error) {
      alert(`Error creating territory: ${error.message}`);
    } finally {
      setIsCreatingTerritory(false);
    }
  };

  const handleReset = () => {
    setCurrentPath([]);
    setRunStats({ distance: 0, duration: 0, pathLength: 0 });
  };

  if (!isAuthenticated) {
    return (
      <div>
        <Navigation />
        <div className="container">
          <div className="flex flex-center" style={{ minHeight: '80vh' }}>
            <div className="card">
              <div className="card-header text-center">Please Login</div>
              <p className="text-center">
                You need to be logged in to track runs and create territories.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navigation />
      
      <div className="container">
        <h1 className="text-large text-center mb-4">Run Tracker</h1>
        
        <div className="grid grid-2">
          {/* Map Section */}
          <div className="card">
            <div className="card-header">Live Tracking</div>
            <Map height="600px" userPath={currentPath} territories={territories} user={user} />
          </div>
          
          {/* Stats and Controls */}
          <div>
            <RunTracker 
              onPathUpdate={handlePathUpdate}
              onStatsUpdate={handleStatsUpdate}
            />
            
            {currentPath.length > 0 && (
              <div className="card">
                <div className="card-header">Territory Creation</div>
                <p className="text-small mb-4">
                  You have recorded {currentPath.length} GPS points covering {runStats.distance.toFixed(2)} km.
                </p>
                <div className="flex-between mb-4">
                  <button 
                    className="btn btn-primary" 
                    onClick={handleCreateTerritory}
                    disabled={currentPath.length < 3 || isCreatingTerritory}
                  >
                    {isCreatingTerritory ? 'Creating...' : 'Create Territory'}
                  </button>
                  <button 
                    className="btn btn-danger" 
                    onClick={handleReset}
                  >
                    Reset
                  </button>
                </div>
                <p className="text-small">
                  Minimum 3 GPS points required. Territory must be at least 0.01 km² and cannot overlap with existing territories.
                </p>
              </div>
            )}
            
            {territories.length > 0 && (
              <div className="card">
                <div className="card-header">Your Territories</div>
                {territories.map((territory, index) => (
                  <div key={territory.id} className="stat-item">
                    <div>
                      <strong>{territory.name}</strong>
                      <p className="text-small">{territory.area.toFixed(3)} km²</p>
                    </div>
                    <span className="text-small">{new Date(territory.capturedAt).toLocaleTimeString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Run;
