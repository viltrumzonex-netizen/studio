import mysql from 'mysql2/promise';
import { config } from 'dotenv';
import type { Pool, PoolConnection } from 'mysql2/promise';

config();

let pool: Pool | null = null;

function getPool() {
    if (!pool) {
        console.log('Creating new database connection pool...');
        try {
            pool = mysql.createPool({
                host: process.env.DB_HOST || 'srv1066.hstgr.io', // Using Hostinger's specific hostname
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_DATABASE,
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0
            });
        } catch (error) {
            console.error("Failed to create database pool:", error);
            throw error;
        }
    }
    return pool;
}

export async function query(sql: string, params: any[]) {
    const dbPool = getPool();
    try {
        const [rows] = await dbPool.execute(sql, params);
        return rows;
    } catch (error) {
        console.error("Database query failed:", error);
        throw error;
    }
}

const transactionPool = {
    getConnection: async (): Promise<PoolConnection> => {
        const dbPool = getPool();
        const connection = await dbPool.getConnection();
        return connection;
    }
};

export default transactionPool;
