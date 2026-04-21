import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) throw error(400, 'Invalid ID');

	const problemset = await db.query.problemsets.findFirst({
		where: eq(schema.problemsets.id, id),
		with: {
			createdBy: true,
			problems: {
				with: {
					problem: true
				},
				orderBy: (p, { asc }) => [asc(p.order)]
			}
		}
	});

	if (!problemset) throw error(404, 'Problemset not found');

	return {
		problemset
	};
};
