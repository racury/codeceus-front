import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import 'dotenv/config';

if (!process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL is not set in .env');
}

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client, { schema });

async function seed() {
	console.log('Seeding categories and problems...');
	
	// 1. 기존 데이터 삭제 (연쇄 삭제됨)
	await db.delete(schema.problems);
	await db.delete(schema.categories);

	// 2. 카테고리 생성
	const categoryNames = ['기초', 'DP', 'Backtracking', 'Mathematics', 'String', 'Greedy'];
	const createdCategories = [];
	for (const name of categoryNames) {
		const [cat] = await db.insert(schema.categories).values({ name }).returning();
		createdCategories.push(cat);
	}

	const getCatId = (name: string) => createdCategories.find(c => c.name === name)!.id;

	// 3. 문제 데이터 생성
	const problems = [
		{
			data: {
				title: 'A+B 문제',
				difficultyRating: 150,
				timeLimit: '1000ms',
				memoryLimit: '256MB',
				description: '두 정수 A와 B를 입력받은 다음, A+B를 출력하는 프로그램을 작성하시오.',
				inputFormat: '첫째 줄에 A와 B가 주어진다. (0 < A, B < 10)',
				outputFormat: '첫째 줄에 A+B를 출력한다.',
				sampleInput: '1 2',
				sampleOutput: '3',
				hint: '두 정수는 32비트 정수형 범위 내에 있습니다.'
			},
			categories: ['기초', 'Mathematics']
		},
		{
			data: {
				title: '최장 공통 부분 수열',
				difficultyRating: 950,
				timeLimit: '2000ms',
				memoryLimit: '512MB',
				description: '두 수열이 주어졌을 때, 모두의 부분 수열이 되는 수열 중 가장 긴 것을 찾는 프로그램을 작성하시오.',
				inputFormat: '첫째 줄과 둘째 줄에 두 문자열이 주어진다. 문자열은 알파벳 대문자로만 이루어져 있으며, 최대 1000글자로 이루어져 있다.',
				outputFormat: '첫째 줄에 입력으로 주어진 두 문자열의 LCS의 길이를 출력한다.',
				sampleInput: 'ACAYKP\nCAPCAK',
				sampleOutput: '4',
				hint: 'DP를 이용해 해결할 수 있습니다.'
			},
			categories: ['DP', 'String']
		},
		{
			data: {
				title: 'N-Queens 문제',
				difficultyRating: 1550,
				timeLimit: '10000ms',
				memoryLimit: '256MB',
				description: 'N × N 체스판 위에 퀸 N개를 서로 공격할 수 없게 놓는 문제이다.',
				inputFormat: '첫째 줄에 N이 주어진다. (1 ≤ N < 15)',
				outputFormat: '첫째 줄에 퀸 N개를 놓는 방법의 수를 출력한다.',
				sampleInput: '8',
				sampleOutput: '92',
				hint: '백트래킹을 사용하여 모든 경우를 탐색해보세요.'
			},
			categories: ['Backtracking']
		}
	];

	for (const p of problems) {
		const [insertedProblem] = await db.insert(schema.problems).values(p.data).returning();
		for (const catName of p.categories) {
			await db.insert(schema.problemsToCategories).values({
				problemId: insertedProblem.id,
				categoryId: getCatId(catName)
			});
		}
	}

	console.log('Seeding finished.');
	await client.end();
}

seed().catch((err) => {
	console.error('Seed failed');
	console.error(err);
	process.exit(1);
});
