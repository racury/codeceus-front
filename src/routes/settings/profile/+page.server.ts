import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { error, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

export const load = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/signin');
	}

	return {
		currentUser: locals.user
	};
};

export const actions = {
	updateProfile: async ({ request, locals }) => {
		if (!locals.user) {
			throw error(401, 'Unauthorized');
		}

		const formData = await request.formData();
		const name = formData.get('name') as string;
		const image = formData.get('image') as string;

		if (!name || name.length < 2) {
			return fail(400, { message: '닉네임은 최소 2글자 이상이어야 합니다.' });
		}

		try {
			await db.update(user)
				.set({ 
					name, 
					image: image || null,
					updatedAt: new Date()
				})
				.where(eq(user.id, locals.user.id));

			return { success: true };
		} catch (e) {
			console.error(e);
			return fail(500, { message: '프로필 업데이트 중 오류가 발생했습니다.' });
		}
	}
};
