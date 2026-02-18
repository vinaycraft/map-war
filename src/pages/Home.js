import React from 'react';
import Navigation from '../components/Navigation';
import Map from '../components/Map';
import { useAuth } from '../contexts/AuthContext';
import { useLeaderboard } from '../contexts/LeaderboardContext';
import '../styles.css';

const Home = () => {
  const { user, isAuthenticated, stats } = useAuth();
  const { leaderboard } = useLeaderboard();

  // Get top players from global leaderboard for local display
  const topPlayers = leaderboard.slice(0, 3);

  // Mock territories for demonstration (will be replaced with real data)
  const mockTerritories = [
    {
      id: 1,
      name: 'Central Plaza',
      owner: user?.id || 'user',
      coordinates: [
        [40.7128, -74.0060],
        [40.7130, -74.0055],
        [40.7125, -74.0050],
        [40.7123, -74.0055],
        [40.7128, -74.0060]
      ],
      area: 0.15,
      capturedAt: '2024-02-15T10:30:00Z'
    },
    {
      id: 2,
      name: 'Riverside Run',
      owner: 'SpeedRunner',
      coordinates: [
        [40.7140, -74.0080],
        [40.7145, -74.0075],
        [40.7142, -74.0070],
        [40.7138, -74.0075],
        [40.7140, -74.0080]
      ],
      area: 0.12,
      capturedAt: '2024-02-14T15:20:00Z'
    },
    {
      id: 3,
      name: 'Hilltop Haven',
      owner: 'MarathonMan',
      coordinates: [
        [40.7110, -74.0040],
        [40.7115, -74.0035],
        [40.7112, -74.0030],
        [40.7108, -74.0035],
        [40.7110, -74.0040]
      ],
      area: 0.18,
      capturedAt: '2024-02-13T09:15:00Z'
    }
  ];

  return (
    <div>
      <Navigation />
      
      <div className="container">
        <h1 className="text-large text-center mb-4">Map War Game</h1>
        <p className="text-center mb-4">
          {isAuthenticated 
            ? `Welcome back, ${user.name}! Run, Capture Territory, Conquer!`
            : 'Run, Capture Territory, Conquer!'
          }
        </p>
        
        <div className="grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
          {/* Map Section */}
          <div className="card">
            <div className="card-header">Your Territory</div>
            <Map height="500px" territories={mockTerritories} user={user} />
          </div>
          
          {/* Stats Section */}
          <div>
            <div className="card">
              <div className="card-header">Your Stats</div>
              <div className="stat-item">
                <span className="stat-label">Total Distance:</span>
                <span className="stat-value">{stats.totalDistance.toFixed(1)} km</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Territories:</span>
                <span className="stat-value">{stats.totalTerritories}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Rank:</span>
                <span className="stat-value">#{stats.rank}</span>
              </div>
            </div>
            
            <div className="card">
              <div className="card-header">Quick Start</div>
              {isAuthenticated ? (
                <a href="/run" className="btn btn-success btn-full">
                  Start New Run
                </a>
              ) : (
                <a href="/login" className="btn btn-primary btn-full">
                  Login to Start
                </a>
              )}
            </div>
            
            <div className="card">
              <div className="card-header">Top Players</div>
              {topPlayers.length > 0 ? (
                topPlayers.map((player, index) => (
                  <div key={player.id} className="stat-item">
                    <span>
                      {index + 1}. {player.name}
                    </span>
                    <span className="text-small">{player.distance.toFixed(1)} km</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-small">Loading leaderboard...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
