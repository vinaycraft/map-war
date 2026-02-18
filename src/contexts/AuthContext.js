import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [territories, setTerritories] = useState([]);
  const [stats, setStats] = useState({
    totalDistance: 0,
    totalRuns: 0,
    totalTerritories: 0,
    rank: 999
  });

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('mapWarUser');
    const savedTerritories = localStorage.getItem('mapWarTerritories');
    const savedStats = localStorage.getItem('mapWarStats');
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    if (savedTerritories) {
      setTerritories(JSON.parse(savedTerritories));
    }
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
    
    setIsLoading(false);
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('mapWarUser', JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('mapWarTerritories', JSON.stringify(territories));
  }, [territories]);

  useEffect(() => {
    localStorage.setItem('mapWarStats', JSON.stringify(stats));
  }, [stats]);

  const login = async (email, password) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user database
      const users = [
        {
          id: 'user1',
          email: 'test@example.com',
          password: 'password',
          name: 'Test Runner',
          avatar: 'T'
        },
        {
          id: 'user2',
          email: 'runner@example.com',
          password: 'password',
          name: 'Speed Runner',
          avatar: 'S'
        }
      ];
      
      const foundUser = users.find(u => u.email === email && u.password === password);
      
      if (!foundUser) {
        throw new Error('Invalid email or password');
      }
      
      const userData = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        avatar: foundUser.avatar,
        memberSince: new Date().toISOString()
      };
      
      setUser(userData);
      return userData;
      
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Validate input
      if (!userData.username || !userData.email || !userData.password) {
        throw new Error('All fields are required');
      }
      
      if (userData.password !== userData.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      // Create new user
      const newUser = {
        id: `user${Date.now()}`,
        email: userData.email,
        name: userData.username,
        avatar: userData.username[0].toUpperCase(),
        memberSince: new Date().toISOString()
      };
      
      setUser(newUser);
      return newUser;
      
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setTerritories([]);
    setStats({
      totalDistance: 0,
      totalRuns: 0,
      totalTerritories: 0,
      rank: 999
    });
    
    // Clear localStorage
    localStorage.removeItem('mapWarUser');
    localStorage.removeItem('mapWarTerritories');
    localStorage.removeItem('mapWarStats');
  };

  const updateStats = (newStats) => {
    setStats(prev => ({ ...prev, ...newStats }));
  };

  const addTerritory = (territory) => {
    setTerritories(prev => [...prev, territory]);
    updateStats({
      totalTerritories: stats.totalTerritories + 1,
      totalDistance: stats.totalDistance + (territory.area || 0)
    });
  };

  const addRun = (runData) => {
    updateStats({
      totalRuns: stats.totalRuns + 1,
      totalDistance: stats.totalDistance + runData.distance
    });
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    territories,
    stats,
    login,
    register,
    logout,
    addTerritory,
    addRun,
    updateStats
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
