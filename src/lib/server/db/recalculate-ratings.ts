// Must stay the first import: ../rating loads the DB module, which needs DATABASE_URL.
import 'dotenv/config';
import { recalculateAllRatings } from '../rating';

async function main() {
	try {
		await recalculateAllRatings();
		process.exit(0);
	} catch (error) {
		console.error('Failed to recalculate ratings:', error);
		process.exit(1);
	}
}

main();
