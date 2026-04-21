<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Trophy, Calendar, Users, Timer, ChevronLeft, Lock, ArrowRight } from '@lucide/svelte';
	import { getTier, cn } from '$lib/utils';

	let { data, form } = $props();
	const competition = $derived(data.competition);
	const isParticipant = $derived(data.isParticipant);
	const user = $derived(data.user);

	let now = $state(new Date());
	$effect(() => {
		const interval = setInterval(() => {
			now = new Date();
		}, 1000);
		return () => clearInterval(interval);
	});

	const startTime = $derived(new Date(competition.startTime));
	const endTime = $derived(new Date(competition.endTime));

	const status = $derived.by(() => {
		if (now < startTime) return 'UPCOMING';
		if (now > endTime) return 'FINISHED';
		return 'ONGOING';
	});

	const canAccessProblems = $derived(status === 'ONGOING' || status === 'FINISHED');

	function formatTimeLeft(target: Date) {
		const diff = target.getTime() - now.getTime();
		if (diff <= 0) return '00:00:00';

		const h = Math.floor(diff / (1000 * 60 * 60));
		const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
		const s = Math.floor((diff % (1000 * 60)) / 1000);

		return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
	}
</script>

<div class="container mx-auto max-w-5xl px-4 py-8">
	<Button variant="ghost" size="sm" class="mb-6 -ml-2" href="/competitions">
		<ChevronLeft class="mr-1 h-4 w-4" /> 대회 목록으로
	</Button>

	<div class="grid gap-8 lg:grid-cols-3">
		<div class="space-y-8 lg:col-span-2">
			<div>
				<div class="mb-4 flex items-center gap-3">
					{#if status === 'UPCOMING'}
						<Badge class="bg-blue-500 hover:bg-blue-600">예정됨</Badge>
					{:else if status === 'ONGOING'}
						<Badge class="animate-pulse bg-green-500 hover:bg-green-600">진행 중</Badge>
					{:else}
						<Badge variant="secondary">종료됨</Badge>
					{/if}
					<span class="flex items-center gap-1 text-sm text-muted-foreground">
						<Users class="h-3.5 w-3.5" />
						{competition.participants.length}명 참가
					</span>
				</div>
				<h1 class="mb-4 text-4xl font-extrabold tracking-tight">{competition.title}</h1>
				<div class="prose prose-slate dark:prose-invert max-w-none">
					<p class="leading-relaxed whitespace-pre-wrap text-muted-foreground">
						{competition.description || '상세 설명이 없습니다.'}
					</p>
				</div>
			</div>

			<div class="space-y-4">
				<h2 class="flex items-center gap-2 text-2xl font-bold">
					<Trophy class="h-6 w-6 text-primary" /> 문제 목록
				</h2>

				{#if !canAccessProblems}
					<Card.Root class="border-dashed bg-muted/30">
						<Card.Content class="flex flex-col items-center p-12 text-center">
							<Lock class="mb-4 h-10 w-10 text-muted-foreground/30" />
							<h3 class="text-lg font-semibold">대회가 시작되면 문제가 공개됩니다.</h3>
							<p class="mt-1 text-sm text-muted-foreground">
								시작까지 {formatTimeLeft(startTime)} 남았습니다.
							</p>
						</Card.Content>
					</Card.Root>
				{:else}
					<div class="grid gap-3">
						{#each competition.problems as cp, i}
							{@const p = cp.problem}
							<a href={`/problems/${p.id}`} class="group">
								<Card.Root class="transition-all hover:border-primary/50 hover:bg-muted/30">
									<Card.Content class="flex items-center justify-between p-4">
										<div class="flex items-center gap-4">
											<div class="w-8 text-center text-xl font-black text-muted-foreground/20">
												{String.fromCharCode(65 + i)}
											</div>
											<div>
												<h3 class="font-bold group-hover:underline">{p.title}</h3>
												<div class="mt-1 flex items-center gap-2">
													<Badge variant="outline" class="h-4 py-0 text-[10px]"
														>Rating {p.difficultyRating ?? '?'}</Badge
													>
												</div>
											</div>
										</div>
										<ArrowRight
											class="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary"
										/>
									</Card.Content>
								</Card.Root>
							</a>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<div class="space-y-6">
			<Card.Root>
				<Card.Header>
					<Card.Title class="text-lg">대회 정보</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-4">
					<div class="space-y-1">
						<span class="text-xs font-medium text-muted-foreground uppercase">남은 시간</span>
						<div class="font-mono text-3xl font-bold tracking-tighter text-primary">
							{#if status === 'UPCOMING'}
								{formatTimeLeft(startTime)}
							{:else if status === 'ONGOING'}
								{formatTimeLeft(endTime)}
							{:else}
								00:00:00
							{/if}
						</div>
					</div>

					<div class="space-y-3 border-t pt-4">
						<div class="flex items-center justify-between text-sm">
							<span class="text-muted-foreground">시작</span>
							<span class="font-medium">{startTime.toLocaleString()}</span>
						</div>
						<div class="flex items-center justify-between text-sm">
							<span class="text-muted-foreground">종료</span>
							<span class="font-medium">{endTime.toLocaleString()}</span>
						</div>
						<div class="flex items-center justify-between text-sm">
							<span class="text-muted-foreground">작성자</span>
							<span class="font-medium text-primary">{competition.createdBy.name}</span>
						</div>
					</div>
				</Card.Content>
				<Card.Footer class="border-t bg-muted/20 p-6">
					{#if !user}
						<Button href="/signin" class="w-full">로그인 후 참가 가능</Button>
					{:else if isParticipant}
						<div class="w-full text-center">
							<Badge
								variant="outline"
								class="w-full justify-center gap-2 border-primary/50 py-2 font-bold text-primary"
							>
								<Trophy class="h-4 w-4" /> 참가 중인 대회입니다
							</Badge>
						</div>
					{:else if status === 'FINISHED'}
						<Button variant="outline" class="w-full" disabled>종료된 대회</Button>
					{:else}
						<form method="POST" action="?/join" use:enhance class="w-full">
							<Button type="submit" class="h-12 w-full text-lg font-bold">대회 참가 신청</Button>
						</form>
					{/if}
				</Card.Footer>
			</Card.Root>

			{#if status === 'ONGOING'}
				<div
					class="flex items-center gap-2 rounded-lg border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-600 dark:text-green-400"
				>
					<Timer class="h-4 w-4" />
					지금 대회가 진행 중입니다! 문제를 풀어 점수를 획득하세요.
				</div>
			{/if}
		</div>
	</div>
</div>
