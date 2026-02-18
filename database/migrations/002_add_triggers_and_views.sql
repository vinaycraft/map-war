-- Migration 002: Add Triggers and Views
-- Created: 2024-02-19
-- Description: Add database triggers for automatic updates and performance views

BEGIN;

-- Create function to update user's last active timestamp
CREATE OR REPLACE FUNCTION update_user_last_active()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE users 
    SET last_active = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update user last active on team member join
CREATE TRIGGER IF NOT EXISTS trigger_update_user_last_active
    AFTER INSERT ON team_members
    FOR EACH ROW
    EXECUTE FUNCTION update_user_last_active();

-- Create function to update game statistics
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

-- Create trigger to update game stats on new runs
CREATE TRIGGER IF NOT EXISTS trigger_update_game_stats
    AFTER INSERT ON runs
    FOR EACH ROW
    EXECUTE FUNCTION update_game_stats();

-- Create user leaderboard view for performance
CREATE OR REPLACE VIEW user_leaderboard AS
SELECT 
    u.id,
    u.username,
    u.avatar,
    u.member_since,
    u.last_active,
    COALESCE(SUM(r.distance), 0) as total_distance,
    COALESCE(COUNT(r.id), 0) as total_runs,
    COALESCE(SUM(r.points), 0) as total_points,
    COALESCE(COUNT(DISTINCT t.id), 0) as total_territories,
    RANK() OVER (ORDER BY COALESCE(SUM(r.points), 0) DESC) as rank
FROM users u
LEFT JOIN runs r ON u.id = r.user_id
LEFT JOIN team_members tm ON u.id = tm.user_id
LEFT JOIN territories t ON u.id = t.owner_id
WHERE u.is_active = true
GROUP BY u.id, u.username, u.avatar, u.member_since, u.last_active
ORDER BY total_points DESC;

-- Create team leaderboard view
CREATE OR REPLACE VIEW team_leaderboard AS
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

-- Create territory history view
CREATE OR REPLACE VIEW territory_history AS
SELECT 
    tc.id,
    tc.territory_id,
    t.name as territory_name,
    u_from.username as from_owner,
    u_to.username as to_owner,
    tc.capture_type,
    tc.points_earned,
    tc.captured_at
FROM territory_captures tc
JOIN territories t ON tc.territory_id = t.id
JOIN users u_from ON tc.from_owner_id = u_from.id
JOIN users u_to ON tc.to_owner_id = u_to.id
ORDER BY tc.captured_at DESC;

COMMIT;
