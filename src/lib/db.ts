import mysql, { type Pool } from 'mysql2/promise';
import { config } from 'dotenv';

// Cargar variables de entorno desde .env
config();

let pool: Pool;

// Función para obtener el pool de conexiones.
// Lo crea si no existe (Lazy Initialization).
function getPool() {
    if (!pool) {
        try {
            pool = mysql.createPool({
                host: process.env.DB_HOST,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                database: process.env.DB_DATABASE,
                waitForConnections: true,
                connectionLimit: 10, // Adjust as needed
                queueLimit: 0
            });
            console.log("MySQL Pool created successfully.");
        } catch (error) {
            console.error("Failed to create database pool:", error);
            // Si la creación del pool falla, es un error crítico.
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
        // Re-lanza el error para que la ruta de la API que lo llamó pueda manejarlo.
        throw error;
    }
}

// Export the pool instance directly for transaction management.
// Se usa una función para asegurar que el pool esté inicializado.
export default {
    getConnection: () => getPool().getConnection()
};
