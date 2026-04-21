import { db } from '$lib/server/db';
import * as schema from '$lib/server/db/schema';
import { error, fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	if (!locals.user) {
		throw redirect(302, '/signin');
	}

	const id = parseInt(params.id);
	if (isNaN(id)) throw error(400, 'Invalid ID');

	const roadmap = await db.query.roadmaps.findFirst({
		where: eq(schema.roadmaps.id, id),
		with: {
			nodes: {
				with: {
					problemset: true
				}
			},
			edges: true
		}
	});

	if (!roadmap) throw error(404, 'Roadmap not found');

	const isOwner = locals.user.id === roadmap.createdById;
	const isAdmin = locals.user.role === 'admin';
	if (!isAdmin && !isOwner) throw error(403, 'Forbidden');

	const allProblemsets = await db.query.problemsets.findMany({
		orderBy: (ps, { asc }) => [asc(ps.id)]
	});

	return {
		roadmap,
		allProblemsets
	};
};

export const actions: Actions = {
	saveGraph: async ({ request, params, locals }) => {
		if (!locals.user) throw error(401, 'Unauthorized');

		const roadmapId = parseInt(params.id);
		const existingRoadmap = await db.query.roadmaps.findFirst({
			where: eq(schema.roadmaps.id, roadmapId)
		});

		if (!existingRoadmap) throw error(404, 'Roadmap not found');

		const isOwner = locals.user.id === existingRoadmap.createdById;
		const isAdmin = locals.user.role === 'admin';
		if (!isAdmin && !isOwner) throw error(403, 'Forbidden');

		const formData = await request.formData();
		const graphDataStr = formData.get('graphData') as string;
		if (!graphDataStr) return fail(400, { message: 'No graph data provided' });

		try {
			const { nodes, edges } = JSON.parse(graphDataStr);

			// Delete existing nodes and edges (edges will be deleted via cascade or we can delete them first)
			await db.delete(schema.roadmapNodes).where(eq(schema.roadmapNodes.roadmapId, roadmapId));

			// Insert new nodes
			if (nodes && nodes.length > 0) {
				await db.insert(schema.roadmapNodes).values(
					nodes.map((n: any) => ({
						id: n.id,
						roadmapId,
						problemsetId: n.data.problemsetId,
						positionX: Math.round(n.position.x),
						positionY: Math.round(n.position.y)
					}))
				);
			}

			// Insert new edges
			if (edges && edges.length > 0) {
				await db.insert(schema.roadmapEdges).values(
					edges.map((e: any) => ({
						id: e.id,
						roadmapId,
						sourceId: e.source,
						targetId: e.target
					}))
				);
			}

			return { success: true };
		} catch (err) {
			console.error(err);
			return fail(500, { message: '그래프 저장 중 오류가 발생했습니다.' });
		}
	},
	deleteRoadmap: async ({ params, locals }) => {
		if (!locals.user) throw error(401, 'Unauthorized');

		const id = parseInt(params.id);
		const roadmap = await db.query.roadmaps.findFirst({
			where: eq(schema.roadmaps.id, id)
		});

		if (!roadmap) throw error(404, 'Roadmap not found');

		const isOwner = locals.user.id === roadmap.createdById;
		const isAdmin = locals.user.role === 'admin';
		if (!isAdmin && !isOwner) throw error(403, 'Forbidden');

		try {
			await db.delete(schema.roadmaps).where(eq(schema.roadmaps.id, id));
		} catch (err) {
			console.error(err);
			return fail(500, { message: '로드맵 삭제 중 오류가 발생했습니다.' });
		}

		throw redirect(302, '/roadmaps');
	}
};
