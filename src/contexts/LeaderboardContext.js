import React, { createContext, useContext, useState, useEffect } from 'react';

const LeaderboardContext = createContext();

export const useLeaderboard = () => {
  const context = useContext(LeaderboardContext);
  if (!context) {
    throw new Error('useLeaderboard must be used within a LeaderboardProvider');
  }
  return context;
};

export const LeaderboardProvider = ({ children }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [teams, setTeams] = useState([]);
  const [globalStats, setGlobalStats] = useState({
    totalPlayers: 0,
    totalDistance: 0,
    totalTerritories: 0
  });
  const [activeTab, setActiveTab] = useState('global');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for demonstration
  useEffect(() => {
    const mockLeaderboard = [
      {
        id: 'user1',
        name: 'SpeedRunner',
        avatar: 'S',
        distance: 125.4,
        territories: 12,
        runs: 45,
        rank: 1,
        points: 15420,
        team: 'Lightning Bolts',
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
      },
      {
        id: 'user2',
        name: 'MarathonMan',
        avatar: 'M',
        distance: 118.7,
        territories: 10,
        runs: 38,
        rank: 2,
        points: 14870,
        team: 'Trail Blazers',
        lastActive: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString() // 5 hours ago
      },
      {
        id: 'user3',
        name: 'TrailBlazer',
        avatar: 'T',
        distance: 105.2,
        territories: 8,
        runs: 42,
        rank: 3,
        points: 13520,
        team: 'Mountain Goats',
        lastActive: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
      },
      {
        id: 'user4',
        name: 'UrbanExplorer',
        avatar: 'U',
        distance: 98.3,
        territories: 9,
        runs: 35,
        rank: 4,
        points: 12830,
        team: 'City Runners',
        lastActive: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
      },
      {
        id: 'user5',
        name: 'NightOwl',
        avatar: 'N',
        distance: 92.1,
        territories: 7,
        runs: 31,
        rank: 5,
        points: 11910,
        team: 'Midnight Crew',
        lastActive: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString() // 6 hours ago
      },
      {
        id: 'user6',
        name: 'WeekendWarrior',
        avatar: 'W',
        distance: 87.6,
        territories: 6,
        runs: 28,
        rank: 6,
        points: 11260,
        team: 'Weekend Warriors',
        lastActive: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
      },
      {
        id: 'user7',
        name: 'MorningJogger',
        avatar: 'M',
        distance: 81.4,
        territories: 8,
        runs: 33,
        rank: 7,
        points: 10840,
        team: 'Early Birds',
        lastActive: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() // 12 hours ago
      },
      {
        id: 'user8',
        name: 'CitySlicker',
        avatar: 'C',
        distance: 76.9,
        territories: 5,
        runs: 26,
        rank: 8,
        points: 10190,
        team: 'Urban Explorers',
        lastActive: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString() // 4 hours ago
      },
      {
        id: 'user9',
        name: 'TrailMaster',
        avatar: 'T',
        distance: 72.3,
        territories: 7,
        runs: 29,
        rank: 9,
        points: 9830,
        team: 'Pathfinders',
        lastActive: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString() // 8 hours ago
      },
      {
        id: 'user10',
        name: 'FitnessFanatic',
        avatar: 'F',
        distance: 68.7,
        territories: 6,
        runs: 32,
        rank: 10,
        points: 9470,
        team: 'Gym Rats',
        lastActive: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() // 1 hour ago
      }
    ];

    const mockTeams = [
      {
        id: 'team1',
        name: 'Lightning Bolts',
        members: 12,
        totalDistance: 456.8,
        totalTerritories: 28,
        avgDistance: 38.1,
        rank: 1,
        points: 45680
      },
      {
        id: 'team2',
        name: 'Trail Blazers',
        members: 10,
        totalDistance: 412.3,
        totalTerritories: 25,
        avgDistance: 41.2,
        rank: 2,
        points: 41230
      },
      {
        id: 'team3',
        name: 'Mountain Goats',
        members: 8,
        totalDistance: 389.7,
        totalTerritories: 22,
        avgDistance: 48.7,
        rank: 3,
        points: 38970
      },
      {
        id: 'team4',
        name: 'City Runners',
        members: 15,
        totalDistance: 367.2,
        totalTerritories: 30,
        avgDistance: 24.5,
        rank: 4,
        points: 36720
      },
      {
        id: 'team5',
        name: 'Midnight Crew',
        members: 6,
        totalDistance: 298.4,
        totalTerritories: 18,
        avgDistance: 49.7,
        rank: 5,
        points: 29840
      }
    ];

    const mockGlobalStats = {
      totalPlayers: 1247,
      totalDistance: 12458.3,
      totalTerritories: 3842
    };

    // Simulate API delay
    setTimeout(() => {
      setLeaderboard(mockLeaderboard);
      setTeams(mockTeams);
      setGlobalStats(mockGlobalStats);
      setIsLoading(false);
    }, 1000);
  }, []);

  const updateUserStats = (userId, newStats) => {
    setLeaderboard(prev => {
      return prev.map(user => {
        if (user.id === userId) {
          // Recalculate points
          const points = Math.floor(newStats.distance * 100) + (newStats.territories * 500) + (newStats.runs * 100);
          
          return {
            ...user,
            ...newStats,
            points,
            lastActive: new Date().toISOString()
          };
        }
        return user;
      }).sort((a, b) => b.points - a.points).map((user, index) => ({
        ...user,
        rank: index + 1
      }));
    });
  };

  const getLocalLeaderboard = (userLocation) => {
    // Mock local leaderboard based on user location
    return leaderboard
      .filter(user => Math.random() > 0.7) // Randomly filter for "local" users
      .slice(0, 10)
      .map((user, index) => ({
        ...user,
        rank: index + 1
      }));
  };

  const getTeamLeaderboard = () => {
    return teams.sort((a, b) => b.points - a.points);
  };

  const getUserRank = (userId) => {
    const user = leaderboard.find(u => u.id === userId);
    return user ? user.rank : 999;
  };

  const getTeamRank = (teamId) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.rank : 999;
  };

  const value = {
    leaderboard,
    teams,
    globalStats,
    activeTab,
    isLoading,
    setActiveTab,
    updateUserStats,
    getLocalLeaderboard,
    getTeamLeaderboard,
    getUserRank,
    getTeamRank
  };

  return (
    <LeaderboardContext.Provider value={value}>
      {children}
    </LeaderboardContext.Provider>
  );
};
