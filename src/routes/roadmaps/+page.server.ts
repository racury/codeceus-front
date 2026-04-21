import { db } from '$lib/server/db';
import { roadmaps } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const allRoadmaps = await db.query.roadmaps.findMany({
		with: {
			createdBy: true,
			nodes: true
		},
		orderBy: [desc(roadmaps.id)]
	});

	return {
		roadmaps: allRoadmaps
	};
};
