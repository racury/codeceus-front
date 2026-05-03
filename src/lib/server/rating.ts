import { db } from './db';
import { user, solvedProblems, problems } from './db/schema';
import { eq, desc } from 'drizzle-orm';

/**
 * Recalculates the rating for a specific user based on all their solved problems.
 * Formula: Sum of (Difficulty * 0.9^index) where index is the rank of the problem
 * by difficulty (hardest first).
 */
export async function recalculateUserRating(userId: string) {
	const solved = await db.query.solvedProblems.findMany({
		where: eq(solvedProblems.userId, userId),
		with: {
			problem: true
		}
	});

	if (solved.length === 0) {
		await db.update(user).set({ rating: 0 }).where(eq(user.id, userId));
		return 0;
	}

	// Sort problems by difficulty descending
	const sortedProblems = solved
		.map((s) => s.problem)
		.filter((p) => p.difficultyRating !== null)
		.sort((a, b) => (b.difficultyRating ?? 0) - (a.difficultyRating ?? 0));

	let newRating = 0;
	const decay = 0.75;

	for (let i = 0; i < sortedProblems.length; i++) {
		const difficulty = sortedProblems[i].difficultyRating ?? 0;
		newRating += difficulty * Math.pow(decay, 3 + i);
	}

	const finalRating = Math.round(newRating);

	await db.update(user).set({ rating: finalRating }).where(eq(user.id, userId));

	return finalRating;
}

/**
 * Recalculates ratings for all users in the system.
 */
export async function recalculateAllRatings() {
	const allUsers = await db.query.user.findMany();
	console.log(`Recalculating ratings for ${allUsers.length} users...`);

	for (const u of allUsers) {
		const newRating = await recalculateUserRating(u.id);
		console.log(`User ${u.email}: ${u.rating} -> ${newRating}`);
	}

	console.log('All ratings recalculated.');
}
