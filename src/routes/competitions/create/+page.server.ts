import { db } from '$lib/server/db';
import { competitions, competitionProblems } from '$lib/server/db/schema';
import * as schema from '$lib/server/db/schema';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user?.role !== 'admin') {
		throw error(403, '관리자만 접근 가능합니다.');
	}

	const allProblems = await db.query.problems.findMany({
		orderBy: (p, { asc }) => [asc(p.id)]
	});

	return {
		allProblems
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		if (locals.user?.role !== 'admin') {
			throw error(403, 'Forbidden');
		}

		const formData = await request.formData();
		const title = formData.get('title') as string;
		const description = formData.get('description') as string;
		const startTimeStr = formData.get('startTime') as string;
		const endTimeStr = formData.get('endTime') as string;
		const problemIds = formData.getAll('problems').map(Number);

		if (!title || !startTimeStr || !endTimeStr) {
			return fail(400, { message: '필수 항목을 모두 입력해주세요.' });
		}

		const startTime = new Date(startTimeStr);
		const endTime = new Date(endTimeStr);

		if (endTime <= startTime) {
			return fail(400, { message: '종료 시간은 시작 시간보다 늦어야 합니다.' });
		}

		let newId: number;
		try {
			const [newComp] = await db.insert(competitions).values({
				title,
				description,
				startTime,
				endTime,
				createdById: locals.user.id
			}).returning();
			newId = newComp.id;

			if (problemIds.length > 0) {
				await db.insert(competitionProblems).values(
					problemIds.map((pId, i) => ({
						competitionId: newId,
						problemId: pId,
						order: i
					}))
				);
			}
		} catch (err) {
			console.error(err);
			return fail(500, { message: '대회 생성 중 오류가 발생했습니다.' });
		}

		throw redirect(302, `/competitions/${newId}`);
	}
};
