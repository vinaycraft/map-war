-- Migration 003: Add Sample Data
-- Created: 2024-02-19
-- Description: Insert sample users, teams, and achievements for testing

BEGIN;

-- Insert sample users
INSERT INTO users (id, username, email, password_hash, avatar, member_since, last_active, is_active) VALUES
    (uuid_generate_v4(), 'SpeedRunner', 'speedrunner@example.com', '$2b$12$hash', 'S', CURRENT_TIMESTAMP - INTERVAL '30 days', CURRENT_TIMESTAMP, true),
    (uuid_generate_v4(), 'MarathonMan', 'marathon@example.com', '$2b$12$hash', 'M', CURRENT_TIMESTAMP - INTERVAL '45 days', CURRENT_TIMESTAMP, true),
    (uuid_generate_v4(), 'TrailBlazer', 'trail@example.com', '$2b$12$hash', 'T', CURRENT_TIMESTAMP - INTERVAL '15 days', CURRENT_TIMESTAMP, true),
    (uuid_generate_v4(), 'UrbanExplorer', 'urban@example.com', '$2b$12$hash', 'U', CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP, true),
    (uuid_generate_v4(), 'NightOwl', 'night@example.com', '$2b$12$hash', 'N', CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP, true),
    (uuid_generate_v4(), 'WeekendWarrior', 'weekend@example.com', '$2b$12$hash', 'W', CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP, true),
    (uuid_generate_v4(), 'MorningJogger', 'morning@example.com', '$2b$12$hash', 'M', CURRENT_TIMESTAMP - INTERVAL '12 hours', CURRENT_TIMESTAMP, true),
    (uuid_generate_v4(), 'CitySlicker', 'city@example.com', '$2b$12$hash', 'C', CURRENT_TIMESTAMP - INTERVAL '4 hours', CURRENT_TIMESTAMP, true),
    (uuid_generate_v4(), 'TrailMaster', 'trail@example.com', '$2b$12$hash', 'T', CURRENT_TIMESTAMP - INTERVAL '8 hours', CURRENT_TIMESTAMP, true),
    (uuid_generate_v4(), 'FitnessFanatic', 'fitness@example.com', '$2b$12$hash', 'F', CURRENT_TIMESTAMP - INTERVAL '1 hour', CURRENT_TIMESTAMP, true)
ON CONFLICT (email) DO NOTHING;

-- Insert sample teams
INSERT INTO teams (id, name, description, avatar, created_by) VALUES
    (uuid_generate_v4(), 'Lightning Bolts', 'Fastest team in the east', 'L', (SELECT id FROM users WHERE username = 'SpeedRunner')),
    (uuid_generate_v4(), 'Trail Blazers', 'Mountain specialists', 'T', (SELECT id FROM users WHERE username = 'TrailBlazer')),
    (uuid_generate_v4(), 'Mountain Goats', 'High altitude experts', 'M', (SELECT id FROM users WHERE username = 'MarathonMan')),
    (uuid_generate_v4(), 'City Runners', 'Urban territory controllers', 'C', (SELECT id FROM users WHERE username = 'UrbanExplorer')),
    (uuid_generate_v4(), 'Midnight Crew', 'Night time specialists', 'N', (SELECT id FROM users WHERE username = 'NightOwl')),
    (uuid_generate_v4(), 'Weekend Warriors', 'Weekend champions', 'W', (SELECT id FROM users WHERE username = 'WeekendWarrior'))
ON CONFLICT (name) DO NOTHING;

-- Add users to teams
INSERT INTO team_members (team_id, user_id, role, joined_at) VALUES
    ((SELECT id FROM teams WHERE name = 'Lightning Bolts'), (SELECT id FROM users WHERE username = 'SpeedRunner'), 'leader', CURRENT_TIMESTAMP - INTERVAL '30 days'),
    ((SELECT id FROM teams WHERE name = 'Lightning Bolts'), (SELECT id FROM users WHERE username = 'MarathonMan'), 'member', CURRENT_TIMESTAMP - INTERVAL '25 days'),
    ((SELECT id FROM teams WHERE name = 'Lightning Bolts'), (SELECT id FROM users WHERE username = 'TrailBlazer'), 'member', CURRENT_TIMESTAMP - INTERVAL '15 days'),
    ((SELECT id FROM teams WHERE name = 'Trail Blazers'), (SELECT id FROM users WHERE username = 'TrailBlazer'), 'leader', CURRENT_TIMESTAMP - INTERVAL '15 days'),
    ((SELECT id FROM teams WHERE name = 'Trail Blazers'), (SELECT id FROM users WHERE username = 'UrbanExplorer'), 'member', CURRENT_TIMESTAMP - INTERVAL '7 days'),
    ((SELECT id FROM teams WHERE name = 'Mountain Goats'), (SELECT id FROM users WHERE username = 'MarathonMan'), 'leader', CURRENT_TIMESTAMP - INTERVAL '45 days'),
    ((SELECT id FROM teams WHERE name = 'Mountain Goats'), (SELECT id FROM users WHERE username = 'WeekendWarrior'), 'member', CURRENT_TIMESTAMP - INTERVAL '2 days'),
    ((SELECT id FROM teams WHERE name = 'City Runners'), (SELECT id FROM users WHERE username = 'UrbanExplorer'), 'leader', CURRENT_TIMESTAMP - INTERVAL '7 days'),
    ((SELECT id FROM teams WHERE name = 'City Runners'), (SELECT id FROM users WHERE username = 'CitySlicker'), 'member', CURRENT_TIMESTAMP - INTERVAL '4 days'),
    ((SELECT id FROM teams WHERE name = 'Midnight Crew'), (SELECT id FROM users WHERE username = 'NightOwl'), 'leader', CURRENT_TIMESTAMP - INTERVAL '3 days'),
    ((SELECT id FROM teams WHERE name = 'Midnight Crew'), (SELECT id FROM users WHERE username = 'WeekendWarrior'), 'member', CURRENT_TIMESTAMP - INTERVAL '2 days'),
    ((SELECT id FROM teams WHERE name = 'Weekend Warriors'), (SELECT id FROM users WHERE username = 'MorningJogger'), 'member', CURRENT_TIMESTAMP - INTERVAL '12 hours'))
ON CONFLICT (team_id, user_id) DO NOTHING;

-- Insert sample achievements
INSERT INTO achievements (id, name, description, icon, points, condition) VALUES
    (uuid_generate_v4(), 'First Territory', 'Capture your first territory', '🏃', 100, '{"type": "territories", "value": 1, "operator": ">="}'),
    (uuid_generate_v4(), 'Territory Master', 'Capture 10 territories', '🏆', 500, '{"type": "territories", "value": 10, "operator": ">="}'),
    (uuid_generate_v4(), 'Distance Runner', 'Run 50 km total', '🏅', 300, '{"type": "distance", "value": 50, "operator": ">="}'),
    (uuid_generate_v4(), 'Team Player', 'Join a team', '👥', 200, '{"type": "team", "value": 1, "operator": ">="}'),
    (uuid_generate_v4(), 'Speed Demon', 'Complete a run in under 5 min/km pace', '⚡', 250, '{"type": "pace", "value": 300, "operator": "<="}'),
    (uuid_generate_v4(), 'Night Owl', 'Run after 10 PM', '🦉', 150, '{"type": "time", "field": "hour", "value": 22, "operator": ">="}'),
    (uuid_generate_v4(), 'Early Bird', 'Run before 6 AM', '🌅', 100, '{"type": "time", "field": "hour", "value": 6, "operator": "<="}'),
    (uuid_generate_v4(), 'Weekend Warrior', 'Run on weekends', '⚔️', 180, '{"type": "runs", "value": 10, "operator": ">="}'),
    (uuid_generate_v4(), 'Territory Defender', 'Defend territories for 24 hours', '🛡️', 400, '{"type": "territory_defense", "value": 86400, "operator": ">="}'),
    (uuid_generate_v4(), 'Marathon Master', 'Run 42+ km in single session', '🏃', 600, '{"type": "distance", "value": 42, "operator": ">="}')
ON CONFLICT (name) DO NOTHING;

-- Insert sample runs
INSERT INTO runs (id, user_id, distance, duration, points, pace_seconds, start_time, end_time) VALUES
    (uuid_generate_v4(), (SELECT id FROM users WHERE username = 'SpeedRunner'), 125.4, 7200, 15420, 345, CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
    (uuid_generate_v4(), (SELECT id FROM users WHERE username = 'MarathonMan'), 118.7, 6600, 14870, 336, CURRENT_TIMESTAMP - INTERVAL '5 hours', CURRENT_TIMESTAMP - INTERVAL '1 hour 50 minutes'),
    (uuid_generate_v4(), (SELECT id FROM users WHERE username = 'TrailBlazer'), 105.2, 6300, 13520, 359, CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '1 hour 45 minutes'),
    (uuid_generate_v4(), (SELECT id FROM users WHERE username = 'UrbanExplorer'), 98.3, 5400, 12830, 329, CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '2 hours'),
    (uuid_generate_v4(), (SELECT id FROM users WHERE username = 'NightOwl'), 87.6, 4800, 10940, 274, CURRENT_TIMESTAMP - INTERVAL '6 hours', CURRENT_TIMESTAMP - INTERVAL '4 hours'),
    (uuid_generate_v4(), (SELECT id FROM users WHERE username = 'WeekendWarrior'), 76.9, 4500, 10130, 293, CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '1 hour 15 minutes'),
    (uuid_generate_v4(), (SELECT id FROM users WHERE username = 'MorningJogger'), 81.4, 4200, 10840, 258, CURRENT_TIMESTAMP - INTERVAL '12 hours', CURRENT_TIMESTAMP - INTERVAL '1 hour'),
    (uuid_generate_v4(), (SELECT id FROM users WHERE username = 'CitySlicker'), 72.3, 3600, 9660, 298, CURRENT_TIMESTAMP - INTERVAL '4 hours', CURRENT_TIMESTAMP - INTERVAL '1 hour'));

-- Insert sample GPS points for first run
INSERT INTO gps_points (run_id, latitude, longitude, accuracy, altitude, speed, recorded_at) VALUES
    ((SELECT id FROM runs WHERE user_id = (SELECT id FROM users WHERE username = 'SpeedRunner') ORDER BY created_at DESC LIMIT 1), 40.7128, -74.0060, 5.0, 10.0, 0, 15.2, CURRENT_TIMESTAMP - INTERVAL '2 hours' - INTERVAL '1 hour 55 minutes'),
    ((SELECT id FROM runs WHERE user_id = (SELECT id FROM users WHERE username = 'SpeedRunner') ORDER BY created_at DESC LIMIT 1), 40.7130, -74.0055, 4.8, 12.0, 0, 15.5, CURRENT_TIMESTAMP - INTERVAL '2 hours' - INTERVAL '1 hour 50 minutes'),
    ((SELECT id FROM runs WHERE user_id = (SELECT id FROM users WHERE username = 'SpeedRunner') ORDER BY created_at DESC LIMIT 1), 40.7135, -74.0050, 4.2, 15.0, 0, 15.8, CURRENT_TIMESTAMP - INTERVAL '2 hours' - INTERVAL '1 hour 45 minutes'),
    ((SELECT id FROM runs WHERE user_id = (SELECT id FROM users WHERE username = 'SpeedRunner') ORDER BY created_at DESC LIMIT 1), 40.7140, -74.0070, 3.9, 18.0, 0, 16.2, CURRENT_TIMESTAMP - INTERVAL '2 hours' - INTERVAL '1 hour 40 minutes'),
    ((SELECT id FROM runs WHERE user_id = (SELECT id FROM users WHERE username = 'SpeedRunner') ORDER BY created_at DESC LIMIT 1), 40.7145, -74.0070, 4.1, 22.0, 0, 16.5, CURRENT_TIMESTAMP - INTERVAL '2 hours' - INTERVAL '1 hour 35 minutes'),
    ((SELECT id FROM runs WHERE user_id = (SELECT id FROM users WHERE username = 'SpeedRunner') ORDER BY created_at DESC LIMIT 1), 40.7150, -74.0050, 4.3, 25.0, 0, 16.8, CURRENT_TIMESTAMP - INTERVAL '2 hours' - INTERVAL '1 hour 30 minutes'),
    ((SELECT id FROM runs WHERE user_id = (SELECT id FROM users WHERE username = 'SpeedRunner') ORDER BY created_at DESC LIMIT 1), 40.7155, -74.0055, 4.5, 28.0, 0, 17.2, CURRENT_TIMESTAMP - INTERVAL '2 hours' - INTERVAL '1 hour 25 minutes'),
    ((SELECT id FROM runs WHERE user_id = (SELECT id FROM users WHERE username = 'SpeedRunner') ORDER BY created_at DESC LIMIT 1), 40.7160, -74.0055, 4.7, 30.0, 0, 17.5, CURRENT_TIMESTAMP - INTERVAL '2 hours' - INTERVAL '1 hour 20 minutes'),
    ((SELECT id FROM runs WHERE user_id = (SELECT id FROM users WHERE username = 'SpeedRunner') ORDER BY created_at DESC LIMIT 1), 40.7165, -74.0055, 4.9, 32.0, 0, 17.8, CURRENT_TIMESTAMP - INTERVAL '2 hours' - INTERVAL '1 hour 15 minutes'),
    ((SELECT id FROM runs WHERE user_id = (SELECT id FROM users WHERE username = 'SpeedRunner') ORDER BY created_at DESC LIMIT 1), 40.7170, -74.0055, 5.1, 35.0, 0, 18.2, CURRENT_TIMESTAMP - INTERVAL '2 hours' - INTERVAL '1 hour 10 minutes'),
    ((SELECT id FROM runs WHERE user_id = (SELECT id FROM users WHERE username = 'SpeedRunner') ORDER BY created_at DESC LIMIT 1), 40.7175, -74.0055, 5.3, 38.0, 0, 18.5, CURRENT_TIMESTAMP - INTERVAL '2 hours' - INTERVAL '1 hour 5 minutes'),
    ((SELECT id FROM runs WHERE user_id = (SELECT id FROM users WHERE username = 'SpeedRunner') ORDER BY created_at DESC LIMIT 1), 40.7180, -74.0055, 5.5, 40.0, 0, 18.8, CURRENT_TIMESTAMP - INTERVAL '2 hours' - INTERVAL '1 hour'));

-- Insert sample territories
INSERT INTO territories (id, name, owner_id, team_id, area, center_lat, center_lng, coordinates, points, captured_at, expires_at, is_active) VALUES
    (uuid_generate_v4(), 'Central Plaza', (SELECT id FROM users WHERE username = 'SpeedRunner'), NULL, 0.15, 40.7128, -74.0060, '[40.7128, -74.0060, 40.7130, -74.0055, 40.7125, -74.0050, 40.7123, -74.0055, 40.7128, -74.0060]', 150, CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '30 days', true),
    (uuid_generate_v4(), 'Riverside Run', (SELECT id FROM users WHERE username = 'SpeedRunner'), NULL, 0.12, 40.7140, -74.0080, '[40.7140, -74.0080, 40.7145, -74.0070, 40.7142, -74.0070, 40.7140, -74.0080]', 120, CURRENT_TIMESTAMP - INTERVAL '2 days', CURRENT_TIMESTAMP + INTERVAL '30 days', true),
    (uuid_generate_v4(), 'Park Path', (SELECT id FROM users WHERE username = 'MarathonMan'), NULL, 0.08, 40.7110, -74.0040, '[40.7110, -74.0040, 40.7115, -74.0035, 40.7112, -74.0030, 40.7110, -74.0040]', 80, CURRENT_TIMESTAMP - INTERVAL '5 days', CURRENT_TIMESTAMP + INTERVAL '30 days', true),
    (uuid_generate_v4(), 'Hilltop Haven', (SELECT id FROM users WHERE username = 'TrailBlazer'), (SELECT id FROM teams WHERE name = 'Trail Blazers'), 0.18, 40.7110, -74.0040, '[40.7110, -74.0040, 40.7115, -74.0035, 40.7112, -74.0030, 40.7110, -74.0040]', 180, CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '30 days', true);

-- Insert sample game stats
INSERT INTO game_stats (stat_key, stat_value) VALUES
    ('total_players', 10),
    ('total_distance', 855.8),
    ('total_runs', 10),
    ('total_territories', 5),
    ('active_territories', 5)
ON CONFLICT (stat_key) DO UPDATE SET 
    stat_value = EXCLUDED.stat_value + CASE 
        WHEN EXCLUDED.stat_key = 'total_players' THEN 10
        WHEN EXCLUDED.stat_key = 'total_distance' THEN 855.8
        WHEN EXCLUDED.stat_key = 'total_runs' THEN 10
        WHEN EXCLUDED.stat_key = 'total_territories' THEN 5
        WHEN EXCLUDED.stat_key = 'active_territories' THEN 5
        ELSE EXCLUDED.stat_value
    END,
    last_updated = CURRENT_TIMESTAMP;

COMMIT;
