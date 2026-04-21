import type { Session } from 'better-auth/minimal';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user?: {
				id: string;
				name: string;
				email: string;
				emailVerified: boolean;
				image?: string | null;
				role: string;
				createdAt: Date;
				updatedAt: Date;
			};
			session?: Session;
		}

		// interface Error {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
