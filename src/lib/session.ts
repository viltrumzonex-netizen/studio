import { NextRequest } from 'next/server';
import { User } from '@/hooks/use-auth';

/**
 * Gets the server session from the request cookies.
 * This is the single source of truth for user authentication on the backend.
 * @param req - The Next.js request object.
 * @returns A promise that resolves to the user object or null if not authenticated.
 */
export async function getServerSession(req: NextRequest): Promise<User | null> {
    const sessionCookie = req.cookies.get('viltrum_session');

    if (!sessionCookie?.value) {
        return null;
    }

    try {
        const user: User = JSON.parse(sessionCookie.value);
        // In a real-world scenario, you might want to re-validate this user against the DB
        // to ensure they still exist and their permissions are current. For this app, we'll trust the cookie.
        return user;
    } catch (e) {
        // If the cookie is malformed or invalid JSON
        console.error("Failed to parse session cookie:", e);
        return null;
    }
}
