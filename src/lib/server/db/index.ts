import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Resilient env loading for both SvelteKit and CLI scripts (tsx). CLI scripts
// load .env themselves (`import 'dotenv/config'` as their first import); it
// must not be imported here, because adapter-node would bundle dotenv's
// CommonJS entry into the ESM server build, which then crashes at startup.
let databaseUrl = process.env.DATABASE_URL;
let building = false;

try {
	const { env } = await import('$env/dynamic/private');
	if (env.DATABASE_URL) databaseUrl = env.DATABASE_URL;
	({ building } = await import('$app/environment'));
} catch {
	// Not in SvelteKit environment
}

// `vite build` imports server modules to analyse them, so only require the URL
// when the app or a script actually runs. postgres.js connects lazily, so no
// connection is attempted while building.
if (!databaseUrl && !building) {
	throw new Error('DATABASE_URL is not set');
}

const client = databaseUrl ? postgres(databaseUrl) : postgres();

export const db = drizzle(client, { schema });
