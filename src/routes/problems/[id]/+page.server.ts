import { db } from '$lib/server/db';
import { problems, submissions, problemSubmissions } from '$lib/server/db/schema';
import { codeceus } from '$lib/server/codeceus';
import { error, fail } from '@sveltejs/kit';
import { eq, and, desc } from 'drizzle-orm';
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

	let userSubmissions: any[] = [];
	if (locals.user) {
		userSubmissions = await db.query.problemSubmissions.findMany({
			where: and(eq(problemSubmissions.problemId, id), eq(problemSubmissions.userId, locals.user.id)),
			with: {
				testcaseSubmissions: {
					orderBy: (s, { asc }) => [asc(s.testcaseIndex)]
				}
			},
			orderBy: [desc(problemSubmissions.createdAt)]
		});
	}

	return {
		problem,
		user: locals.user,
		languages,
		languagesError,
		userSubmissions
	};
};

export const actions: Actions = {
	submit: async ({ params, request, locals }) => {
		if (!locals.user) {
			return fail(401, { message: '로그인이 필요합니다.' });
		}

		const id = parseInt(params.id);
		const form = await request.formData();
		const language_id = Number(form.get('language_id'));
		const source_code = String(form.get('source_code') ?? '');

		if (!Number.isFinite(language_id) || language_id <= 0) {
			return fail(400, { message: '언어를 선택하세요.' });
		}
		if (!source_code.trim()) {
			return fail(400, { message: '소스 코드를 입력하세요.' });
		}

		try {
			const problem = await db.query.problems.findFirst({
				where: eq(problems.id, id),
				with: {
					testcases: true
				}
			});

			if (!problem) {
				return fail(404, { message: '문제를 찾을 수 없습니다.' });
			}

			// Parse limits: "1000ms" -> 1000, "256MB" -> 256000
			const timeLimitMs = parseInt(problem.timeLimit);
			const memoryLimitKb = problem.memoryLimit.toLowerCase().endsWith('mb')
				? parseInt(problem.memoryLimit) * 1024
				: parseInt(problem.memoryLimit);

			const languages = await codeceus.listLanguages();
			const language = languages.find((l) => l.id === language_id)?.name ?? 'Unknown';

			if (problem.testcases.length === 0) {
				return fail(400, { message: '이 문제에는 등록된 테스트케이스가 없습니다.' });
			}

			const batch = await codeceus.createBatchSubmissions(
				problem.testcases.map((tc) => ({
					language_id,
					source_code,
					stdin: tc.input,
					expected_output: tc.output,
					cpu_time_limit_ms: isNaN(timeLimitMs) ? undefined : timeLimitMs,
					memory_limit_kb: isNaN(memoryLimitKb) ? undefined : memoryLimitKb
				}))
			);

			await db.transaction(async (tx) => {
				const [ps] = await tx.insert(problemSubmissions).values({
					problemId: id,
					userId: locals.user!.id,
					language,
					code: source_code,
					status: 'Processing',
					statusId: 2
				}).returning();

				await tx.insert(submissions).values(
					batch.map((b, i) => ({
						problemId: id,
						userId: locals.user!.id,
						problemSubmissionId: ps.id,
						token: b.token,
						testcaseIndex: i + 1,
						language,
						code: source_code,
						status: 'In Queue',
						statusId: 1
					}))
				);
			});

			return {
				success: true,
				results: batch.map((b, i) => ({
					token: b.token,
					testcase_index: i + 1
				}))
			};
		} catch (err) {
			const message = err instanceof Error ? err.message : String(err);
			console.error('Submission failed:', message);
			return fail(502, { message: `채점 서버 오류: ${message}` });
		}
	}
};
