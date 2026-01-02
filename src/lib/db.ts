import mysql, { type Pool } from 'mysql2/promise';

// A helper function to execute queries using the pool.
export async function query(sql: string, params: any[]) {
    if (!pool) {
        throw new Error("Database pool is not initialized.");
    }
    const [rows, fields] = await pool.execute(sql, params);
    return rows;
}

let pool: Pool;

try {
    // Create a connection pool. This is more efficient than creating a new connection for every request.
    pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        waitForConnections: true,
        connectionLimit: 10, // Adjust as needed
        queueLimit: 0
    });

} catch (error) {
    console.error("Failed to create database pool:", error);
    // Exit the process if the database connection fails. This is critical for server startup.
    process.exit(1);
}


// Export the pool to be used for transactions.
export default pool;
