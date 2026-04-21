import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const id = parseInt(params.id);
	if (isNaN(id)) throw error(400, 'Invalid ID');

	const roadmap = await db.query.roadmaps.findFirst({
		where: eq(schema.roadmaps.id, id),
		with: {
			createdBy: true,
			nodes: {
				with: {
					problemset: {
						with: {
							problems: true
						}
					}
				}
			},
			edges: true
		}
	});

	if (!roadmap) throw error(404, 'Roadmap not found');

	let solvedProblemIds = new Set<number>();
	if (locals.user) {
		const userSubmissions = await db.query.submissions.findMany({
			where: eq(schema.submissions.userId, locals.user.id),
			columns: { problemId: true }
		});
		userSubmissions.forEach(sub => solvedProblemIds.add(sub.problemId));
	}

	const nodeProgress: Record<string, { total: number; solved: number; isCompleted: boolean; isLocked: boolean }> = {};

	for (const node of roadmap.nodes) {
		const total = node.problemset.problems.length;
		let solved = 0;
		for (const pp of node.problemset.problems) {
			if (solvedProblemIds.has(pp.problemId)) {
				solved++;
			}
		}
		// A problemset is considered "completed" for roadmap progression if at least half of the problems are solved
		const isCompleted = total > 0 ? (solved / total) >= 0.5 : true; 
		nodeProgress[node.id] = { total, solved, isCompleted, isLocked: false };
	}

	// Calculate locks based on edges
	// A node is locked if it has an incoming edge from a node that is NOT completed.
	for (const edge of roadmap.edges) {
		const sourceNode = nodeProgress[edge.sourceId];
		if (sourceNode && !sourceNode.isCompleted) {
			if (nodeProgress[edge.targetId]) {
				nodeProgress[edge.targetId].isLocked = true;
			}
		}
	}

	return {
		roadmap,
		nodeProgress
	};
};
