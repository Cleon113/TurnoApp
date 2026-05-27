import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user:     process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

export const connectDatabase = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    console.log('✅ Database connected successfully');
    client.release(); // Return the connection to the pool
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1); // Stop the process — no point running without a DB
  }
};