// Run this script once to add userId column to price_comparisons table
require('dotenv').config();
const { DB_HOST, DB_NAME, DB_USERNAME, DB_PASSWORD } = process.env;
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(DB_NAME, DB_USERNAME, DB_PASSWORD, {
    host: DB_HOST,
    dialect: 'mysql',
    logging: console.log,
});

async function runMigration() {
    try {
        await sequelize.authenticate();
        console.log('Connected to database...');
        
        // Add userId column to price_comparisons table
        await sequelize.query(`
            ALTER TABLE price_comparisons ADD COLUMN userId BIGINT NULL;
        `);
        
        console.log('Migration successful! userId column added to price_comparisons table.');
    } catch (error) {
        if (error.message.includes('Duplicate column name')) {
            console.log('Column userId already exists. Migration not needed.');
        } else {
            console.error('Migration failed:', error.message);
        }
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

runMigration();
