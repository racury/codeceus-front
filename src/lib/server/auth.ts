import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { env } from '$env/dynamic/private';
import { building } from '$app/environment';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';

export const auth = betterAuth({
	baseURL: env.ORIGIN,
	// `vite build` loads this module without runtime secrets and Better Auth
	// rejects its default secret, so a throwaway value is used while building.
	// At runtime BETTER_AUTH_SECRET is required.
	secret: building ? 'sveltekit-build-placeholder-not-used-at-runtime' : env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'pg' }),
	emailAndPassword: { enabled: true },
	user: {
		additionalFields: {
			role: {
				type: 'string',
				required: false,
				defaultValue: 'user',
				input: false // Don't allow users to set their own role via sign-up
			}
		}
	},
	// GitHub login is only offered when both credentials are configured.
	socialProviders:
		env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET
			? {
					github: {
						clientId: env.GITHUB_CLIENT_ID,
						clientSecret: env.GITHUB_CLIENT_SECRET
					}
				}
			: {},
	plugins: [
		sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
	]
});
