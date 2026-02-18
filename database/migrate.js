#!/usr/bin/env node

/**
 * Database Migration Runner for Map War Game
 * 
 * This script runs database migrations in order and tracks which migrations
 * have been applied to prevent duplicate execution.
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration - modify these for your environment
const config = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'map_war_game',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Migration files in order
const migrations = [
  '001_create_initial_tables.sql',
  '002_add_triggers_and_views.sql', 
  '003_add_sample_data.sql'
];

class MigrationRunner {
  constructor() {
    this.pool = new Pool(config);
  }

  async initialize() {
    try {
      // Create migrations table if it doesn't exist
      await this.pool.query(`
        CREATE TABLE IF NOT EXISTS migrations (
          id SERIAL PRIMARY KEY,
          filename VARCHAR(255) UNIQUE NOT NULL,
          executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ Migration table initialized');
    } catch (error) {
      console.error('❌ Failed to initialize migration table:', error);
      throw error;
    }
  }

  async getExecutedMigrations() {
    try {
      const result = await this.pool.query('SELECT filename FROM migrations ORDER BY filename');
      return result.rows.map(row => row.filename);
    } catch (error) {
      console.error('❌ Failed to get executed migrations:', error);
      throw error;
    }
  }

  async executeMigration(filename) {
    const migrationPath = path.join(__dirname, 'migrations', filename);
    
    try {
      // Read migration file
      const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
      
      console.log(`🔄 Executing migration: ${filename}`);
      
      // Start transaction
      const client = await this.pool.connect();
      
      try {
        await client.query('BEGIN');
        
        // Execute migration
        await client.query(migrationSQL);
        
        // Record migration
        await client.query('INSERT INTO migrations (filename) VALUES ($1)', [filename]);
        
        await client.query('COMMIT');
        console.log(`✅ Migration completed: ${filename}`);
        
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
      
    } catch (error) {
      console.error(`❌ Migration failed: ${filename}`, error);
      throw error;
    }
  }

  async run() {
    console.log('🚀 Starting database migrations...');
    
    try {
      await this.initialize();
      
      const executedMigrations = await this.getExecutedMigrations();
      console.log(`📋 Already executed: ${executedMigrations.length} migrations`);
      
      const pendingMigrations = migrations.filter(m => !executedMigrations.includes(m));
      
      if (pendingMigrations.length === 0) {
        console.log('✅ All migrations are up to date');
        return;
      }
      
      console.log(`📝 Pending migrations: ${pendingMigrations.length}`);
      
      for (const migration of pendingMigrations) {
        await this.executeMigration(migration);
      }
      
      console.log('🎉 All migrations completed successfully!');
      
    } catch (error) {
      console.error('💥 Migration process failed:', error);
      process.exit(1);
    }
  }

  async rollback(targetMigration) {
    console.log('🔄 Rolling back migrations...');
    console.log('⚠️  Rollback functionality not implemented yet');
    console.log('💡 Manual rollback required for:', targetMigration);
  }

  async status() {
    try {
      await this.initialize();
      const executedMigrations = await this.getExecutedMigrations();
      
      console.log('\n📊 Migration Status:');
      console.log('==================');
      
      migrations.forEach(migration => {
        const status = executedMigrations.includes(migration) ? '✅' : '⏳';
        console.log(`${status} ${migration}`);
      });
      
      console.log(`\n📈 Progress: ${executedMigrations.length}/${migrations.length} migrations applied`);
      
    } catch (error) {
      console.error('❌ Failed to get migration status:', error);
    }
  }

  async close() {
    await this.pool.end();
    console.log('🔌 Database connection closed');
  }
}

// CLI Interface
async function main() {
  const runner = new MigrationRunner();
  
  const command = process.argv[2];
  const target = process.argv[3];
  
  try {
    switch (command) {
      case 'up':
      case 'migrate':
        await runner.run();
        break;
        
      case 'down':
      case 'rollback':
        if (!target) {
          console.error('❌ Please specify target migration for rollback');
          process.exit(1);
        }
        await runner.rollback(target);
        break;
        
      case 'status':
        await runner.status();
        break;
        
      default:
        console.log(`
🗄️  Map War Game Migration Runner

Usage:
  node migrate.js <command> [options]

Commands:
  up, migrate     Run all pending migrations
  down, rollback <migration>  Rollback to specific migration
  status         Show migration status

Examples:
  node migrate.js up
  node migrate.js status
  node migrate.js rollback 001_create_initial_tables.sql
        `);
        break;
    }
  } finally {
    await runner.close();
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = MigrationRunner;
