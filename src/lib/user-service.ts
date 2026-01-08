import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import type { User } from '@/hooks/use-auth';
import { config } from 'dotenv';

config(); // Ensure environment variables are loaded

// Separate, direct connection config for critical user functions.
// Forcing 127.0.0.1 is more robust than 'localhost' in some environments.
const dbConfig = {
    host: process.env.DB_HOST || "127.0.0.1",
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
};

async function getDbConnection() {
    // This function now returns a promise of a connection.
    return await mysql.createConnection(dbConfig);
}


export async function findUserByEmail(email: string): Promise<(any & { password?: string }) | null> {
    const connection = await getDbConnection();
    try {
        const [rows]: any = await connection.execute(
            'SELECT id, email, displayName, role, password FROM users WHERE email = ?',
            [email]
        );
        if (rows.length > 0) {
            return rows[0];
        }
        return null;
    } finally {
        await connection.end();
    }
}

interface CreateUserDTO {
    email: string;
    password: string;
    displayName: string;
}

export async function createUser({ email, password, displayName }: CreateUserDTO): Promise<User> {
    const connection = await getDbConnection();
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const [result]: any = await connection.execute(
            "INSERT INTO users (email, password, displayName, role) VALUES (?, ?, ?, 'user')",
            [email, hashedPassword, displayName]
        );
        
        if (!result.insertId) {
            throw new Error('Failed to create user in database.');
        }

        const newUserId = result.insertId;

        // Initialize VTC balance for the new user
        await connection.execute(
            'UPDATE users SET vtc_balance = 0 WHERE id = ?',
            [newUserId]
        );

        return {
            uid: newUserId.toString(),
            email,
            displayName,
            role: 'user',
        };

    } finally {
        await connection.end();
    }
}
