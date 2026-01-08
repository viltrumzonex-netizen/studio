import mysql from 'mysql2/promise';
import { config } from 'dotenv';
import type { Pool, PoolConnection } from 'mysql2/promise';

// Cargar variables de entorno del archivo .env
config();

let pool: Pool;

const getPool = () => {
    if (!pool) {
        pool = mysql.createPool({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });
    }
    return pool;
}


/**
 * Ejecuta una consulta SQL a la base de datos usando un pool de conexiones.
 * @param sql La consulta SQL a ejecutar.
 * @param params Los parámetros para la consulta SQL.
 * @returns El resultado de la consulta.
 */
export async function query(sql: string, params: any[]) {
    const dbPool = getPool();
    try {
        const [rows] = await dbPool.execute(sql, params);
        return rows;
    } catch (error) {
        console.error("Fallo en la consulta a la base de datos:", error);
        throw error;
    }
}

/**
 * Proporciona un pool de conexiones para transacciones.
 */
const transactionPool = {
    getConnection: async (): Promise<PoolConnection> => {
        const dbPool = getPool();
        const connection = await dbPool.getConnection();
        return connection;
    }
};

export default transactionPool;
