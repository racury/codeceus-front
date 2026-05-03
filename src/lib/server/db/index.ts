import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import 'dotenv/config';

// Resilient env loading for both SvelteKit and CLI scripts
let databaseUrl = process.env.DATABASE_URL;

try {
	// @ts-ignore
	const { env } = await import('$env/dynamic/private');
	if (env.DATABASE_URL) databaseUrl = env.DATABASE_URL;
} catch (e) {
	// Not in SvelteKit environment
}

if (!databaseUrl) {
	throw new Error('DATABASE_URL is not set');
}

const client = postgres(databaseUrl);

export const db = drizzle(client, { schema });
