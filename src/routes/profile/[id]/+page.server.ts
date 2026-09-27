import { db } from '$lib/server/db';
import { user, problemSubmissions, solvedProblems } from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { eq, count, desc } from 'drizzle-orm';

export const load = async ({ params }) => {
	const userId = params.id;

	const profileUser = await db.query.user.findFirst({
		where: eq(user.id, userId)
	});

	if (!profileUser) {
		throw error(404, '유저를 찾을 수 없습니다.');
	}

	// 해결한 문제 수: solved_problems는 (user, problem)당 한 행이므로 그대로 센다
	const solvedCountResult = await db
		.select({ value: count() })
		.from(solvedProblems)
		.where(eq(solvedProblems.userId, userId));

	// 최근 제출 내역 (테스트케이스별 submissions가 아닌 문제 단위 제출)
	const recentSubmissions = await db.query.problemSubmissions.findMany({
		where: eq(problemSubmissions.userId, userId),
		orderBy: [desc(problemSubmissions.createdAt)],
		limit: 10,
		with: {
			problem: true
		}
	});

	return {
		profileUser,
		solvedCount: solvedCountResult[0]?.value ?? 0,
		recentSubmissions
	};
};
