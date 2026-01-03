import mysql, { type Pool } from 'mysql2/promise';
import { config } from 'dotenv';

let pool: Pool;

// Cargar variables de entorno desde .env
config();

// Función para obtener el pool de conexiones.
// Lo crea si no existe (Lazy Initialization).
function getPool() {
    if (!pool) {
        // Cargar variables de entorno aquí para asegurar que estén disponibles.
        config();
        
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
            console.log("MySQL Pool created successfully.");
        } catch (error) {
            console.error("Failed to create database pool:", error);
            throw new Error("Could not create database pool.");
        }
    }
    return pool;
}

// A helper function to execute queries.
export async function query(sql: string, params: any[]) {
    try {
        const pool = getPool();
        const [rows, fields] = await pool.execute(sql, params);
        return rows;
    } catch (error) {
        console.error("Database query failed:", error);
        throw error;
    }
}

// Export the pool instance directly for transaction management.
export default {
    getConnection: () => getPool().getConnection()
};
