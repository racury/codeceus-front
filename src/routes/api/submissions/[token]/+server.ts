import { codeceus } from '$lib/server/codeceus';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
	const token = params.token;
	if (!token || !/^[0-9a-f-]{36}$/i.test(token)) {
		throw error(400, 'invalid token');
	}
	try {
		const sub = await codeceus.getSubmission(token);
		return json(sub);
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		throw error(502, message);
	}
};
