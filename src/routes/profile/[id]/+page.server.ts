import { db } from '$lib/server/db';
import { user, submissions, problems } from '$lib/server/db/schema';
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

	// 해결한 문제 수 조회 (상태가 'AC' 또는 'Accepted'인 유일한 문제 수)
	const solvedCountResult = await db
		.select({ value: count() })
		.from(submissions)
		.where(eq(submissions.userId, userId))
		.where(eq(submissions.status, 'Accepted')); // 실제 상태값에 따라 조정 필요

	// 최근 제출 내역
	const recentSubmissions = await db.query.submissions.findMany({
		where: eq(submissions.userId, userId),
		orderBy: [desc(submissions.createdAt)],
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
