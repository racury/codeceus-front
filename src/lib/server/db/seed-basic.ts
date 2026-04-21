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
	console.log('Clearing existing data and seeding basic problems...');
	
	// Delete existing data
	await db.delete(schema.problems);
	await db.delete(schema.categories);
	await db.delete(schema.testcases);

	// 1. Categories
	const categoryNames = ['연산자', '조건문', '반복문', '배열', '기초'];
	const createdCategories = [];
	for (const name of categoryNames) {
		const [cat] = await db.insert(schema.categories).values({ name }).returning();
		createdCategories.push(cat);
	}
	const getCatId = (name: string) => createdCategories.find(c => c.name === name)!.id;

	// 2. Problem Data with Testcases
	const basicProblems = [
		{
			data: {
				title: '사칙연산의 기초',
				difficultyRating: 100,
				timeLimit: '1000ms',
				memoryLimit: '256MB',
				description: '두 자연수 A와 B가 주어진다. 이때, A+B, A-B, A*B, A/B(몫), A%B(나머지)를 출력하는 프로그램을 작성하시오.',
				inputFormat: '두 자연수 A와 B가 주어진다. (1 ≤ A, B ≤ 10,000)',
				outputFormat: '첫째 줄에 A+B, 둘째 줄에 A-B, 셋째 줄에 A*B, 넷째 줄에 A/B, 다섯째 줄에 A%B를 출력한다.',
				hint: '나눗셈 결과는 정수 몫만 출력해야 합니다.'
			},
			categories: ['연산자', '기초'],
			testcases: [
				{ input: '7 3', output: '10\n4\n21\n2\n1', isPublic: true },
				{ input: '10 5', output: '15\n5\n50\n2\n0', isPublic: true },
				{ input: '1 1', output: '2\n0\n1\n1\n0', isPublic: false },
				{ input: '10000 1', output: '10001\n9999\n10000\n10000\n0', isPublic: false }
			]
		},
		{
			data: {
				title: '두 수 비교하기',
				difficultyRating: 120,
				timeLimit: '1000ms',
				memoryLimit: '256MB',
				description: '두 정수 A와 B가 주어졌을 때, A와 B를 비교하는 프로그램을 작성하시오.',
				inputFormat: '첫째 줄에 A와 B가 주어진다. A와 B는 공백 한 칸으로 구분되어져 있다.',
				outputFormat: 'A가 B보다 큰 경우에는 ">", A가 B보다 작은 경우에는 "<", A와 B가 같은 경우에는 "=="를 출력한다.',
				hint: 'if-else 문을 활용해보세요.'
			},
			categories: ['조건문', '기초'],
			testcases: [
				{ input: '1 2', output: '<', isPublic: true },
				{ input: '10 2', output: '>', isPublic: true },
				{ input: '5 5', output: '==', isPublic: true },
				{ input: '-10 5', output: '<', isPublic: false },
				{ input: '100 -100', output: '>', isPublic: false }
			]
		},
		{
			data: {
				title: '구구단',
				difficultyRating: 150,
				timeLimit: '1000ms',
				memoryLimit: '256MB',
				description: 'N을 입력받은 뒤, 구구단 N단을 출력하는 프로그램을 작성하시오. 출력 형식에 맞춰서 출력해야 한다.',
				inputFormat: '첫째 줄에 N이 주어진다. N은 1보다 크거나 같고, 9보다 작거나 같다.',
				outputFormat: '출력형식과 같게 N*1부터 N*9까지 출력한다.',
				hint: '반복문을 사용하세요. (N * 1 = result 형식)'
			},
			categories: ['반복문', '기초'],
			testcases: [
				{ input: '2', output: '2 * 1 = 2\n2 * 2 = 4\n2 * 3 = 6\n2 * 4 = 8\n2 * 5 = 10\n2 * 6 = 12\n2 * 7 = 14\n2 * 8 = 16\n2 * 9 = 18', isPublic: true },
				{ input: '5', output: '5 * 1 = 5\n5 * 2 = 10\n5 * 3 = 15\n5 * 4 = 20\n5 * 5 = 25\n5 * 6 = 30\n5 * 7 = 35\n5 * 8 = 40\n5 * 9 = 45', isPublic: false }
			]
		},
		{
			data: {
				title: '최소, 최대',
				difficultyRating: 250,
				timeLimit: '1000ms',
				memoryLimit: '256MB',
				description: 'N개의 정수가 주어진다. 이때, 최솟값과 최댓값을 구하는 프로그램을 작성하시오.',
				inputFormat: '첫째 줄에 정수의 개수 N (1 ≤ N ≤ 1,000,000)이 주어진다. 둘째 줄에는 N개의 정수가 공백으로 구분되어 주어진다. 모든 정수는 -1,000,000보다 크거나 같고, 1,000,000보다 크거나 같은 정수이다.',
				outputFormat: '첫째 줄에 주어진 정수 N개의 최솟값과 최댓값을 공백으로 구분해 출력한다.',
				hint: '배열을 사용하여 정수들을 저장한 후 탐색해보세요.'
			},
			categories: ['배열', '반복문'],
			testcases: [
				{ input: '5\n20 10 35 30 7', output: '7 35', isPublic: true },
				{ input: '1\n10', output: '10 10', isPublic: false },
				{ input: '3\n-1 -5 -2', output: '-5 -1', isPublic: false },
				{ input: '4\n100 0 50 100', output: '0 100', isPublic: false }
			]
		}
	];

	for (const p of basicProblems) {
		const [insertedProblem] = await db.insert(schema.problems).values(p.data).returning();
		
		// Insert categories mapping
		for (const catName of p.categories) {
			await db.insert(schema.problemsToCategories).values({
				problemId: insertedProblem.id,
				categoryId: getCatId(catName)
			});
		}

		// Insert testcases
		if (p.testcases && p.testcases.length > 0) {
			await db.insert(schema.testcases).values(
				p.testcases.map(tc => ({
					...tc,
					problemId: insertedProblem.id
				}))
			);
		}
	}

	console.log(`Seeding finished. Added ${basicProblems.length} problems with testcases.`);
	await client.end();
}

seed().catch((err) => {
	console.error('Seed failed');
	console.error(err);
	process.exit(1);
});
