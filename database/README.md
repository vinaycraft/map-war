# Map War Game Database

This directory contains the complete database schema and migrations for the Map War Game application.

## 📁 Database Structure

### **Core Tables:**
- **users** - User accounts and authentication
- **teams** - Team information for multiplayer
- **team_members** - Many-to-many relationship between users and teams
- **runs** - Individual running sessions with GPS tracking
- **gps_points** - GPS location points for each run
- **territories** - Game territories captured from runs
- **territory_captures** - History of territory ownership changes
- **achievements** - Achievement definitions and unlock conditions
- **user_achievements** - User achievement progress tracking
- **game_stats** - Global game statistics and counters

## 🚀 Migrations

### **Migration Files:**
1. **001_create_initial_tables.sql** - Creates all core tables
2. **002_add_triggers_and_views.sql** - Adds triggers and performance views
3. **003_add_sample_data.sql** - Inserts sample data for testing

### **Schema.sql** - Complete database schema with all tables, indexes, triggers, and views

## 🗄️ Key Features

### **Performance Optimized:**
- **Indexes** on all frequently queried columns
- **Views** for complex leaderboard queries
- **Triggers** for automatic stat updates
- **JSONB** for flexible coordinate storage

### **Data Relationships:**
- **UUID Primary Keys** for distributed systems
- **Foreign Key Constraints** with proper CASCADE handling
- **Many-to-Many** relationships for teams and users
- **Territory Ownership** - Individual or team-based

### **Game Mechanics:**
- **Territory System** - Capture from GPS paths
- **Team Competition** - Team vs team gameplay
- **Achievement System** - Condition-based unlocks
- **Real-time Stats** - Automatic updates via triggers

## 📊 Sample Data

The migrations include comprehensive sample data:
- **10 Users** with different skill levels
- **5 Teams** with member assignments
- **Sample Runs** with GPS tracking data
- **Sample Territories** with various sizes and locations
- **Achievements** - Multiple unlock conditions
- **Game Statistics** - Pre-populated counters

## 🔧 Setup Instructions

### **1. Create Database:**
```sql
CREATE DATABASE map_war_game;
```

### **2. Run Migrations:**
```bash
psql -d map_war_game -f migrations/001_create_initial_tables.sql
psql -d map_war_game -f migrations/002_add_triggers_and_views.sql  
psql -d map_war_game -f migrations/003_add_sample_data.sql
```

### **3. Verify Setup:**
```sql
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM territories;
SELECT * FROM user_leaderboard LIMIT 10;
```

## 🏗️ Architecture Benefits

### **Scalability:**
- **Distributed UUIDs** allow for multi-server setups
- **Efficient Queries** with proper indexing
- **Automatic Stats** via triggers reduce application overhead
- **Flexible Data** with JSONB for coordinates and conditions

### **Data Integrity:**
- **Foreign Key Constraints** ensure referential integrity
- **ON DELETE CASCADE** maintains data consistency
- **UNIQUE Constraints** prevent duplicate data
- **CHECK Constraints** validate data at database level

### **Performance:**
- **Materialized Views** for complex leaderboards
- **Partial Indexes** for common query patterns
- **Connection Pooling** ready for high-traffic scenarios

This database schema supports all current Map War Game features and is designed for scalability and performance.
