<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { ChevronLeft, Pencil, BookOpen } from '@lucide/svelte';
	import { getTier } from '$lib/utils';

	let { data } = $props();

	const problemset = $derived(data.problemset);
	const user = $derived(data.user);

	const isAuthorized = $derived(
		user && (user.role === 'admin' || user.id === problemset.createdById)
	);
</script>

<div class="container mx-auto max-w-5xl px-4 py-8">
	<div class="mb-8 flex flex-col gap-6">
		<Button variant="ghost" size="sm" class="-ml-2 w-fit" href="/problemsets">
			<ChevronLeft class="mr-1 h-4 w-4" /> 문제집 목록으로
		</Button>

		<div class="flex flex-wrap items-start justify-between gap-4">
			<div>
				<h1 class="mb-2 text-4xl font-extrabold tracking-tight">{problemset.title}</h1>
				<div class="flex items-center gap-3 text-sm text-muted-foreground">
					<span
						>작성자: <span class="font-semibold text-primary">{problemset.createdBy.name}</span
						></span
					>
					<span>•</span>
					<span>생성일: {new Date(problemset.createdAt).toLocaleDateString()}</span>
					<span>•</span>
					<Badge variant="outline">문제 {problemset.problems.length}개</Badge>
				</div>
			</div>
			{#if isAuthorized}
				<Button variant="outline" href={`/problemsets/${problemset.id}/edit`} class="gap-2">
					<Pencil class="h-4 w-4" /> 문제집 편집
				</Button>
			{/if}
		</div>

		{#if problemset.description}
			<Card.Root class="border-none bg-muted/30 shadow-none">
				<Card.Content class="p-6">
					<p class="whitespace-pre-wrap">{problemset.description}</p>
				</Card.Content>
			</Card.Root>
		{/if}
	</div>

	<div class="space-y-4">
		<h2 class="mb-6 text-2xl font-bold">문제 목록</h2>

		{#if problemset.problems.length === 0}
			<div
				class="flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-16 text-center"
			>
				<BookOpen class="mb-4 h-12 w-12 text-muted-foreground" />
				<h3 class="mb-2 text-lg font-semibold">아직 문제가 없습니다.</h3>
				<p class="text-muted-foreground">작성자가 아직 이 문제집에 문제를 추가하지 않았습니다.</p>
			</div>
		{:else}
			<div class="grid gap-3">
				{#each problemset.problems as pp, i}
					{@const p = pp.problem}
					<a href={`/problems/${p.id}`} class="group block">
						<Card.Root class="transition-colors hover:border-primary/50 hover:bg-muted/30">
							<Card.Content class="flex items-center justify-between gap-4 p-4 sm:p-2">
								<div class="flex min-w-0 items-center gap-4 sm:gap-6">
									<div
										class="w-8 shrink-0 text-center text-2xl font-extrabold text-muted-foreground/30"
									>
										{i + 1}
									</div>
									<div class="min-w-0">
										<h3 class="truncate text-lg font-bold group-hover:underline">{p.title}</h3>
										<div class="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
											<span>ID: {p.id}</span>
											<Badge variant="secondary" class="font-normal">
												{getTier(p.difficultyRating).name}
												{p.difficultyRating ?? ''}
											</Badge>
										</div>
									</div>
								</div>
								<Button
									variant="ghost"
									class="hidden shrink-0 group-hover:bg-primary group-hover:text-primary-foreground sm:flex"
								>
									풀어보기
								</Button>
							</Card.Content>
						</Card.Root>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</div>
