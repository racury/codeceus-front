import { env } from '$env/dynamic/private';

const BASE = env.CODECEUS_URL ?? 'http://localhost:2358';
const TOKEN = env.CODECEUS_TOKEN ?? '';

export type Language = {
	id: number;
	name: string;
	source_file: string;
	compile_cmd: string | null;
	run_cmd: string;
	is_archived: boolean;
	created_at: string;
};

export const STATUS = {
	IN_QUEUE: 1,
	PROCESSING: 2,
	ACCEPTED: 3,
	WRONG_ANSWER: 4,
	TIME_LIMIT_EXCEEDED: 5,
	COMPILATION_ERROR: 6,
	INTERNAL_ERROR: 13,
	MEMORY_LIMIT_EXCEEDED: 15
} as const;

export type Submission = {
	id: number;
	token: string;
	language_id: number;
	status_id: number;
	stdout: string | null;
	stderr: string | null;
	compile_output: string | null;
	message: string | null;
	exit_code: number | null;
	exit_signal: number | null;
	time_ms: number | null;
	wall_time_ms: number | null;
	memory_kb: number | null;
	queued_at: string;
	started_at: string | null;
	finished_at: string | null;
};

function headers(extra?: HeadersInit): HeadersInit {
	const h: Record<string, string> = { 'content-type': 'application/json' };
	if (TOKEN) h['x-auth-token'] = TOKEN;
	return { ...h, ...(extra as Record<string, string> | undefined) };
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
	const res = await fetch(`${BASE}${path}`, {
		...init,
		headers: headers(init?.headers)
	});
	if (!res.ok) {
		const body = await res.text().catch(() => '');
		throw new Error(`codeceus ${init?.method ?? 'GET'} ${path} → ${res.status}: ${body}`);
	}
	return res.json() as Promise<T>;
}

export const codeceus = {
	listLanguages: () => call<Language[]>('/languages'),

	createSubmission: (body: {
		language_id: number;
		source_code: string;
		stdin?: string;
		expected_output?: string;
		cpu_time_limit_ms?: number;
		wall_time_limit_ms?: number;
		memory_limit_kb?: number;
	}) =>
		call<Submission>('/submissions?wait=false', {
			method: 'POST',
			body: JSON.stringify(body)
		}),

	createBatchSubmissions: (submissions: {
		language_id: number;
		source_code: string;
		stdin?: string;
		expected_output?: string;
		cpu_time_limit_ms?: number;
		wall_time_limit_ms?: number;
		memory_limit_kb?: number;
	}[]) =>
		call<{ token: string }[]>('/submissions/batch?wait=false', {
			method: 'POST',
			body: JSON.stringify({ submissions })
		}),

	getSubmission: (token: string) => call<Submission>(`/submissions/${token}`),

	baseUrl: () => BASE
};
