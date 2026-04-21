import { db } from '$lib/server/db';
import { problemsets } from '$lib/server/db/schema';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/signin');
	}
	return {};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (!locals.user) {
			throw error(401, 'Unauthorized');
		}

		const formData = await request.formData();
		const title = formData.get('title') as string;
		const description = formData.get('description') as string;

		if (!title) {
			return fail(400, { title, description, missing: true });
		}

		let newId: number;
		try {
			const [newProblemset] = await db.insert(problemsets).values({
				title,
				description,
				createdById: locals.user.id
			}).returning();
			newId = newProblemset.id;
		} catch (err) {
			console.error(err);
			return fail(500, { message: '문제집 생성 중 오류가 발생했습니다.' });
		}

		throw redirect(302, `/problemsets/${newId}/edit`);
	}
};
