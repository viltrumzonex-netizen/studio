import mysql from 'mysql2/promise';
import { config } from 'dotenv';

// Cargar variables de entorno del archivo .env
config();

/**
 * Ejecuta una consulta SQL a la base de datos.
 * Esta función establece una nueva conexión, ejecuta la consulta y cierra la conexión.
 * Es un enfoque más robusto para entornos sin servidor como Vercel o Next.js API Routes.
 * @param sql La consulta SQL a ejecutar.
 * @param params Los parámetros para la consulta SQL.
 * @returns El resultado de la consulta.
 */
export async function query(sql: string, params: any[]) {
    let connection;
    try {
        // Establecer una nueva conexión en cada llamada
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        });
        const [rows] = await connection.execute(sql, params);
        return rows;
    } catch (error) {
        console.error("Fallo en la consulta a la base de datos:", error);
        // Lanzar el error para que la ruta de la API que llama pueda manejarlo
        throw error;
    } finally {
        // Asegurarse de que la conexión se cierre siempre
        if (connection) {
            await connection.end();
        }
    }
}

/**
 * Proporciona una conexión para transacciones.
 * A diferencia de `query`, esto es para operaciones que necesitan ser agrupadas
 * en una transacción (por ejemplo, transferir dinero).
 */
export default {
    getConnection: async () => {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
        });
        return connection;
    }
};
