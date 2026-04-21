<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Trophy, Calendar, Users, Plus, Timer } from '@lucide/svelte';
	import { cn } from '$lib/utils';

	let { data } = $props();

	function getStatus(start: Date, end: Date) {
		const now = new Date();
		if (now < start)
			return { label: '예정됨', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' };
		if (now > end)
			return {
				label: '종료됨',
				color: 'bg-muted text-muted-foreground border-muted-foreground/20'
			};
		return { label: '진행 중', color: 'bg-green-500/10 text-green-500 border-green-500/20' };
	}
</script>

<div class="container mx-auto max-w-5xl px-4 py-8">
	<div class="mb-8 flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-extrabold tracking-tight">대회</h1>
			<p class="mt-2 text-muted-foreground">정해진 시간 동안 실력을 겨뤄보세요.</p>
		</div>
		{#if data.user?.role === 'admin'}
			<Button href="/competitions/create" class="gap-2">
				<Plus class="h-4 w-4" /> 새 대회 만들기
			</Button>
		{/if}
	</div>

	<div class="grid gap-6">
		{#each data.competitions as comp}
			{@const status = getStatus(new Date(comp.startTime), new Date(comp.endTime))}
			<Card.Root class="overflow-hidden transition-all hover:border-primary/30">
				<div class="flex flex-col md:flex-row">
					<div class="flex-1 p-6">
						<div class="mb-4 flex items-center gap-3">
							<Badge variant="outline" class={cn('font-bold', status.color)}>
								{status.label}
							</Badge>
							<div class="flex items-center gap-1.5 text-xs text-muted-foreground">
								<Calendar class="h-3.5 w-3.5" />
								{new Date(comp.startTime).toLocaleString()} ~ {new Date(
									comp.endTime
								).toLocaleString()}
							</div>
						</div>

						<Card.Title class="mb-2 text-2xl">
							<a href={`/competitions/${comp.id}`} class="hover:underline">
								{comp.title}
							</a>
						</Card.Title>
						<Card.Description class="line-clamp-2 text-sm leading-relaxed">
							{comp.description || '대회 설명이 없습니다.'}
						</Card.Description>

						<div class="mt-6 flex flex-wrap items-center gap-6">
							<div class="flex items-center gap-2 text-sm">
								<Users class="h-4 w-4 text-muted-foreground" />
								<span class="font-medium">{comp.participants.length}명 참여 중</span>
							</div>
							<div class="flex items-center gap-2 text-sm">
								<Trophy class="h-4 w-4 text-muted-foreground" />
								<span class="font-medium">{comp.problems.length}문제</span>
							</div>
							<div class="flex items-center gap-2 text-sm">
								<span class="text-xs text-muted-foreground">작성자: {comp.createdBy.name}</span>
							</div>
						</div>
					</div>
					<div
						class="flex min-w-[200px] flex-col items-center justify-center gap-3 border-t bg-muted/30 p-6 md:border-t-0 md:border-l"
					>
						<Button href={`/competitions/${comp.id}`} class="w-full font-bold">상세 보기</Button>
						{#if status.label === '진행 중'}
							<p class="flex items-center gap-1 text-[10px] text-muted-foreground">
								<Timer class="h-3 w-3" /> 지금 바로 참여 가능
							</p>
						{/if}
					</div>
				</div>
			</Card.Root>
		{/each}

		{#if data.competitions.length === 0}
			<div
				class="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/20 p-20 text-center"
			>
				<Trophy class="mb-4 h-12 w-12 text-muted-foreground/30" />
				<h3 class="text-xl font-bold">진행 예정인 대회가 없습니다.</h3>
				<p class="mt-2 text-muted-foreground">새로운 대회가 열릴 때까지 연습 문제를 풀어보세요!</p>
				<Button variant="outline" href="/problems" class="mt-6">문제 풀러 가기</Button>
			</div>
		{/if}
	</div>
</div>
