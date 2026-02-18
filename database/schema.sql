-- Map War Game Database Schema
-- PostgreSQL Database Schema

-- Enable UUID extension for UUID support
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    avatar CHAR(1) DEFAULT 'U',
    member_since TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TEAMS TABLE
-- =============================================
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    avatar VARCHAR(10) DEFAULT 'T',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- TEAM_MEMBERS TABLE
-- =============================================
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member', -- member, leader, co_leader
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(team_id, user_id)
);

-- =============================================
-- RUNS TABLE
-- =============================================
CREATE TABLE runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    distance DECIMAL(10,3) NOT NULL, -- in kilometers
    duration INTEGER NOT NULL, -- in seconds
    points INTEGER NOT NULL,
    pace_seconds INTEGER, -- seconds per kilometer
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- GPS_POINTS TABLE
-- =============================================
CREATE TABLE gps_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    run_id UUID NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    accuracy DECIMAL(8,2), -- GPS accuracy in meters
    altitude DECIMAL(8,2),
    speed DECIMAL(8,2), -- speed in km/h
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_gps_points_run_id (run_id),
    INDEX idx_gps_points_recorded_at (recorded_at)
);

-- =============================================
-- TERRITORIES TABLE
-- =============================================
CREATE TABLE territories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    team_id UUID REFERENCES teams(id) ON DELETE SET NULL, -- territory can be team-owned or individual
    area DECIMAL(12,6) NOT NULL, -- in square kilometers
    center_lat DECIMAL(10,8) NOT NULL,
    center_lng DECIMAL(11,8) NOT NULL,
    coordinates JSONB NOT NULL, -- array of [lat, lng] points
    points INTEGER NOT NULL,
    captured_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE, -- territory expiration for competitive play
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_territories_owner (owner_id),
    INDEX idx_territories_team (team_id),
    INDEX idx_territories_center (center_lat, center_lng),
    INDEX idx_territories_expires (expires_at)
);

-- =============================================
-- TERRITORY_CAPTURES TABLE
-- =============================================
CREATE TABLE territory_captures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    territory_id UUID NOT NULL REFERENCES territories(id) ON DELETE CASCADE,
    from_owner_id UUID REFERENCES users(id) ON DELETE SET NULL, -- who owned it before
    to_owner_id UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL, -- who owns it now
    capture_type VARCHAR(20) NOT NULL, -- conquest, defense, expiration
    points_earned INTEGER NOT NULL,
    captured_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_territory_captures_territory (territory_id),
    INDEX idx_territory_captures_from_owner (from_owner_id),
    INDEX idx_territory_captures_to_owner (to_owner_id)
);

-- =============================================
-- ACHIEVEMENTS TABLE
-- =============================================
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    points INTEGER NOT NULL,
    condition JSONB NOT NULL, -- {type: 'distance', value: 50, operator: '>='}
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- USER_ACHIEVEMENTS TABLE
-- =============================================
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_id)
);

-- =============================================
-- GAME_STATS TABLE
-- =============================================
CREATE TABLE game_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stat_key VARCHAR(50) UNIQUE NOT NULL,
    stat_value BIGINT NOT NULL,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_active ON users(is_active);
CREATE INDEX idx_users_member_since ON users(member_since);

CREATE INDEX idx_runs_user ON runs(user_id);
CREATE INDEX idx_runs_distance ON runs(distance DESC);
CREATE INDEX idx_runs_created ON runs(created_at DESC);

CREATE INDEX idx_team_members_user ON team_members(user_id);
CREATE INDEX idx_team_members_team ON team_members(team_id);

-- =============================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================

-- Update user's last active timestamp when they log in
CREATE OR REPLACE FUNCTION update_user_last_active()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users 
    SET last_active = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_last_active
    AFTER INSERT ON team_members
    FOR EACH ROW
    EXECUTE FUNCTION update_user_last_active();

-- Update game stats when new runs are added
CREATE OR REPLACE FUNCTION update_game_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Update total distance
    INSERT INTO game_stats (stat_key, stat_value)
    VALUES ('total_distance', COALESCE((SELECT SUM(distance) FROM runs), 0))
    ON CONFLICT (stat_key) DO UPDATE SET 
        stat_value = EXCLUDED.stat_value + NEW.distance,
        last_updated = CURRENT_TIMESTAMP;
    
    -- Update total runs
    INSERT INTO game_stats (stat_key, stat_value)
    VALUES ('total_runs', COALESCE((SELECT COUNT(*) FROM runs), 0))
    ON CONFLICT (stat_key) DO UPDATE SET 
        stat_value = EXCLUDED.stat_value + 1,
        last_updated = CURRENT_TIMESTAMP;
    
    -- Update total territories
    INSERT INTO game_stats (stat_key, stat_value)
    VALUES ('total_territories', COALESCE((SELECT COUNT(*) FROM territories WHERE is_active = true), 0))
    ON CONFLICT (stat_key) DO UPDATE SET 
        stat_value = EXCLUDED.stat_value + 1,
        last_updated = CURRENT_TIMESTAMP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_game_stats
    AFTER INSERT ON runs
    FOR EACH ROW
    EXECUTE FUNCTION update_game_stats();

-- =============================================
-- VIEWS FOR COMMON QUERIES
-- =============================================

-- User leaderboard view
CREATE VIEW user_leaderboard AS
SELECT 
    u.id,
    u.username,
    u.avatar,
    COALESCE(SUM(r.distance), 0) as total_distance,
    COALESCE(COUNT(r.id), 0) as total_runs,
    COALESCE(SUM(r.points), 0) as total_points,
    COALESCE(COUNT(t.id), 0) as total_territories,
    COALESCE(r.last_active, u.member_since) as last_active,
    RANK() OVER (ORDER BY COALESCE(SUM(r.points), 0) DESC) as rank
FROM users u
LEFT JOIN runs r ON u.id = r.user_id
LEFT JOIN team_members tm ON u.id = tm.user_id
LEFT JOIN territories t ON u.id = t.owner_id OR tm.team_id = t.team_id
WHERE u.is_active = true
GROUP BY u.id, u.username, u.avatar, u.member_since, u.last_active
ORDER BY total_points DESC;

-- Team leaderboard view
CREATE VIEW team_leaderboard AS
SELECT 
    t.id,
    t.name,
    t.avatar,
    COUNT(DISTINCT tm.user_id) as member_count,
    COALESCE(SUM(t.area), 0) as total_territories,
    COALESCE(SUM(r.distance), 0) as total_distance,
    COALESCE(AVG(r.distance), 0) as avg_distance,
    COALESCE(SUM(r.points), 0) as total_points,
    RANK() OVER (ORDER BY COALESCE(SUM(r.points), 0) DESC) as rank
FROM teams t
LEFT JOIN team_members tm ON t.id = tm.team_id
LEFT JOIN users u ON tm.user_id = u.id
LEFT JOIN runs r ON u.id = r.user_id
LEFT JOIN territories tr ON t.id = tr.team_id
GROUP BY t.id, t.name, t.avatar
ORDER BY total_points DESC;

-- =============================================
-- SAMPLE DATA INSERTS
-- =============================================

-- Insert sample achievements
INSERT INTO achievements (id, name, description, icon, points, condition) VALUES
    (uuid_generate_v4(), 'First Territory', 'Capture your first territory', '🏃', 100, '{"type": "territories", "value": 1, "operator": ">="}'),
    (uuid_generate_v4(), 'Territory Master', 'Capture 10 territories', '🏆', 500, '{"type": "territories", "value": 10, "operator": ">="}'),
    (uuid_generate_v4(), 'Distance Runner', 'Run 50 km total', '🏅', 300, '{"type": "distance", "value": 50, "operator": ">="}'),
    (uuid_generate_v4(), 'Team Player', 'Join a team', '👥', 200, '{"type": "team", "value": 1, "operator": ">="}');

-- Insert sample game stats
INSERT INTO game_stats (stat_key, stat_value) VALUES
    ('total_players', 0),
    ('total_distance', 0),
    ('total_runs', 0),
    ('total_territories', 0);

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON TABLE users IS 'User accounts and authentication data';
COMMENT ON TABLE teams IS 'Team information for multiplayer competition';
COMMENT ON TABLE team_members IS 'Many-to-many relationship between users and teams';
COMMENT ON TABLE runs IS 'Individual running sessions with GPS tracking';
COMMENT ON TABLE gps_points IS 'GPS location points for each run';
COMMENT ON TABLE territories IS 'Game territories captured from runs';
COMMENT ON TABLE territory_captures IS 'History of territory ownership changes';
COMMENT ON TABLE achievements IS 'Achievement definitions and unlock conditions';
COMMENT ON TABLE user_achievements IS 'User achievement progress tracking';
COMMENT ON TABLE game_stats IS 'Global game statistics and counters';
