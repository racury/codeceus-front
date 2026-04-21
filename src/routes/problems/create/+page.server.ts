import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/signin');
	}

	const categories = await db.select().from(schema.categories).orderBy(schema.categories.name);

	return {
		categories
	};
};

export const actions: Actions = {
	createProblem: async ({ request, locals }) => {
		if (!locals.user) {
			throw error(401, 'Unauthorized');
		}

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

		if (!title || !description) {
			return fail(400, { message: '제목과 설명은 필수입니다.' });
		}

		try {
			const [newProblem] = await db.insert(schema.problems).values({
				title,
				description,
				inputFormat,
				outputFormat,
				sampleInput,
				sampleOutput,
				hint,
				timeLimit: timeLimit || '1000ms',
				memoryLimit: memoryLimit || '256MB',
				difficultyRating: null, // 기본적으로 Unrated
				createdById: locals.user.id
			}).returning();

			if (categoryIds.length > 0) {
				await db.insert(schema.problemsToCategories).values(
					categoryIds.map(catId => ({
						problemId: newProblem.id,
						categoryId: catId
					}))
				);
			}

			return { success: true, problemId: newProblem.id };
		} catch (err) {
			console.error(err);
			return fail(500, { message: '문제 생성 중 오류가 발생했습니다.' });
		}
	}
};
