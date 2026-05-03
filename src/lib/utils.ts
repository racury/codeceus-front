import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export type Tier = {
	name: string;
	color: string;
	minRating: number | null;
};

export const TIERS: Tier[] = [
	{ name: '언레이티드', color: 'text-gray-400 bg-gray-400/10 border-gray-400/20', minRating: null },
	{ name: '아이언', color: 'text-slate-500 bg-slate-500/10 border-slate-500/20', minRating: 0 },
	{
		name: '브론즈',
		color: 'text-orange-700 bg-orange-700/10 border-orange-700/20',
		minRating: 500
	},
	{ name: '실버', color: 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20', minRating: 1000 },
	{ name: '골드', color: 'text-yellow-600 bg-yellow-600/10 border-yellow-600/20', minRating: 1500 },
	{ name: '플래티넘', color: 'text-teal-600 bg-teal-600/10 border-teal-600/20', minRating: 2000 },
	{ name: '다이아', color: 'text-blue-600 bg-blue-600/10 border-blue-600/20', minRating: 2500 },
	{
		name: '마스터',
		color: 'text-violet-600 bg-violet-600/10 border-violet-600/20',
		minRating: 3000
	}
];

export function getTier(rating: number | null | undefined): Tier {
	if (rating === null || rating === undefined) {
		return TIERS[0];
	}

	for (let i = TIERS.length - 1; i >= 1; i--) {
		const minRating = TIERS[i].minRating;
		if (minRating !== null && rating >= minRating) {
			return TIERS[i];
		}
	}
	return TIERS[1]; // Iron as fallback if rating is >= 0 but < 300
}
