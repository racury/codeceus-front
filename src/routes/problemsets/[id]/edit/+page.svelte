<script lang="ts">
	import { enhance } from '$app/forms';
	import * as Card from '$lib/components/ui/card';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import * as Select from '$lib/components/ui/select';
	import { ChevronLeft, Info, FileText, Layers, AlertCircle, Trash2, Plus } from '@lucide/svelte';
	import { getTier } from '$lib/utils';

	let { data, form } = $props();

	let isSubmitting = $state(false);
	let activeTab = $state('problems');
	const problemset = $derived(data.problemset);
	const allProblems = $derived(data.allProblems);

	let selectedProblemId = $state<string>('');

	let showDeleteConfirm = $state(false);
</script>

<div class="container mx-auto max-w-5xl px-4 py-10">
	<div class="mb-8 flex items-center justify-between">
		<div class="flex items-center gap-4">
			<Button variant="ghost" size="icon" href={`/problemsets/${problemset.id}`}>
				<ChevronLeft class="h-4 w-4" />
			</Button>
			<div>
				<h1 class="text-3xl font-bold tracking-tight">문제집 수정하기</h1>
				<p class="text-muted-foreground">ID: {problemset.id} - {problemset.title}</p>
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
					<Trash2 class="h-4 w-4" /> 문제집 삭제
				</Button>
			{:else}
				<div
					class="flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/10 p-1"
				>
					<span class="px-2 text-xs font-bold text-destructive">정말 삭제할까요?</span>
					<form method="POST" action="/problemsets/{problemset.id}/edit?/deleteProblemset" use:enhance>
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
			<Tabs.Trigger value="problems">포함된 문제 관리</Tabs.Trigger>
			<Tabs.Trigger value="basic">기본 정보 수정</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="problems" class="space-y-8">
			<!-- Add new problem -->
			<Card.Root>
				<Card.Header>
					<Card.Title>문제 추가하기</Card.Title>
					<Card.Description>이 문제집에 추가할 문제를 선택하세요.</Card.Description>
				</Card.Header>
				<Card.Content>
					<form
						method="POST"
						action="?/addProblem"
						use:enhance={() => {
							isSubmitting = true;
							return async ({ update }) => {
								await update({ reset: false }); // preserve selected ID if fail
								isSubmitting = false;
							};
						}}
						class="flex items-end gap-4"
					>
						<div class="grid w-full max-w-sm gap-2">
							<Label for="problemId">문제 선택</Label>
							<Select.Root type="single" name="problemId" bind:value={selectedProblemId}>
								<Select.Trigger class="w-full">
									{#if selectedProblemId}
										{allProblems.find((p) => p.id.toString() === selectedProblemId)?.title ||
											'선택된 문제 없음'}
									{:else}
										문제를 선택하세요
									{/if}
								</Select.Trigger>
								<Select.Content class="max-h-80">
									{#each allProblems as p}
										<Select.Item value={p.id.toString()} label={`${p.id}. ${p.title}`}>
											<span class="mr-2 inline-block w-6 text-muted-foreground">{p.id}</span>
											{p.title}
										</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</div>
						<Button type="submit" class="gap-2" disabled={!selectedProblemId || isSubmitting}>
							<Plus class="h-4 w-4" /> 추가
						</Button>
					</form>
				</Card.Content>
			</Card.Root>

			<!-- List of problems -->
			<Card.Root>
				<Card.Header>
					<div class="flex items-center justify-between">
						<Card.Title>등록된 문제 목록</Card.Title>
						<span class="text-sm text-muted-foreground">총 {problemset.problems.length}문제</span>
					</div>
				</Card.Header>
				<Card.Content>
					{#if problemset.problems.length === 0}
						<div class="rounded-lg border-2 border-dashed py-12 text-center text-muted-foreground">
							아직 이 문제집에 등록된 문제가 없습니다. 위에서 문제를 추가해주세요.
						</div>
					{:else}
						<div class="divide-y rounded-md border">
							{#each problemset.problems as pp, i}
								<div class="flex items-center justify-between p-4 hover:bg-muted/50">
									<div class="flex items-center gap-4">
										<span class="w-6 text-lg font-bold text-muted-foreground">{i + 1}</span>
										<div>
											<a
												href={`/problems/${pp.problem.id}`}
												target="_blank"
												class="font-bold hover:underline"
											>
												{pp.problem.title}
											</a>
											<div class="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
												<span>문제 ID: {pp.problem.id}</span>
												<span>•</span>
												<span class="font-medium text-primary">
													{getTier(pp.problem.difficultyRating).name}
													{pp.problem.difficultyRating ?? ''}
												</span>
											</div>
										</div>
									</div>
									<form method="POST" action="?/removeProblem" use:enhance>
										<input type="hidden" name="problemId" value={pp.problemId} />
										<Button
											type="submit"
											variant="ghost"
											size="icon"
											class="text-muted-foreground hover:text-destructive"
										>
											<Trash2 class="h-4 w-4" />
										</Button>
									</form>
								</div>
							{/each}
						</div>
					{/if}
				</Card.Content>
			</Card.Root>
		</Tabs.Content>

		<Tabs.Content value="basic">
			<form
				method="POST"
				action="?/updateBasicInfo"
				use:enhance={() => {
					isSubmitting = true;
					return async ({ update }) => {
						await update();
						isSubmitting = false;
					};
				}}
			>
				<Card.Root>
					<Card.Header>
						<div class="flex items-center gap-2 text-primary">
							<FileText class="h-5 w-5" />
							<Card.Title>기본 정보</Card.Title>
						</div>
					</Card.Header>
					<Card.Content class="space-y-6">
						<div class="space-y-2">
							<Label for="title">문제집 제목</Label>
							<Input id="title" name="title" defaultValue={problemset.title} required />
						</div>
						<div class="space-y-2">
							<Label for="description">문제집 설명</Label>
							<Textarea
								id="description"
								name="description"
								defaultValue={problemset.description || ''}
								class="min-h-[200px]"
							/>
						</div>
					</Card.Content>
					<Card.Footer class="border-t pt-6">
						<Button type="submit" class="w-full px-8 sm:w-auto" disabled={isSubmitting}>
							{isSubmitting ? '저장 중...' : '기본 정보 저장'}
						</Button>
					</Card.Footer>
				</Card.Root>
			</form>
		</Tabs.Content>
	</Tabs.Root>
</div>
