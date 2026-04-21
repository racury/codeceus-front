<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';
	import { Input } from '$lib/components/ui/input';
	import { Button } from '$lib/components/ui/button';
	import { Slider } from '$lib/components/ui/slider';
	import * as Select from '$lib/components/ui/select';
	import { Search, Filter, Circle, ArrowUpDown, Tag, Plus } from '@lucide/svelte';
	import { slide } from 'svelte/transition';

	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { untrack } from 'svelte';

	import { getTier, cn, TIERS } from '$lib/utils';

	let { data } = $props();
	const problems = $derived(data.problems);
	const categories = $derived(data.categories);

	// States from URL
	let searchQuery = $state(page.url.searchParams.get('q') ?? '');
	let difficultyRange = $state([
		Number(page.url.searchParams.get('min') ?? 0),
		Number(page.url.searchParams.get('max') ?? 2500)
	]);

	// Sync state when URL changes externally
	$effect(() => {
		const min = Number(page.url.searchParams.get('min') ?? 0);
		const max = Number(page.url.searchParams.get('max') ?? 2500);
		untrack(() => {
			if (min !== difficultyRange[0] || max !== difficultyRange[1]) {
				difficultyRange = [min, max];
			}
		});
	});

	let selectedCategories = $state(
		page.url.searchParams.get('cats')?.split(',').filter(Boolean).map(Number) ?? []
	);
	let sortOrder = $state(page.url.searchParams.get('sort') ?? 'id-asc');

	let isFilterOpen = $state(false);
	let showOnlyMyProblems = $state(page.url.searchParams.get('mine') === 'true');

	const user = $derived(data.user);

	// Sync with URL
	$effect(() => {
		const q = searchQuery;
		const cats = selectedCategories.join(',');
		const sort = sortOrder;
		const mine = showOnlyMyProblems;

		untrack(() => {
			const url = new URL(window.location.href);

			if (q) url.searchParams.set('q', q);
			else url.searchParams.delete('q');

			if (cats) url.searchParams.set('cats', cats);
			else url.searchParams.delete('cats');

			if (sort !== 'id-asc') url.searchParams.set('sort', sort);
			else url.searchParams.delete('sort');

			if (mine) url.searchParams.set('mine', 'true');
			else url.searchParams.delete('mine');

			if (url.toString() !== window.location.href) {
				window.history.replaceState({}, '', url);
			}
		});
	});

	// Derived filtered and sorted problems
	const filteredProblems = $derived(
		problems
			.filter((p) => {
				const matchesSearch =
					p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
					p.id.toString().includes(searchQuery);

				// 난이도 필터: 언레이티드(null)는 슬라이더가 최소값(0)을 포함할 때만 보여줌
				const rating = p.difficultyRating;
				let matchesDifficulty = false;
				if (rating === null) {
					matchesDifficulty = difficultyRange[0] === 0;
				} else {
					matchesDifficulty = rating >= difficultyRange[0] && rating <= difficultyRange[1];
				}

				const problemCatIds = p.categories.map((c) => c.categoryId);
				const matchesCategory =
					selectedCategories.length === 0 ||
					selectedCategories.some((catId) => problemCatIds.includes(catId));

				const matchesMyProblem = !showOnlyMyProblems || (user && p.createdById === user.id);

				return matchesSearch && matchesDifficulty && matchesCategory && matchesMyProblem;
			})
			.sort((a, b) => {
				const [field, direction] = sortOrder.split('-');
				const multiplier = direction === 'asc' ? 1 : -1;

				if (field === 'id') return (a.id - b.id) * multiplier;
				if (field === 'difficulty') {
					const valA = a.difficultyRating ?? -1;
					const valB = b.difficultyRating ?? -1;
					return (valA - valB) * multiplier;
				}
				if (field === 'title') return a.title.localeCompare(b.title) * multiplier;
				return 0;
			})
	);

	function toggleCategory(id: number) {
		if (selectedCategories.includes(id)) {
			selectedCategories = selectedCategories.filter((c) => c !== id);
		} else {
			selectedCategories = [...selectedCategories, id];
		}
	}
</script>

<div class="container mx-auto px-4 py-10">
	<div class="flex flex-col gap-8">
		<div class="flex flex-col gap-4">
			<div class="flex flex-col justify-between gap-4 md:flex-row md:items-center">
				<div>
					<h1 class="text-3xl font-bold tracking-tight text-foreground">문제</h1>
					<p class="mt-1 text-muted-foreground">나에게 맞는 문제를 찾아 해결해보세요.</p>
				</div>
				<div class="flex items-center gap-2">
					<Button href="/problems/create" variant="default" class="h-9 gap-2">
						<Plus class="h-4 w-4" />
						문제 만들기
					</Button>
					<div class="relative w-full md:w-64">
						<Search class="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="문제 제목 또는 ID 검색..."
							class="h-9 pl-9"
							bind:value={searchQuery}
						/>
					</div>
					<Button
						variant={isFilterOpen ? 'default' : 'outline'}
						size="icon"
						onclick={() => (isFilterOpen = !isFilterOpen)}
						class="relative"
					>
						<Filter class="h-4 w-4" />
						{#if difficultyRange[0] > 0 || difficultyRange[1] < 2500 || selectedCategories.length > 0}
							<span
								class="absolute -top-1 -right-1 flex h-3 w-3 rounded-full bg-primary ring-2 ring-background"
							></span>
						{/if}
					</Button>
				</div>
			</div>

			{#if isFilterOpen}
				<div transition:slide class="rounded-lg border bg-muted/30 p-6">
					<div class="grid gap-8 lg:grid-cols-2">
						<!-- Difficulty Slider -->
						<div class="space-y-4">
							<div class="flex items-center justify-between">
								<span class="text-sm font-medium">난이도 범위 (Rating)</span>
								<span class="rounded border bg-background px-2 py-1 font-mono text-sm">
									{difficultyRange[0]} - {difficultyRange[1]}
								</span>
							</div>
							<div class="px-2 py-4">
								<Slider
									value={difficultyRange}
									onValueChange={(v) => {
										difficultyRange = v;
									}}
									onValueCommit={(v) => {
										const url = new URL(window.location.href);
										if (v[0] > 0) url.searchParams.set('min', v[0].toString());
										else url.searchParams.delete('min');
										if (v[1] < 2500) url.searchParams.set('max', v[1].toString());
										else url.searchParams.delete('max');
										window.history.replaceState({}, '', url);
									}}
									min={0}
									max={2500}
									step={50}
								/>
							</div>
							<div class="flex justify-between px-1 text-[10px] text-muted-foreground">
								{#each TIERS as tier}
									<div class="flex flex-col items-center gap-1">
										<div class={cn('h-1.5 w-1.5 rounded-full', tier.color.split(' ')[0])}></div>
										<span>{tier.name}</span>
									</div>
								{/each}
							</div>
						</div>

						<!-- Category Selection -->
						<div class="space-y-4">
							<span class="flex items-center gap-2 text-sm font-medium">
								<Tag class="h-4 w-4" /> 카테고리 (OR 필터)
							</span>
							<div class="flex flex-wrap gap-2">
								{#each categories as cat}
									<Button
										variant={selectedCategories.includes(cat.id) ? 'default' : 'outline'}
										size="sm"
										class="h-7 px-2 text-xs"
										onclick={() => toggleCategory(cat.id)}
									>
										{cat.name}
									</Button>
								{/each}
							</div>
						</div>
					</div>

					<div class="mt-6 flex flex-wrap items-center justify-between gap-4 border-t pt-6">
						<div class="flex items-center gap-6">
							<div class="flex items-center gap-4">
								<span class="text-sm font-medium">정렬 기준:</span>
								<Select.Root type="single" bind:value={sortOrder}>
									<Select.Trigger class="h-9 w-[180px]">
										{#if sortOrder === 'id-asc'}ID (오름차순){:else if sortOrder === 'id-desc'}ID
											(내림차순){:else if sortOrder === 'difficulty-asc'}난이도 (낮은 순){:else if sortOrder === 'difficulty-desc'}난이도
											(높은 순){:else if sortOrder === 'title-asc'}제목 (가나다순){:else if sortOrder === 'title-desc'}제목
											(역순){/if}
									</Select.Trigger>
									<Select.Content>
										<Select.Item value="id-asc">ID (오름차순)</Select.Item>
										<Select.Item value="id-desc">ID (내림차순)</Select.Item>
										<Select.Item value="difficulty-asc">난이도 (낮은 순)</Select.Item>
										<Select.Item value="difficulty-desc">난이도 (높은 순)</Select.Item>
										<Select.Item value="title-asc">제목 (가나다순)</Select.Item>
										<Select.Item value="title-desc">제목 (역순)</Select.Item>
									</Select.Content>
								</Select.Root>
							</div>

							{#if user}
								<label class="group flex cursor-pointer items-center gap-2 py-2">
									<input
										type="checkbox"
										bind:checked={showOnlyMyProblems}
										class="h-4 w-4 rounded border-input text-primary transition-colors focus:ring-primary"
									/>
									<span
										class="text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground"
										>내가 만든 문제만 보기</span
									>
								</label>
							{/if}
						</div>

						<Button
							variant="ghost"
							size="sm"
							onclick={() => {
								difficultyRange = [0, 2500];
								selectedCategories = [];
								sortOrder = 'id-asc';
							}}
							class="text-xs text-muted-foreground hover:text-primary"
						>
							모든 필터 초기화
						</Button>
					</div>
				</div>
			{/if}
		</div>

		<div class="rounded-lg border bg-card">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head class="w-20">상태</Table.Head>
						<Table.Head class="w-24">ID</Table.Head>
						<Table.Head>제목</Table.Head>
						<Table.Head>난이도</Table.Head>
						<Table.Head class="text-right">카테고리</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each filteredProblems as problem}
						<Table.Row
							class="cursor-pointer transition-colors hover:bg-muted/50"
							onclick={() => goto(`/problems/${problem.id}`)}
						>
							<Table.Cell>
								<Circle class="h-5 w-5 text-muted-foreground/30" />
							</Table.Cell>
							<Table.Cell class="font-mono text-muted-foreground">{problem.id}</Table.Cell>
							<Table.Cell>
								{problem.title}
							</Table.Cell>
							<Table.Cell>
								{@const tier = getTier(problem.difficultyRating)}
								<Badge variant="outline" class={cn('font-semibold shadow-sm', tier.color)}>
									{tier.name}
									{problem.difficultyRating ?? ''}
								</Badge>
							</Table.Cell>
							<Table.Cell class="text-right">
								<div class="flex flex-wrap justify-end gap-1">
									{#each problem.categories as pc}
										<Badge variant="secondary" class="h-5 bg-muted/50 px-1 text-[10px]">
											{pc.category.name}
										</Badge>
									{/each}
								</div>
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
			{#if filteredProblems.length === 0}
				<div class="p-12 text-center text-muted-foreground">검색 조건에 맞는 문제가 없습니다.</div>
			{/if}
		</div>
	</div>
</div>
