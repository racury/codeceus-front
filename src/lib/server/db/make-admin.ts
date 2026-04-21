import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import { eq } from 'drizzle-orm';
import 'dotenv/config';

async function makeAdmin() {
    const email = process.argv[2];
    if (!email) {
        console.error('Please provide an email address.');
        process.exit(1);
    }

    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
        console.error('DATABASE_URL is not set in .env');
        process.exit(1);
    }

    const client = postgres(databaseUrl);
    const db = drizzle(client, { schema });

    console.log(`Setting role 'admin' for user with email: ${email}`);
    
    try {
        const result = await db.update(schema.user)
            .set({ role: 'admin' })
            .where(eq(schema.user.email, email))
            .returning();

        if (result.length > 0) {
            console.log('Success! User is now an admin.');
        } else {
            console.log('User not found.');
        }
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await client.end();
        process.exit(0);
    }
}

makeAdmin();
