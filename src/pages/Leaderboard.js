import React, { useState } from 'react';
import Navigation from '../components/Navigation';
import { useAuth } from '../contexts/AuthContext';
import { useLeaderboard } from '../contexts/LeaderboardContext';
import '../styles.css';

const Leaderboard = () => {
  const { user, isAuthenticated } = useAuth();
  const { 
    leaderboard, 
    teams, 
    globalStats, 
    activeTab, 
    setActiveTab,
    getLocalLeaderboard,
    getTeamLeaderboard,
    getUserRank,
    getTeamRank,
    isLoading 
  } = useLeaderboard();

  const [showUserHighlight, setShowUserHighlight] = useState(true);

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const getRankBadge = (rank) => {
    if (rank === 1) return '🏆';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  const getRankColor = (rank) => {
    if (rank <= 3) return '#f59e0b'; // Gold
    if (rank <= 10) return '#6b7280'; // Silver
    return '#9ca3af'; // Bronze
  };

  const userRank = user ? getUserRank(user.id) : 999;
  const userTeam = user && teams.find(t => t.name === 'Lightning Bolts'); // Mock user team for demo

  if (isLoading) {
    return (
      <div>
        <Navigation />
        <div className="container">
          <div className="flex flex-center" style={{ minHeight: '80vh' }}>
            <div className="loading">Loading leaderboard...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navigation />
      
      <div className="container">
        <h1 className="text-large text-center mb-4">Leaderboard</h1>
        
        {/* User Rank Card */}
        {isAuthenticated && (
          <div className="card mb-4">
            <div className="text-center">
              <h3>Your Current Rank</h3>
              <div style={{ fontSize: '3rem', fontWeight: 'bold', color: getRankColor(userRank) }}>
                {getRankBadge(userRank)}
              </div>
              <p className="text-medium">
                {userRank === 1 ? '🎉 You are #1!' : `Keep running to climb the ranks!`}
              </p>
              <p className="text-small">
                You're ahead of {Math.max(0, userRank - 1)} players
              </p>
            </div>
          </div>
        )}
        
        {/* Tabs */}
        <div className="flex-center mb-4">
          <div className="card" style={{ padding: '0.5rem', display: 'inline-block' }}>
            <button 
              className={`btn ${activeTab === 'global' ? 'btn-primary' : ''}`}
              onClick={() => setActiveTab('global')}
            >
              Global
            </button>
            <button 
              className={`btn ${activeTab === 'local' ? 'btn-primary' : ''}`}
              onClick={() => setActiveTab('local')}
            >
              Local
            </button>
            <button 
              className={`btn ${activeTab === 'teams' ? 'btn-primary' : ''}`}
              onClick={() => setActiveTab('teams')}
            >
              Teams
            </button>
          </div>
        </div>
        
        {/* Global Leaderboard */}
        {activeTab === 'global' && (
          <div className="card">
            <div className="card-header">Global Rankings</div>
            
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Rank</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Runner</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Distance</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Territories</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Runs</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Points</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Team</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Last Active</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((player, index) => {
                  const isUser = user && player.id === user.id;
                  return (
                    <tr 
                      key={player.id} 
                      style={{ 
                        borderBottom: '1px solid #f3f4f6',
                        backgroundColor: isUser && showUserHighlight ? '#eff6ff' : 'transparent'
                      }}
                    >
                      <td style={{ padding: '1rem' }}>
                        <div className="flex items-center">
                          <span style={{ fontSize: '1.25rem', fontWeight: 'bold', marginRight: '0.5rem', color: getRankColor(player.rank) }}>
                            {getRankBadge(player.rank)}
                          </span>
                          <div 
                            className="flex flex-center" 
                            style={{ 
                              width: '30px', 
                              height: '30px', 
                              borderRadius: '50%', 
                              backgroundColor: '#2563eb', 
                              color: 'white',
                              fontSize: '0.875rem',
                              fontWeight: 'bold'
                            }}
                          >
                            {player.avatar}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', fontWeight: isUser ? 'bold' : 'normal' }}>
                        {player.name}
                      </td>
                      <td style={{ padding: '1rem' }}>{player.distance.toFixed(1)} km</td>
                      <td style={{ padding: '1rem' }}>{player.territories}</td>
                      <td style={{ padding: '1rem' }}>{player.runs}</td>
                      <td style={{ padding: '1rem' }}>{player.points.toLocaleString()}</td>
                      <td style={{ padding: '1rem' }}>{player.team}</td>
                      <td style={{ padding: '1rem' }}>
                        <span className="text-small">{formatTimeAgo(player.lastActive)}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Local Leaderboard */}
        {activeTab === 'local' && (
          <div className="card">
            <div className="card-header">Local Rankings</div>
            
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Rank</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Runner</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Distance</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Territories</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Runs</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Points</th>
                </tr>
              </thead>
              <tbody>
                {getLocalLeaderboard(user).map((player, index) => {
                  const isUser = user && player.id === user.id;
                  return (
                    <tr 
                      key={player.id} 
                      style={{ 
                        borderBottom: '1px solid #f3f4f6',
                        backgroundColor: isUser && showUserHighlight ? '#eff6ff' : 'transparent'
                      }}
                    >
                      <td style={{ padding: '1rem' }}>
                        <div className="flex items-center">
                          <span style={{ fontSize: '1.25rem', fontWeight: 'bold', marginRight: '0.5rem', color: getRankColor(player.rank) }}>
                            {getRankBadge(player.rank)}
                          </span>
                          <div 
                            className="flex flex-center" 
                            style={{ 
                              width: '30px', 
                              height: '30px', 
                              borderRadius: '50%', 
                              backgroundColor: '#2563eb', 
                              color: 'white',
                              fontSize: '0.875rem',
                              fontWeight: 'bold'
                            }}
                          >
                            {player.avatar}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', fontWeight: isUser ? 'bold' : 'normal' }}>
                        {player.name}
                      </td>
                      <td style={{ padding: '1rem' }}>{player.distance.toFixed(1)} km</td>
                      <td style={{ padding: '1rem' }}>{player.territories}</td>
                      <td style={{ padding: '1rem' }}>{player.runs}</td>
                      <td style={{ padding: '1rem' }}>{player.points.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Teams Leaderboard */}
        {activeTab === 'teams' && (
          <div className="card">
            <div className="card-header">Team Rankings</div>
            
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Rank</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Team</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Members</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Total Distance</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Territories</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Avg Distance</th>
                  <th style={{ padding: '1rem', textAlign: 'left' }}>Points</th>
                </tr>
              </thead>
              <tbody>
                {teams.map((team, index) => {
                  const isUserTeam = userTeam && team.id === userTeam.id;
                  return (
                    <tr 
                      key={team.id} 
                      style={{ 
                        borderBottom: '1px solid #f3f4f6',
                        backgroundColor: isUserTeam && showUserHighlight ? '#eff6ff' : 'transparent'
                      }}
                    >
                      <td style={{ padding: '1rem' }}>
                        <div className="flex items-center">
                          <span style={{ fontSize: '1.25rem', fontWeight: 'bold', marginRight: '0.5rem', color: getRankColor(team.rank) }}>
                            {getRankBadge(team.rank)}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', fontWeight: isUserTeam ? 'bold' : 'normal' }}>
                        {team.name}
                      </td>
                      <td style={{ padding: '1rem' }}>{team.members}</td>
                      <td style={{ padding: '1rem' }}>{team.totalDistance.toFixed(1)} km</td>
                      <td style={{ padding: '1rem' }}>{team.totalTerritories}</td>
                      <td style={{ padding: '1rem' }}>{team.avgDistance.toFixed(1)} km</td>
                      <td style={{ padding: '1rem' }}>{team.points.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Global Stats */}
        <div className="grid grid-3 mt-4">
          <div className="card text-center">
            <h3 className="text-large">{globalStats.totalPlayers.toLocaleString()}</h3>
            <p className="text-small">Total Players</p>
          </div>
          
          <div className="card text-center">
            <h3 className="text-large" style={{ color: '#10b981' }}>
              {globalStats.totalDistance.toLocaleString()}
            </h3>
            <p className="text-small">Total Distance (km)</p>
          </div>
          
          <div className="card text-center">
            <h3 className="text-large" style={{ color: '#10b981' }}>
              {globalStats.totalTerritories.toLocaleString()}
            </h3>
            <p className="text-small">Territories Captured</p>
          </div>
        </div>
        
        {/* Toggle User Highlight */}
        {isAuthenticated && (
          <div className="text-center mt-4">
            <label className="flex items-center">
              <input 
                type="checkbox" 
                checked={showUserHighlight}
                onChange={(e) => setShowUserHighlight(e.target.checked)}
                className="mr-2"
              />
              <span className="text-small">Highlight my position in leaderboard</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
