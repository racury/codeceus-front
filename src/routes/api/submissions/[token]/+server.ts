import { db } from '$lib/server/db';
import { submissions, problemSubmissions, solvedProblems, problems } from '$lib/server/db/schema';
import { codeceus } from '$lib/server/codeceus';
import { recalculateUserRating } from '$lib/server/rating';
import { json } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

const STATUS_LABELS: Record<number, string> = {
	1: 'In Queue',
	2: 'Processing',
	3: 'Accepted',
	4: 'Wrong Answer',
	5: 'Time Limit Exceeded',
	6: 'Compilation Error',
	7: 'Runtime Error (SIGSEGV)',
	8: 'Runtime Error (SIGXFSZ)',
	9: 'Runtime Error (SIGFPE)',
	10: 'Runtime Error (SIGABRT)',
	11: 'Runtime Error (NZEC)',
	12: 'Runtime Error',
	13: 'Internal Error',
	14: 'Exec Format Error',
	15: 'Memory Limit Exceeded'
};

export const GET: RequestHandler = async ({ params, locals }) => {
	const { token } = params;

	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	// Only the owner may poll a submission. Unknown and foreign tokens get the
	// same 404 so tokens can't be probed.
	const owned = await db.query.submissions.findFirst({
		where: eq(submissions.token, token),
		columns: { userId: true }
	});
	if (!owned || owned.userId !== locals.user.id) {
		return json({ error: 'Not found' }, { status: 404 });
	}

	try {
		const sub = await codeceus.getSubmission(token);

		// Update individual submission
		const done = sub.status_id !== 1 && sub.status_id !== 2;

		const [updatedSub] = await db
			.update(submissions)
			.set({
				statusId: sub.status_id,
				status: STATUS_LABELS[sub.status_id] ?? `Status ${sub.status_id}`,
				runtime: sub.time_ms,
				memory: sub.memory_kb,
				stdout: sub.stdout,
				stderr: sub.stderr,
				compileOutput: sub.compile_output,
				message: sub.message,
				finishedAt: done ? new Date() : null
			})
			.where(eq(submissions.token, token))
			.returning();

		// If this is part of a problem submission, update the parent status
		if (updatedSub && updatedSub.problemSubmissionId && done) {
			const psId = updatedSub.problemSubmissionId;

			// Check all testcases for this problem submission
			const allSubs = await db.query.submissions.findMany({
				where: eq(submissions.problemSubmissionId, psId)
			});

			const allDone = allSubs.every((s) => s.statusId !== 1 && s.statusId !== 2);
			if (allDone) {
				// Determine overall status:
				// If any failed, overall is that failure (pick first non-accepted)
				// If all Accepted, overall is Accepted
				const failedSub = allSubs.find((s) => s.statusId !== 3);
				const finalStatusId = failedSub ? failedSub.statusId : 3;
				const finalStatus = failedSub ? failedSub.status : 'Accepted';

				// Aggregates
				const totalRuntime = allSubs.reduce((acc, s) => acc + (s.runtime ?? 0), 0);
				const maxMemory = allSubs.reduce((acc, s) => Math.max(acc, s.memory ?? 0), 0);

				const [updatedPs] = await db
					.update(problemSubmissions)
					.set({
						statusId: finalStatusId,
						status: finalStatus,
						runtime: totalRuntime,
						memory: maxMemory,
						finishedAt: new Date()
					})
					.where(eq(problemSubmissions.id, psId))
					.returning();

				// If successfully solved, mark it and give points. Concurrent polls
				// can both get here, so the insert itself decides who records the
				// solve; the rating is recalculated only after the row is committed,
				// because recalculateUserRating reads through its own connection.
				if (finalStatusId === 3) {
					const inserted = await db
						.insert(solvedProblems)
						.values({ userId: updatedPs.userId, problemId: updatedPs.problemId })
						.onConflictDoNothing()
						.returning();

					if (inserted.length > 0) {
						const problemData = await db.query.problems.findFirst({
							where: eq(problems.id, updatedPs.problemId),
							columns: { difficultyRating: true }
						});
						if (problemData?.difficultyRating) {
							await recalculateUserRating(updatedPs.userId);
						}
					}
				}
			}
		}

		// Return only what the problem page renders. The raw backend submission
		// also carries the testcase's stdin and expected_output, which would leak
		// hidden testcases.
		return json({
			status_id: sub.status_id,
			stdout: sub.stdout,
			stderr: sub.stderr,
			compile_output: sub.compile_output,
			message: sub.message,
			time_ms: sub.time_ms,
			memory_kb: sub.memory_kb
		});
	} catch (err) {
		console.error(`Error syncing submission ${token}:`, err);
		return json({ error: 'Failed to sync submission' }, { status: 500 });
	}
};
