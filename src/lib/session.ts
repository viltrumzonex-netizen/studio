import { NextRequest } from 'next/server';
import { User } from '@/hooks/use-auth';
import { cookies } from 'next/headers';

/**
 * Gets the server session from the request cookies using Next.js's built-in cookie store.
 * This is the single source of truth for user authentication on the backend.
 * @param req - The Next.js request object (though no longer directly used, kept for type context).
 * @returns A promise that resolves to the user object or null if not authenticated.
 */
export async function getServerSession(req: NextRequest): Promise<User | null> {
    const cookieStore = cookies();
    const sessionCookie = cookieStore.get('viltrum_session');

    if (!sessionCookie?.value) {
        return null;
    }

    try {
        // The cookie value is already decoded by the cookie store.
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
