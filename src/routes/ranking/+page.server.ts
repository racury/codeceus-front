import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';

export const load = async () => {
	const topUsers = await db.query.user.findMany({
		orderBy: [desc(user.rating)],
		limit: 50
	});

	return {
		topUsers
	};
};
