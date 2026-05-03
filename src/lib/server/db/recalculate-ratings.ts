import { recalculateAllRatings } from '../rating';
import 'dotenv/config';

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
