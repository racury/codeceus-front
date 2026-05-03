import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { recalculateUserRating } from '$lib/server/rating';
import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) {
		throw redirect(302, '/signin');
	}

	const id = parseInt(params.id);
	if (isNaN(id)) throw error(400, 'Invalid ID');

	const problem = await db.query.problems.findFirst({
		where: eq(schema.problems.id, id),
		with: {
			categories: true,
			testcases: {
				orderBy: (testcases, { asc }) => [asc(testcases.id)]
			}
		}
	});

	if (!problem) throw error(404, 'Problem not found');

	// Authorization check
	const isOwner = locals.user.id === problem.createdById;
	const isAdmin = locals.user.role === 'admin';

	if (!isAdmin && !isOwner) {
		throw error(403, 'Forbidden');
	}

	const allCategories = await db.select().from(schema.categories).orderBy(schema.categories.name);

	return {
		problem,
		allCategories
	};
};

export const actions: Actions = {
	updateProblem: async ({ request, params, locals }) => {
		if (!locals.user) throw error(401, 'Unauthorized');

		const id = parseInt(params.id);
		if (isNaN(id)) throw error(400, 'Invalid ID');

		const existingProblem = await db.query.problems.findFirst({
			where: eq(schema.problems.id, id)
		});

		if (!existingProblem) throw error(404, 'Problem not found');

		const isOwner = locals.user.id === existingProblem.createdById;
		const isAdmin = locals.user.role === 'admin';
		if (!isAdmin && !isOwner) throw error(403, 'Forbidden');

		const formData = await request.formData();
		const title = formData.get('title') as string;
		const description = formData.get('description') as string;
		const inputFormat = formData.get('inputFormat') as string;
		const outputFormat = formData.get('outputFormat') as string;
		const sampleInput = formData.get('sampleInput') as string;
		const sampleOutput = formData.get('sampleOutput') as string;
		const hint = formData.get('hint') as string;
		const timeLimit = formData.get('timeLimit') as string;
		const memoryLimit = formData.get('memoryLimit') as string;
		const categoryIds = formData.getAll('categories').map(Number);
		
		const difficultyRatingStr = formData.get('difficultyRating') as string;
		const difficultyRating = difficultyRatingStr ? parseInt(difficultyRatingStr) : null;

		if (!title || !description) {
			return fail(400, { message: '제목과 설명은 필수입니다.' });
		}

		try {
			const updateData: any = {
				title,
				description,
				inputFormat,
				outputFormat,
				sampleInput,
				sampleOutput,
				hint,
				timeLimit,
				memoryLimit,
				updatedAt: new Date()
			};

			if (locals.user.role === 'admin') {
				updateData.difficultyRating = difficultyRating;
			}

			await db.update(schema.problems)
				.set(updateData)
				.where(eq(schema.problems.id, id));

			// If difficulty changed, recalculate all solvers' ratings
			if (locals.user.role === 'admin' && difficultyRating !== existingProblem.difficultyRating) {
				const solvers = await db.query.solvedProblems.findMany({
					where: eq(schema.solvedProblems.problemId, id)
				});
				
				// Run in background/parallel to avoid blocking the UI too long
				// but for small scale this is fine. 
				for (const s of solvers) {
					await recalculateUserRating(s.userId);
				}
			}

			await db.delete(schema.problemsToCategories).where(eq(schema.problemsToCategories.problemId, id));
			if (categoryIds.length > 0) {
				await db.insert(schema.problemsToCategories).values(
					categoryIds.map(catId => ({
						problemId: id,
						categoryId: catId
					}))
				);
			}

			return { success: true };
		} catch (err) {
			console.error(err);
			return fail(500, { message: '문제 수정 중 오류가 발생했습니다.' });
		}
	},

	updateTestcases: async ({ request, params, locals }) => {
		if (!locals.user) throw error(401, 'Unauthorized');

		const problemId = parseInt(params.id);
		const existingProblem = await db.query.problems.findFirst({
			where: eq(schema.problems.id, problemId)
		});

		if (!existingProblem) throw error(404, 'Problem not found');

		const isOwner = locals.user.id === existingProblem.createdById;
		const isAdmin = locals.user.role === 'admin';
		if (!isAdmin && !isOwner) throw error(403, 'Forbidden');

		const formData = await request.formData();
		const inputs = formData.getAll('testcaseInput');
		const outputs = formData.getAll('testcaseOutput');
		const isPublics = formData.getAll('testcaseIsPublic'); // values will be "on" or index

		try {
			await db.delete(schema.testcases).where(eq(schema.testcases.problemId, problemId));
			
			const testcaseData = inputs.map((input, i) => ({
				problemId,
				input: input as string,
				output: outputs[i] as string,
				isPublic: formData.get(`testcaseIsPublic_${i}`) === 'on'
			})).filter(tc => tc.input.trim() || tc.output.trim());

			if (testcaseData.length > 0) {
				await db.insert(schema.testcases).values(testcaseData);
			}

			return { success: true };
		} catch (err) {
			console.error(err);
			return fail(500, { message: '테스트케이스 업데이트 중 오류가 발생했습니다.' });
		}
	},

	deleteProblem: async ({ params, locals }) => {
		console.log('Delete problem action called', params.id);
		if (!locals.user) throw error(401, 'Unauthorized');

		const id = parseInt(params.id);
		const problem = await db.query.problems.findFirst({
			where: eq(schema.problems.id, id)
		});

		if (!problem) throw error(404, 'Problem not found');

		const isOwner = locals.user.id === problem.createdById;
		const isAdmin = locals.user.role === 'admin';
		if (!isAdmin && !isOwner) throw error(403, 'Forbidden');

		try {
			await db.delete(schema.problems).where(eq(schema.problems.id, id));
		} catch (err) {
			console.error(err);
			return fail(500, { message: '문제 삭제 중 오류가 발생했습니다.' });
		}

		throw redirect(302, '/problems');
	}
};
