import { db } from '$lib/server/db';
import { problemsets } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const allProblemsets = await db.query.problemsets.findMany({
		with: {
			createdBy: true,
			problems: true
		},
		orderBy: [desc(problemsets.id)]
	});

	return {
		problemsets: allProblemsets
	};
};
