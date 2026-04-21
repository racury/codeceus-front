import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { error, fail, redirect } from '@sveltejs/kit';
import { eq, and } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) throw error(400, 'Invalid ID');

	const competition = await db.query.competitions.findFirst({
		where: eq(schema.competitions.id, id),
		with: {
			createdBy: true,
			problems: {
				with: {
					problem: true
				},
				orderBy: (p, { asc }) => [asc(p.order)]
			},
			participants: true
		}
	});

	if (!competition) throw error(404, 'Competition not found');

	const isParticipant = locals.user 
		? competition.participants.some(p => p.userId === locals.user.id) 
		: false;

	return {
		competition,
		isParticipant
	};
};

export const actions: Actions = {
	join: async ({ params, locals }) => {
		if (!locals.user) throw redirect(302, '/signin');

		const competitionId = parseInt(params.id);
		const comp = await db.query.competitions.findFirst({
			where: eq(schema.competitions.id, competitionId)
		});

		if (!comp) throw error(404, 'Competition not found');

		const now = new Date();
		if (now > comp.endTime) {
			return fail(400, { message: '이미 종료된 대회입니다.' });
		}

		try {
			await db.insert(schema.competitionParticipants).values({
				competitionId,
				userId: locals.user.id
			}).onConflictDoNothing();

			return { success: true };
		} catch (err) {
			console.error(err);
			return fail(500, { message: '대회 참가 중 오류가 발생했습니다.' });
		}
	}
};
