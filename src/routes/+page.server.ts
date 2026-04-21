import { db } from '$lib/server/db';
import { problems, submissions, competitions, competitionParticipants, problemsToCategories, categories } from '$lib/server/db/schema';
import { eq, and, notInArray, sql, gt, desc, asc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.user?.id;

	// 1. Get solved problem IDs if user is logged in
	let solvedProblemIds: number[] = [];
	if (userId) {
		const solved = await db
			.select({ problemId: submissions.problemId })
			.from(submissions)
			.where(and(eq(submissions.userId, userId), eq(submissions.status, 'accepted')));
		solvedProblemIds = solved.map((s) => s.problemId);
	}

	// 2. Fetch random problems (unsolved if logged in)
	const featuredProblemsQuery = db
		.select({
			id: problems.id,
			title: problems.title,
			difficultyRating: problems.difficultyRating
		})
		.from(problems);

	if (solvedProblemIds.length > 0) {
		featuredProblemsQuery.where(notInArray(problems.id, solvedProblemIds));
	}

	const rawFeaturedProblems = await featuredProblemsQuery.orderBy(sql`RANDOM()`).limit(5);

	// Fetch categories for these problems
	const featuredProblems = await Promise.all(
		rawFeaturedProblems.map(async (p) => {
			const cats = await db
				.select({ name: categories.name })
				.from(problemsToCategories)
				.innerJoin(categories, eq(problemsToCategories.categoryId, categories.id))
				.where(eq(problemsToCategories.problemId, p.id))
				.limit(1);

			// Map difficulty rating to label
			let difficulty = '보통';
			if (p.difficultyRating && p.difficultyRating < 1000) difficulty = '쉬움';
			if (p.difficultyRating && p.difficultyRating > 2000) difficulty = '어려움';

			return {
				...p,
				category: cats[0]?.name ?? '일반',
				difficulty
			};
		})
	);

	// 3. Fetch upcoming contests
	const upcomingContestsRaw = await db
		.select({
			id: competitions.id,
			title: competitions.title,
			startTime: competitions.startTime,
			participantsCount: sql<number>`count(${competitionParticipants.userId})::int`
		})
		.from(competitions)
		.leftJoin(competitionParticipants, eq(competitions.id, competitionParticipants.competitionId))
		.where(gt(competitions.startTime, new Date()))
		.groupBy(competitions.id)
		.orderBy(asc(competitions.startTime))
		.limit(3);

	return {
		featuredProblems,
		upcomingContests: upcomingContestsRaw.map(c => ({
			id: c.id,
			title: c.title,
			date: c.startTime,
			participants: c.participantsCount
		}))
	};
};
