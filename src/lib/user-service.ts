import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import type { User } from '@/hooks/use-auth';
import { config } from 'dotenv';

config(); // Ensure environment variables are loaded

// Separate, direct connection config for critical user functions
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
};

async function getDbConnection() {
    try {
        const connection = await mysql.createConnection(dbConfig);
        return connection;
    } catch (error) {
        console.error("Database connection failed in user-service:", error);
        throw new Error("Could not connect to the database.");
    }
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
