import mysql from 'mysql2/promise';

// Create a connection pool. This is more efficient than creating a new connection for every request.
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10, // Adjust as needed
  queueLimit: 0
});

// A helper function to execute queries using the pool.
export async function query(sql: string, params: any[]) {
  const [rows, fields] = await pool.execute(sql, params);
  return rows;
}

// Export the pool to be used for transactions.
export default pool;
    