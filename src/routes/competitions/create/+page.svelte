<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Badge } from '$lib/components/ui/badge';
	import { ChevronLeft, Save, Trophy, Calendar, ListTodo, Search, X, Plus } from '@lucide/svelte';

	let { data, form } = $props();
	let isSubmitting = $state(false);

	// Problem search and selection state
	let searchQuery = $state('');
	let selectedIds = $state<number[]>([]);

	const filteredProblems = $derived(
		data.allProblems.filter(
			(p) =>
				!selectedIds.includes(p.id) &&
				(p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
					p.id.toString().includes(searchQuery))
		)
	);

	const selectedProblems = $derived(data.allProblems.filter((p) => selectedIds.includes(p.id)));

	function toggleProblem(id: number) {
		if (selectedIds.includes(id)) {
			selectedIds = selectedIds.filter((i) => i !== id);
		} else {
			selectedIds = [...selectedIds, id];
		}
	}
</script>

<div class="container mx-auto max-w-4xl px-4 py-10">
	<div class="mb-8">
		<Button variant="ghost" size="sm" class="mb-4 -ml-2 w-fit" href="/competitions">
			<ChevronLeft class="mr-1 h-4 w-4" /> 대회 목록으로
		</Button>
		<h1 class="text-3xl font-extrabold tracking-tight">새 대회 만들기</h1>
		<p class="mt-2 text-muted-foreground">대회 일정과 포함될 문제들을 설정하세요.</p>
	</div>

	<form
		method="POST"
		use:enhance={() => {
			isSubmitting = true;
			return async ({ update }) => {
				await update();
				isSubmitting = false;
			};
		}}
		class="grid gap-8 lg:grid-cols-3"
	>
		<div class="space-y-8 lg:col-span-2">
			<Card.Root>
				<Card.Header>
					<div class="flex items-center gap-2 text-primary">
						<Trophy class="h-5 w-5" />
						<Card.Title>대회 정보</Card.Title>
					</div>
				</Card.Header>
				<Card.Content class="space-y-6">
					{#if form?.message}
						<p class="text-sm font-medium text-destructive">{form.message}</p>
					{/if}

					<div class="space-y-2">
						<Label for="title">대회 제목</Label>
						<Input id="title" name="title" placeholder="예: 2024 제1회 라큐리 컵" required />
					</div>

					<div class="space-y-2">
						<Label for="description">설명</Label>
						<Textarea
							id="description"
							name="description"
							placeholder="대회에 대한 상세 설명을 입력하세요."
							class="min-h-[150px]"
						/>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-2 text-primary">
							<ListTodo class="h-5 w-5" />
							<Card.Title>문제 선택</Card.Title>
						</div>
						<Badge variant="secondary">선택됨: {selectedIds.length}개</Badge>
					</div>
					<Card.Description>대회에서 풀이할 문제들을 검색하고 선택하세요.</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-6">
					<!-- Search Bar -->
					<div class="relative">
						<Search
							class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
						/>
						<Input
							placeholder="문제 제목 또는 ID로 검색..."
							class="pl-10"
							bind:value={searchQuery}
						/>
					</div>

					<!-- Selected Problems area -->
					{#if selectedProblems.length > 0}
						<div class="space-y-2">
							<Label class="text-xs font-bold tracking-wider text-primary uppercase"
								>선택된 문제</Label
							>
							<div class="flex flex-wrap gap-2 rounded-lg border bg-primary/5 p-3">
								{#each selectedProblems as p}
									<input type="hidden" name="problems" value={p.id} />
									<Badge variant="default" class="flex items-center gap-1 py-1 pr-1 pl-2">
										<span class="font-mono text-[10px] opacity-70">#{p.id}</span>
										{p.title}
										<button
											type="button"
											onclick={() => toggleProblem(p.id)}
											class="rounded-full p-0.5 transition-colors hover:bg-primary-foreground/20"
										>
											<X class="h-3 w-3" />
										</button>
									</Badge>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Scrollable Problem List -->
					<div class="space-y-2">
						<Label class="text-xs font-bold tracking-wider text-muted-foreground uppercase"
							>검색 결과</Label
						>
						<div
							class="grid max-h-[350px] grid-cols-1 gap-2 overflow-y-auto rounded-md border bg-muted/20 p-1"
						>
							{#each filteredProblems as problem}
								<button
									type="button"
									onclick={() => toggleProblem(problem.id)}
									class="group flex items-center justify-between rounded-md border bg-background p-3 text-left shadow-sm transition-colors hover:bg-muted"
								>
									<div class="flex items-center gap-3">
										<div
											class="flex h-8 w-8 items-center justify-center rounded bg-muted font-mono text-xs text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary"
										>
											{problem.id}
										</div>
										<div class="flex flex-col">
											<span class="text-sm leading-tight font-bold">{problem.title}</span>
											<span class="mt-0.5 text-[10px] text-muted-foreground"
												>Rating: {problem.difficultyRating ?? 'Unrated'}</span
											>
										</div>
									</div>
									<Plus
										class="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary"
									/>
								</button>
							{/each}

							{#if filteredProblems.length === 0 && searchQuery}
								<div class="p-8 text-center text-sm text-muted-foreground">
									검색 결과가 없습니다.
								</div>
							{/if}
							{#if data.allProblems.length === 0}
								<div class="p-8 text-center text-sm text-muted-foreground">
									등록된 문제가 없습니다. 먼저 문제를 생성해주세요.
								</div>
							{/if}
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		</div>

		<div class="space-y-8">
			<Card.Root>
				<Card.Header>
					<div class="flex items-center gap-2 text-primary">
						<Calendar class="h-5 w-5" />
						<Card.Title>대회 일정</Card.Title>
					</div>
				</Card.Header>
				<Card.Content class="space-y-6">
					<div class="space-y-2">
						<Label for="startTime">시작 시간</Label>
						<Input id="startTime" name="startTime" type="datetime-local" required />
					</div>
					<div class="space-y-2">
						<Label for="endTime">종료 시간</Label>
						<Input id="endTime" name="endTime" type="datetime-local" required />
					</div>
				</Card.Content>
			</Card.Root>

			<Button type="submit" class="h-12 w-full text-lg font-bold" disabled={isSubmitting}>
				{isSubmitting ? '생성 중...' : '대회 생성하기'}
			</Button>
		</div>
	</form>
</div>
