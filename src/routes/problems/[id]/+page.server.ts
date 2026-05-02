import { db } from '$lib/server/db';
import { problems } from '$lib/server/db/schema';
import { codeceus } from '$lib/server/codeceus';
import { error, fail } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const id = parseInt(params.id);

	if (isNaN(id)) {
		throw error(400, 'Invalid problem ID');
	}

	const problem = await db.query.problems.findFirst({
		where: eq(problems.id, id),
		with: {
			testcases: {
				where: (testcases, { eq }) => eq(testcases.isPublic, true),
				orderBy: (testcases, { asc }) => [asc(testcases.id)]
			}
		}
	});

	if (!problem) {
		throw error(404, 'Problem not found');
	}

	let languages: Awaited<ReturnType<typeof codeceus.listLanguages>> = [];
	let languagesError: string | null = null;
	try {
		languages = (await codeceus.listLanguages()).filter((l) => !l.is_archived);
	} catch (err) {
		languagesError = err instanceof Error ? err.message : String(err);
		console.error('codeceus.listLanguages failed:', languagesError);
	}

	return {
		problem,
		user: locals.user,
		languages,
		languagesError
	};
};

export const actions: Actions = {
	submit: async ({ request }) => {
		const form = await request.formData();
		const language_id = Number(form.get('language_id'));
		const source_code = String(form.get('source_code') ?? '');
		const stdin = form.get('stdin');

		if (!Number.isFinite(language_id) || language_id <= 0) {
			return fail(400, { message: '언어를 선택하세요.' });
		}
		if (!source_code.trim()) {
			return fail(400, { message: '소스 코드를 입력하세요.' });
		}

		try {
			const sub = await codeceus.createSubmission({
				language_id,
				source_code,
				stdin: typeof stdin === 'string' && stdin.length > 0 ? stdin : undefined
			});
			return { success: true, token: sub.token };
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			console.error('codeceus.createSubmission failed:', message);
			return fail(502, { message: `채점 서버 오류: ${message}` });
		}
	}
};
