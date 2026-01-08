import mysql from 'mysql2/promise';
import { config } from 'dotenv';
import type { Pool, PoolConnection } from 'mysql2/promise';

config();

// This global variable will hold the connection pool.
// It's declared here to be cached across function invocations in a serverless environment.
let pool: Pool | null = null;

const getPool = () => {
    // If the pool doesn't exist, create it.
    if (!pool) {
        console.log('Creating new database connection pool...');
        try {
            pool = mysql.createPool({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_DATABASE,
                waitForConnections: true,
                connectionLimit: 10,
                queueLimit: 0
            });
        } catch (error) {
            console.error("Failed to create database pool:", error);
            // If pool creation fails, we throw the error to be caught by the caller.
            throw error;
        }
    }
    return pool;
}

/**
 * Executes a SQL query using the connection pool.
 * @param sql The SQL query to execute.
 * @param params The parameters for the SQL query.
 * @returns The result of the query.
 */
export async function query(sql: string, params: any[]) {
    const dbPool = getPool(); // Get the cached pool
    try {
        const [rows] = await dbPool.execute(sql, params);
        return rows;
    } catch (error) {
        console.error("Database query failed:", error);
        throw error;
    }
}

/**
 * Provides a connection pool for transactions.
 */
const transactionPool = {
    getConnection: async (): Promise<PoolConnection> => {
        const dbPool = getPool();
        const connection = await dbPool.getConnection();
        return connection;
    }
};

export default transactionPool;
