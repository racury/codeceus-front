<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { Trophy, Clock, Users, Calendar } from '@lucide/svelte';

	const competitions = [
		{
			title: '주간 콘테스트 #42',
			status: 'active',
			timeLeft: '01:24:05',
			participants: 1205,
			type: '공개',
			description: '4개의 알고리즘 문제로 구성된 정기 주간 챌린지입니다.'
		},
		{
			title: 'Svelte 5 출시 기념 특별 대회',
			status: 'upcoming',
			startTime: '4월 25일, 14:00',
			participants: 540,
			type: '특별',
			description: '반응성과 최적화에 초점을 맞춘 문제들로 Svelte 5의 출시를 축하하세요.'
		},
		{
			title: '알고리즘 마스터즈 2024',
			status: 'upcoming',
			startTime: '5월 1일, 10:00',
			participants: 3200,
			type: '메이저',
			description: '올해 가장 큰 규모의 대회입니다. 상위 10위에게는 특별한 상품이 주어집니다.'
		},
		{
			title: '자료구조 블리츠',
			status: 'past',
			startTime: '4월 15일, 18:00',
			participants: 890,
			type: '공개',
			description: '효율적인 자료구조 활용에 집중한 빠른 템포의 대회입니다.'
		}
	];
</script>

<div class="container mx-auto px-4 py-10">
	<div class="flex flex-col gap-8">
		<div class="flex flex-col gap-4 md:flex-row md:items-center justify-between">
			<div>
				<h1 class="text-3xl font-bold tracking-tight">대회</h1>
				<p class="mt-1 text-muted-foreground">콘테스트에 참여하여 다른 사람들과 경쟁하고 실력을 증명하세요.</p>
			</div>
			<Button class="flex gap-2">
				<Trophy class="h-4 w-4" /> 내 신청 내역
			</Button>
		</div>

		<div class="grid gap-6">
			{#each competitions as contest}
				<Card.Root class={contest.status === 'active' ? 'border-primary ring-1 ring-primary/20' : ''}>
					<Card.Content class="p-6">
						<div class="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
							<div class="flex-1 space-y-4">
								<div class="flex items-center gap-3">
									{#if contest.status === 'active'}
										<Badge class="animate-pulse bg-red-500 hover:bg-red-600">진행 중</Badge>
									{:else if contest.status === 'upcoming'}
										<Badge variant="secondary">예정됨</Badge>
									{:else}
										<Badge variant="outline">종료됨</Badge>
									{/if}
									<Badge variant="outline">{contest.type}</Badge>
								</div>

								<div>
									<h2 class="text-2xl font-bold">{contest.title}</h2>
									<p class="mt-1 text-muted-foreground">{contest.description}</p>
								</div>

								<div class="flex flex-wrap gap-6 text-sm">
									{#if contest.status === 'active'}
										<div class="flex items-center gap-2 font-semibold text-red-500">
											<Clock class="h-4 w-4" /> 종료까지: {contest.timeLeft}
										</div>
									{:else}
										<div class="flex items-center gap-2 text-muted-foreground">
											<Calendar class="h-4 w-4" /> 시작: {contest.startTime}
										</div>
									{/if}
									<div class="flex items-center gap-2 text-muted-foreground">
										<Users class="h-4 w-4" />
										{contest.participants}명 참여 중
									</div>
								</div>
							</div>

							<div class="flex min-w-[150px] flex-col gap-2">
								{#if contest.status === 'active'}
									<Button class="w-full">대회 입장</Button>
								{:else if contest.status === 'upcoming'}
									<Button class="w-full">참가 신청</Button>
								{:else}
									<Button variant="outline" class="w-full">순위표 보기</Button>
								{/if}
								<Button variant="ghost" class="w-full">상세 정보</Button>
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	</div>
</div>
