<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import * as Card from '$lib/components/ui/card';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Badge } from '$lib/components/ui/badge';
	import {
		ChevronLeft,
		Info,
		Settings2,
		FileText,
		Code2,
		Layers,
		AlertCircle,
		Trash2,
		Plus,
		Eye,
		EyeOff
	} from '@lucide/svelte';
	import { cn } from '$lib/utils';

	let { data, form } = $props();

	let isSubmitting = $state(false);
	let activeTab = $state('basic');
	const problem = $derived(data.problem);
	const user = $derived(data.user);
	const isAdmin = $derived(user?.role === 'admin');

	const currentCategoryIds = $derived(problem.categories.map((c) => c.categoryId));

	// Testcase state - sync with problem data when it changes
	let localTestcases = $state(problem.testcases.map(tc => ({ ...tc })) || []);

	// Reset local state when server data changes (e.g. after save)
	$effect(() => {
		localTestcases = problem.testcases.map(tc => ({ ...tc })) || [];
	});

	function addTestcase() {
		localTestcases = [...localTestcases, { input: "", output: "", isPublic: false }];
	}


	function removeTestcase(index: number) {
		localTestcases = localTestcases.filter((_, i) => i !== index);
	}

	$effect(() => {
		if (form?.success && activeTab !== 'testcases') {
			goto(`/problems/${problem.id}`);
		}
	});

	let showDeleteConfirm = $state(false);
</script>

<div class="container mx-auto max-w-5xl px-4 py-10">
	<div class="mb-8 flex items-center justify-between">
		<div class="flex items-center gap-4">
			<Button variant="ghost" size="icon" href={`/problems/${problem.id}`}>
				<ChevronLeft class="h-4 w-4" />
			</Button>
			<div>
				<h1 class="text-3xl font-bold tracking-tight">문제 수정하기</h1>
				<p class="text-muted-foreground">ID: {problem.id} - {problem.title}</p>
			</div>
		</div>
		<div class="flex items-center gap-2">
			{#if !showDeleteConfirm}
				<Button
					variant="destructive"
					size="sm"
					onclick={() => (showDeleteConfirm = true)}
					class="gap-2"
				>
					<Trash2 class="h-4 w-4" /> 문제 삭제
				</Button>
			{:else}
				<div
					class="flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/10 p-1"
				>
					<span class="px-2 text-xs font-bold text-destructive">정말 삭제할까요?</span>
					<form method="POST" action="/problems/{problem.id}/edit?/deleteProblem" use:enhance>
						<button 
							type="submit" 
							class="inline-flex items-center justify-center rounded-md bg-destructive px-3 py-1.5 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition-colors"
						>
							네, 삭제
						</button>
					</form>
					<Button variant="ghost" size="sm" onclick={() => (showDeleteConfirm = false)}>취소</Button
					>
				</div>
			{/if}
		</div>
	</div>

	{#if form?.message}
		<div
			class="mb-6 flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive"
		>
			<AlertCircle class="h-4 w-4" />
			{form.message}
		</div>
	{/if}

	<Tabs.Root bind:value={activeTab} class="space-y-8">
		<Tabs.List class="grid w-full max-w-md grid-cols-2">
			<Tabs.Trigger value="basic">기본 정보 및 설정</Tabs.Trigger>
			<Tabs.Trigger value="testcases">채점 테스트케이스</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="basic">
			<form
				method="POST"
				action="?/updateProblem"
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
								<FileText class="h-5 w-5" />
								<Card.Title>기본 정보</Card.Title>
							</div>
						</Card.Header>
						<Card.Content class="space-y-6">
							<div class="space-y-2">
								<Label for="title">문제 제목</Label>
								<Input id="title" name="title" defaultValue={problem.title} required />
							</div>
							<div class="space-y-2">
								<Label for="description">문제 설명</Label>
								<Textarea
									id="description"
									name="description"
									defaultValue={problem.description}
									class="min-h-[300px]"
									required
								/>
							</div>
						</Card.Content>
					</Card.Root>

					<Card.Root>
						<Card.Header>
							<div class="flex items-center gap-2 text-primary">
								<Info class="h-5 w-5" />
								<Card.Title>입출력 형식</Card.Title>
							</div>
						</Card.Header>
						<Card.Content class="space-y-6">
							<div class="space-y-2">
								<Label for="inputFormat">입력 형식</Label>
								<Textarea
									id="inputFormat"
									name="inputFormat"
									defaultValue={problem.inputFormat ?? ''}
								/>
							</div>
							<div class="space-y-2">
								<Label for="outputFormat">출력 형식</Label>
								<Textarea
									id="outputFormat"
									name="outputFormat"
									defaultValue={problem.outputFormat ?? ''}
								/>
							</div>
						</Card.Content>
					</Card.Root>

					<Card.Root>
						<Card.Header>
							<div class="flex items-center gap-2 text-primary">
								<Code2 class="h-5 w-5" />
								<Card.Title>힌트</Card.Title>
							</div>
						</Card.Header>
						<Card.Content class="space-y-6">
							<div class="space-y-2">
								<Label for="hint">힌트</Label>
								<Textarea id="hint" name="hint" defaultValue={problem.hint ?? ''} placeholder="문제를 푸는 데 도움이 될 힌트를 적어주세요." />
							</div>
						</Card.Content>
					</Card.Root>

				</div>

				<div class="space-y-8">
					<Card.Root>
						<Card.Header>
							<div class="flex items-center gap-2 text-primary">
								<Settings2 class="h-5 w-5" />
								<Card.Title>설정</Card.Title>
							</div>
						</Card.Header>
						<Card.Content class="space-y-6">
							<div class="space-y-2">
								<Label for="timeLimit">시간 제한</Label>
								<Input id="timeLimit" name="timeLimit" defaultValue={problem.timeLimit} />
							</div>
							<div class="space-y-2">
								<Label for="memoryLimit">메모리 제한</Label>
								<Input id="memoryLimit" name="memoryLimit" defaultValue={problem.memoryLimit} />
							</div>

							<div class="space-y-4 border-t pt-4">
								<div class="flex items-center justify-between">
									<Label for="difficultyRating">난이도 레이팅 (Rating)</Label>
									{#if !isAdmin}
										<Badge variant="outline">{problem.difficultyRating ?? '언레이티드'}</Badge>
									{/if}
								</div>
								{#if isAdmin}
									<Input
										id="difficultyRating"
										name="difficultyRating"
										type="number"
										placeholder="예: 1200"
										defaultValue={problem.difficultyRating ?? ''}
									/>
								{/if}
							</div>
						</Card.Content>
					</Card.Root>

					<Card.Root>
						<Card.Header>
							<div class="flex items-center gap-2 text-primary">
								<Layers class="h-5 w-5" />
								<Card.Title>카테고리</Card.Title>
							</div>
						</Card.Header>
						<Card.Content>
							<div class="grid grid-cols-2 gap-3">
								{#each data.allCategories as category}
									<label
										class="flex cursor-pointer items-center gap-2 rounded-md border border-transparent p-2 transition-colors hover:border-border hover:bg-muted"
									>
										<input
											type="checkbox"
											name="categories"
											value={category.id}
											checked={currentCategoryIds.includes(category.id)}
											class="h-4 w-4 rounded border-input text-primary focus:ring-primary"
										/>
										<span class="text-sm">{category.name}</span>
									</label>
								{/each}
							</div>
						</Card.Content>
					</Card.Root>

					<Button type="submit" class="h-12 w-full text-lg font-bold" disabled={isSubmitting}>
						{isSubmitting ? '저장 중...' : '문제 기본 정보 수정'}
					</Button>
				</div>
			</form>
		</Tabs.Content>

		<Tabs.Content value="testcases">
			<form
				method="POST"
				action="?/updateTestcases"
				use:enhance={() => {
					isSubmitting = true;
					return async ({ update }) => {
						await update();
						isSubmitting = false;
					};
				}}
				class="space-y-8"
			>
				<div class="flex items-center justify-between">
					<div>
						<h3 class="text-xl font-bold">채점용 테스트케이스</h3>
						<p class="text-sm text-muted-foreground">
							코드를 채점할 때 사용될 실제 입출력 데이터입니다.
						</p>
					</div>
					<Button type="button" variant="outline" onclick={addTestcase} class="gap-2">
						<Plus class="h-4 w-4" /> 테스트케이스 추가
					</Button>
				</div>

				<div class="grid gap-6">
					{#each localTestcases as tc, i}
						<Card.Root class={cn("relative transition-all border-2", tc.isPublic ? "border-primary/50 bg-primary/5" : "border-transparent")}>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								class="absolute top-2 right-2 h-8 w-8 text-muted-foreground hover:text-destructive"
								onclick={() => removeTestcase(i)}
							>
								<Trash2 class="h-4 w-4" />
							</Button>
							<Card.Header class="pb-2">
								<div class="flex items-center gap-4">
									<div class="flex items-center gap-2">
										<Badge variant={tc.isPublic ? "default" : "outline"}>
											{tc.isPublic ? "공개 예제" : `테스트케이스 #${i + 1}`}
										</Badge>
									</div>
									<label class="flex cursor-pointer items-center gap-2 group">
										<input
											type="checkbox"
											name={`testcaseIsPublic_${i}`}
											bind:checked={tc.isPublic}
											class="h-4 w-4 rounded border-input text-primary transition-all"
										/>
										<span class="text-xs font-bold group-hover:text-primary transition-colors">문제 페이지에 예제로 노출</span>
									</label>
								</div>
							</Card.Header>
							<Card.Content class="grid gap-4 pt-4 md:grid-cols-2">
								<div class="space-y-2">
									<Label class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Input</Label>
									<Textarea
										name="testcaseInput"
										bind:value={tc.input}
										class="h-32 bg-background font-mono text-sm focus:bg-background"
									/>
								</div>
								<div class="space-y-2">
									<Label class="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Output</Label>
									<Textarea
										name="testcaseOutput"
										bind:value={tc.output}
										class="h-32 bg-background font-mono text-sm focus:bg-background"
									/>
								</div>
							</Card.Content>
						</Card.Root>
					{/each}

					{#if localTestcases.length === 0}
						<div
							class="flex flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/20 p-20"
						>
							<Code2 class="mb-4 h-10 w-10 text-muted-foreground/30" />
							<p class="text-muted-foreground">아직 테스트케이스가 없습니다.</p>
							<Button type="button" variant="link" onclick={addTestcase}
								>첫 번째 테스트케이스 추가</Button
							>
						</div>
					{/if}
				</div>

				<div class="flex justify-end gap-4">
					<Button type="submit" class="h-12 px-10 text-lg font-bold" disabled={isSubmitting}>
						{isSubmitting ? '저장 중...' : '테스트케이스 저장'}
					</Button>
				</div>
			</form>
		</Tabs.Content>
	</Tabs.Root>
</div>
