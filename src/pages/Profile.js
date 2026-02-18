import React, { useState } from 'react';
import Navigation from '../components/Navigation';
import { useAuth } from '../contexts/AuthContext';
import '../styles.css';

const Profile = () => {
  const { user, stats, territories, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      setEditForm({
        name: user?.name || '',
        email: user?.email || ''
      });
    }
  };

  const handleSaveProfile = () => {
    // TODO: Implement profile update API call
    alert('Profile updated successfully!');
    setIsEditing(false);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!user) {
    return (
      <div>
        <Navigation />
        <div className="container">
          <div className="flex flex-center" style={{ minHeight: '80vh' }}>
            <div className="card">
              <div className="card-header text-center">Please Login</div>
              <p className="text-center">
                You need to be logged in to view your profile.
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
        <h1 className="text-large text-center mb-4">Profile</h1>
        
        <div className="grid grid-3">
          {/* User Info */}
          <div className="card">
            <div className="text-center mb-4">
              <div 
                className="flex flex-center" 
                style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '50%', 
                  backgroundColor: '#2563eb', 
                  color: 'white',
                  fontSize: '2rem',
                  fontWeight: 'bold',
                  margin: '0 auto 1rem'
                }}
              >
                {user.avatar}
              </div>
              
              {isEditing ? (
                <div>
                  <input 
                    type="text" 
                    className="form-input mb-2"
                    value={editForm.name}
                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  />
                  <input 
                    type="email" 
                    className="form-input"
                    value={editForm.email}
                    onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  />
                </div>
              ) : (
                <div>
                  <h2>{user.name}</h2>
                  <p className="text-small">{user.email}</p>
                </div>
              )}
            </div>
            
            <div className="stat-item">
              <span className="stat-label">Member Since:</span>
              <span className="stat-value">{formatDate(user.memberSince)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Global Rank:</span>
              <span className="stat-value">#{stats.rank}</span>
            </div>
            
            <div className="mt-4">
              {isEditing ? (
                <div>
                  <button className="btn btn-success btn-full mb-2" onClick={handleSaveProfile}>
                    Save Profile
                  </button>
                  <button className="btn btn-primary btn-full" onClick={handleEditToggle}>
                    Cancel
                  </button>
                </div>
              ) : (
                <button className="btn btn-primary btn-full mb-2" onClick={handleEditToggle}>
                  Edit Profile
                </button>
              )}
              <button className="btn btn-primary btn-full">
                Settings
              </button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="card" style={{ gridColumn: 'span 2' }}>
            <div className="card-header">Your Statistics</div>
            
            <div className="grid grid-3 mb-4">
              <div className="text-center">
                <h3 className="text-large" style={{ color: '#10b981' }}>
                  {stats.totalDistance.toFixed(1)}
                </h3>
                <p className="text-small">Total Distance (km)</p>
              </div>
              
              <div className="text-center">
                <h3 className="text-large" style={{ color: '#10b981' }}>
                  {stats.totalRuns}
                </h3>
                <p className="text-small">Total Runs</p>
              </div>
              
              <div className="text-center">
                <h3 className="text-large" style={{ color: '#10b981' }}>
                  {stats.totalTerritories}
                </h3>
                <p className="text-small">Territories</p>
              </div>
            </div>
            
            <div className="card-header">Achievements</div>
            {stats.totalTerritories === 0 ? (
              <div className="text-center py-4">
                <p className="text-small">No achievements yet. Start running to unlock some!</p>
              </div>
            ) : (
              <div className="grid grid-3">
                {stats.totalTerritories >= 1 && (
                  <div className="text-center">
                    <div style={{ fontSize: '2rem' }}>🏃</div>
                    <p className="text-small">First Territory</p>
                  </div>
                )}
                {stats.totalTerritories >= 5 && (
                  <div className="text-center">
                    <div style={{ fontSize: '2rem' }}>🏆</div>
                    <p className="text-small">Territory Master</p>
                  </div>
                )}
                {stats.totalDistance >= 50 && (
                  <div className="text-center">
                    <div style={{ fontSize: '2rem' }}>🏅</div>
                    <p className="text-small">Distance Runner</p>
                  </div>
                )}
              </div>
            )}
            
            <div className="card-header">Your Territories</div>
            {territories.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-small">No territories yet. Start running to capture some!</p>
              </div>
            ) : (
              <div>
                {territories.map((territory, index) => (
                  <div key={territory.id} className="stat-item">
                    <div>
                      <h4>{territory.name}</h4>
                      <p className="text-small">{territory.area ? territory.area.toFixed(3) : '0.000'} km²</p>
                    </div>
                    <span className="text-small">{formatDate(territory.capturedAt)}</span>
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

export default Profile;
