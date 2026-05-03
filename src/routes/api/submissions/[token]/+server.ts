import { db } from '$lib/server/db';
import { submissions, problemSubmissions, solvedProblems, user, problems } from '$lib/server/db/schema';
import { codeceus } from '$lib/server/codeceus';
import { recalculateUserRating } from '$lib/server/rating';
import { json } from '@sveltejs/kit';
import { eq, sql, and } from 'drizzle-orm';
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

export const GET: RequestHandler = async ({ params }) => {
	const { token } = params;

	try {
		console.log(`Polling codeceus for token: ${token}`);
		const sub = await codeceus.getSubmission(token);
		console.log(`Codeceus returned status ${sub.status_id} for token ${token}`);

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

			const allDone = allSubs.every(s => s.statusId !== 1 && s.statusId !== 2);
			if (allDone) {
				// Determine overall status: 
				// If any failed, overall is that failure (pick first non-accepted)
				// If all Accepted, overall is Accepted
				const failedSub = allSubs.find(s => s.statusId !== 3);
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

				// If successfully solved, mark it and give points
				if (finalStatusId === 3) {
					await db.transaction(async (tx) => {
						// Check if already solved
						const existingSolved = await tx.query.solvedProblems.findFirst({
							where: and(
								eq(solvedProblems.userId, updatedPs.userId),
								eq(solvedProblems.problemId, updatedPs.problemId)
							)
						});

						if (!existingSolved) {
							await tx.insert(solvedProblems).values({
								userId: updatedPs.userId,
								problemId: updatedPs.problemId
							});

							// Get problem difficulty for rating increase
							const problemData = await tx.query.problems.findFirst({
								where: eq(problems.id, updatedPs.problemId)
							});

							if (problemData && problemData.difficultyRating) {
								await recalculateUserRating(updatedPs.userId);
							}
						}
					});
				}
			}
		}

		return json(sub);
	} catch (err) {
		console.error(`Error syncing submission ${token}:`, err);
		return json({ error: String(err) }, { status: 500 });
	}
};
