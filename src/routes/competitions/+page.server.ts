import { db } from '$lib/server/db';
import { competitions } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const allCompetitions = await db.query.competitions.findMany({
		with: {
			createdBy: true,
			participants: true,
			problems: true
		},
		orderBy: [desc(competitions.startTime)]
	});

	return {
		competitions: allCompetitions
	};
};
