import { db } from '$lib/server/db';
import { problems, categories } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const problemsResult = await db.query.problems.findMany({
		with: {
			categories: {
				with: {
					category: true
				}
			}
		}
	});

	const categoriesResult = await db.query.categories.findMany();

	return {
		problems: problemsResult,
		categories: categoriesResult,
		user: locals.user
	};
};
