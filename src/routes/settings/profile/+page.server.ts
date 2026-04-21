import { db } from '$lib/server/db';
import { user, account } from '$lib/server/db/schema';
import { error, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/signin');
	}

	const userAccounts = await db.query.account.findMany({
		where: eq(account.userId, locals.user.id)
	});

	const hasPassword = userAccounts.some(acc => acc.providerId === 'credential');

	return {
		currentUser: locals.user,
		hasPassword
	};
};

export const actions: Actions = {
	updateProfile: async ({ request, locals }) => {
		if (!locals.user) {
			throw error(401, 'Unauthorized');
		}

		const formData = await request.formData();
		const name = formData.get('name') as string;
		const image = formData.get('image') as string;

		if (!name || name.length < 2) {
			return fail(400, { 
				message: '닉네임은 최소 2글자 이상이어야 합니다.',
				action: 'updateProfile' 
			});
		}

		try {
			await db.update(user)
				.set({ 
					name, 
					image: image || null,
					updatedAt: new Date()
				})
				.where(eq(user.id, locals.user.id));

			return { 
				success: true, 
				message: '프로필이 성공적으로 업데이트되었습니다!',
				action: 'updateProfile'
			};
		} catch (e) {
			console.error(e);
			return fail(500, { 
				message: '프로필 업데이트 중 오류가 발생했습니다.',
				action: 'updateProfile'
			});
		}
	},

	changePassword: async ({ request, locals }) => {
		if (!locals.user) {
			throw error(401, 'Unauthorized');
		}

		const userAccounts = await db.query.account.findMany({
			where: eq(account.userId, locals.user.id)
		});
		const hasPassword = userAccounts.some((acc) => acc.providerId === 'credential');

		const formData = await request.formData();
		const currentPassword = formData.get('currentPassword') as string;
		const newPassword = formData.get('newPassword') as string;
		const confirmPassword = formData.get('confirmPassword') as string;

		if ((hasPassword && !currentPassword) || !newPassword || !confirmPassword) {
			return fail(400, {
				message: '모든 필드를 입력해주세요.',
				passwordError: true,
				action: 'changePassword'
			});
		}

		if (newPassword !== confirmPassword) {
			return fail(400, {
				message: '새 비밀번호가 일치하지 않습니다.',
				passwordError: true,
				action: 'changePassword'
			});
		}

		if (newPassword.length < 8) {
			return fail(400, {
				message: '비밀번호는 최소 8자 이상이어야 합니다.',
				passwordError: true,
				action: 'changePassword'
			});
		}

		try {
			if (hasPassword) {
				await auth.api.changePassword({
					headers: request.headers,
					body: {
						currentPassword,
						newPassword,
						revokeOtherSessions: true
					}
				});
			} else {
				// 비밀번호가 없는 사용자는setPassword 또는 setPassword 액션을 사용해야 함
				// Better Auth의 경우 setPassword 또는 유사한 API 제공 확인 필요
				// 여기서는 일반적인 changePassword 대신 다른 처리가 필요할 수 있음
				await auth.api.setPassword({
					headers: request.headers,
					body: {
						newPassword
					}
				});
			}

			return {
				success: true,
				message: hasPassword
					? '비밀번호가 성공적으로 변경되었습니다!'
					: '비밀번호가 성공적으로 설정되었습니다!',
				passwordError: true,
				action: 'changePassword'
			};
		} catch (e: any) {
			return fail(400, {
				message: '비밀번호 변경 중 오류가 발생했습니다. 현재 비밀번호를 확인해주세요.',
				passwordError: true,
				action: 'changePassword'
			});
		}
	}
};
