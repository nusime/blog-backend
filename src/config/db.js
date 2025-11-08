import 'dotenv/config';
import pkg from 'pg';
const { Pool } = pkg;

if(!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not defined in environment variables");
    process.exit(1);
}

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: false } 
        : false
});

pool.on('error', (err) => {
    console.error('Database connection error:', err);
    process.exit(1);
});

pool.on('connect', () => {
    console.log('Database is connected successfully');
});

export async function query(text,params) {
    return pool.query(text, params);
}

export async function getClient() {
    return await pool.connect();
}

export default pool;