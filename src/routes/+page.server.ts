import { db } from '$lib/server/db';
import { problems } from '$lib/server/db/schema';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const featuredProblems = await db.select().from(problems).limit(3);
	
	return {
		featuredProblems
	};
};
