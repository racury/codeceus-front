import { db } from '$lib/server/db';
import { problems } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const id = parseInt(params.id);
	
	if (isNaN(id)) {
		throw error(400, 'Invalid problem ID');
	}

	const problem = await db.query.problems.findFirst({
		where: eq(problems.id, id),
		with: {
			testcases: {
				where: (testcases, { eq }) => eq(testcases.isPublic, true),
				orderBy: (testcases, { asc }) => [asc(testcases.id)]
			}
		}
	});

	if (!problem) {
		throw error(404, 'Problem not found');
	}

	return {
		problem,
		user: locals.user
	};
};
