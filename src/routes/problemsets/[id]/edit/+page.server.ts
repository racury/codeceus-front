import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { error, fail, redirect } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) {
		throw redirect(302, '/signin');
	}

	const id = parseInt(params.id);
	if (isNaN(id)) throw error(400, 'Invalid ID');

	const problemset = await db.query.problemsets.findFirst({
		where: eq(schema.problemsets.id, id),
		with: {
			problems: {
				with: {
					problem: true
				},
				orderBy: (p, { asc }) => [asc(p.order)]
			}
		}
	});

	if (!problemset) throw error(404, 'Problemset not found');

	// Authorization check
	const isOwner = locals.user.id === problemset.createdById;
	const isAdmin = locals.user.role === 'admin';

	if (!isAdmin && !isOwner) {
		throw error(403, 'Forbidden');
	}

	// Fetch all problems to allow adding them to the problemset
	const allProblems = await db.query.problems.findMany({
		orderBy: (problems, { asc }) => [asc(problems.id)]
	});

	return {
		problemset,
		allProblems
	};
};

export const actions: Actions = {
	updateBasicInfo: async ({ request, params, locals }) => {
		if (!locals.user) throw error(401, 'Unauthorized');

		const id = parseInt(params.id);
		const existingProblemset = await db.query.problemsets.findFirst({
			where: eq(schema.problemsets.id, id)
		});

		if (!existingProblemset) throw error(404, 'Problemset not found');

		const isOwner = locals.user.id === existingProblemset.createdById;
		const isAdmin = locals.user.role === 'admin';
		if (!isAdmin && !isOwner) throw error(403, 'Forbidden');

		const formData = await request.formData();
		const title = formData.get('title') as string;
		const description = formData.get('description') as string;

		if (!title) return fail(400, { message: '제목은 필수입니다.' });

		try {
			await db
				.update(schema.problemsets)
				.set({
					title,
					description,
					updatedAt: new Date()
				})
				.where(eq(schema.problemsets.id, id));

			return { success: true };
		} catch (err) {
			console.error(err);
			return fail(500, { message: '정보 수정 중 오류가 발생했습니다.' });
		}
	},

	addProblem: async ({ request, params, locals }) => {
		if (!locals.user) throw error(401, 'Unauthorized');

		const problemsetId = parseInt(params.id);
		const formData = await request.formData();
		const problemIdStr = formData.get('problemId') as string;
		const problemId = parseInt(problemIdStr);

		if (isNaN(problemId)) return fail(400, { message: '유효하지 않은 문제 ID입니다.' });

		// Verify problemset exists and auth
		const existingProblemset = await db.query.problemsets.findFirst({
			where: eq(schema.problemsets.id, problemsetId),
			with: { problems: true }
		});

		if (!existingProblemset) throw error(404, 'Problemset not found');
		const isOwner = locals.user.id === existingProblemset.createdById;
		const isAdmin = locals.user.role === 'admin';
		if (!isAdmin && !isOwner) throw error(403, 'Forbidden');

		// Check if already added
		if (existingProblemset.problems.some((p) => p.problemId === problemId)) {
			return fail(400, { message: '이미 추가된 문제입니댜.' });
		}

		try {
			const maxOrder =
				existingProblemset.problems.length > 0
					? Math.max(...existingProblemset.problems.map((p) => p.order))
					: 0;

			await db.insert(schema.problemsetProblems).values({
				problemsetId,
				problemId,
				order: maxOrder + 1
			});
			return { success: true };
		} catch (err) {
			console.error(err);
			return fail(500, { message: '문제 추가 중 오류가 발생했습니다.' });
		}
	},

	removeProblem: async ({ request, params, locals }) => {
		if (!locals.user) throw error(401, 'Unauthorized');

		const problemsetId = parseInt(params.id);
		const formData = await request.formData();
		const problemIdStr = formData.get('problemId') as string;
		const problemId = parseInt(problemIdStr);

		if (isNaN(problemId)) return fail(400, { message: '유효하지 않은 문제 ID입니다.' });

		try {
			await db
				.delete(schema.problemsetProblems)
				.where(
					and(
						eq(schema.problemsetProblems.problemsetId, problemsetId),
						eq(schema.problemsetProblems.problemId, problemId)
					)
				);
			return { success: true };
		} catch (err) {
			console.error(err);
			return fail(500, { message: '문제 삭제 중 오류가 발생했습니다.' });
		}
	},

	deleteProblemset: async ({ params, locals }) => {
		console.log('Delete problemset action called', params.id);
		if (!locals.user) throw error(401, 'Unauthorized');

		const id = parseInt(params.id);
		const problemset = await db.query.problemsets.findFirst({
			where: eq(schema.problemsets.id, id)
		});

		if (!problemset) throw error(404, 'Problemset not found');

		const isOwner = locals.user.id === problemset.createdById;
		const isAdmin = locals.user.role === 'admin';
		if (!isAdmin && !isOwner) throw error(403, 'Forbidden');

		try {
			await db.delete(schema.problemsets).where(eq(schema.problemsets.id, id));
		} catch (err) {
			console.error(err);
			return fail(500, { message: '문제집 삭제 중 오류가 발생했습니다.' });
		}

		throw redirect(302, '/problemsets');
	}
};
