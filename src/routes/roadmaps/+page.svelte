<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Plus, Map } from '@lucide/svelte';

	let { data } = $props();
</script>

<div class="container mx-auto max-w-5xl px-4 py-8">
	<div class="mb-8 flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-extrabold tracking-tight">로드맵</h1>
			<p class="mt-2 text-muted-foreground">
				단계별로 문제집을 해결하며 성장하는 경로를 탐색해보세요.
			</p>
		</div>
		{#if data.user}
			<Button href="/roadmaps/create" class="gap-2">
				<Plus class="h-4 w-4" /> 새 로드맵 만들기
			</Button>
		{/if}
	</div>

	<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		{#each data.roadmaps as roadmap}
			<Card.Root class="flex h-full flex-col transition-colors hover:bg-muted/50">
				<Card.Header>
					<div class="mb-2 flex items-center justify-between">
						<Badge variant="outline" class="font-normal text-muted-foreground">
							노드 {roadmap.nodes.length}개
						</Badge>
					</div>
					<Card.Title class="line-clamp-2 leading-tight">
						<a href={`/roadmaps/${roadmap.id}`} class="hover:underline">
							{roadmap.title}
						</a>
					</Card.Title>
					<Card.Description class="mt-2 line-clamp-2">
						{roadmap.description || '설명이 없습니다.'}
					</Card.Description>
				</Card.Header>
				<Card.Footer class="mt-auto border-t pt-4 text-sm text-muted-foreground">
					<div class="flex items-center gap-2">
						<span class="font-medium text-primary">{roadmap.createdBy.name}</span>
						<span>•</span>
						<span>{new Date(roadmap.createdAt).toLocaleDateString()}</span>
					</div>
				</Card.Footer>
			</Card.Root>
		{/each}

		{#if data.roadmaps.length === 0}
			<div
				class="col-span-full flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center"
			>
				<Map class="mb-4 h-10 w-10 text-muted-foreground" />
				<h3 class="text-lg font-semibold">아직 만들어진 로드맵이 없습니다.</h3>
				<p class="mb-4 text-muted-foreground">첫 번째 로드맵을 만들어보세요!</p>
			</div>
		{/if}
	</div>
</div>
