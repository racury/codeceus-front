<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Select from '$lib/components/ui/select';
	import { Label } from '$lib/components/ui/label';
	import { Code2, Send, History, Info, ChevronLeft, Pencil } from '@lucide/svelte';

	import { getTier, cn } from '$lib/utils';

	let { data } = $props();
	const problem = $derived(data.problem);
	const user = $derived(data.user); // From locals in layout
	const tier = $derived(getTier(problem.difficultyRating));

	const isAuthorized = $derived(
		user && (user.role === 'admin' || user.id === problem.createdById)
	);

	const languages = [
		{ value: 'cpp', label: 'C++ 20' },
		{ value: 'python', label: 'Python 3.11' },
		{ value: 'java', label: 'Java 17' },
		{ value: 'rust', label: 'Rust 1.75' },
		{ value: 'svelte', label: 'Svelte 5 (놀랍게도!)' }
	];

	let selectedLanguage = $state('cpp');
	const selectedLanguageLabel = $derived(
		languages.find((l) => l.value === selectedLanguage)?.label ?? '언어 선택'
	);
</script>

<div class="container mx-auto px-4 py-8">
	<div class="flex flex-col gap-6">
		<!-- Header -->
		<div class="flex flex-col gap-4">
			<Button variant="ghost" size="sm" class="w-fit -ml-2" href="/problems">
				<ChevronLeft class="mr-1 h-4 w-4" /> 문제 목록으로 돌아가기
			</Button>
			<div class="flex flex-wrap items-center justify-between gap-4">
				<div class="flex items-center gap-4">
					<h1 class="text-4xl font-extrabold tracking-tight">{problem.id}. {problem.title}</h1>
					<Badge
						variant="outline"
						class={cn("font-semibold shadow-sm", tier.color)}
					>
						{tier.name} {problem.difficultyRating ?? ''}
					</Badge>
				</div>
				<div class="flex gap-2">
					{#if isAuthorized}
						<Button variant="outline" size="sm" href={`/problems/${problem.id}/edit`} class="gap-2">
							<Pencil class="h-4 w-4" /> 문제 편집
						</Button>
					{/if}
					<Badge variant="outline" class="flex items-center gap-1 bg-muted/50">
						<Info class="h-3 w-3" /> {problem.timeLimit}
					</Badge>
					<Badge variant="outline" class="flex items-center gap-1 bg-muted/50">
						<Info class="h-3 w-3" /> {problem.memoryLimit}
					</Badge>
				</div>
			</div>
		</div>

		<Tabs.Root value="description" class="w-full">
			<Tabs.List class="grid w-full max-w-md grid-cols-3">
				<Tabs.Trigger value="description" class="flex items-center gap-2">
					<Info class="h-4 w-4" /> 문제 설명
				</Tabs.Trigger>
				<Tabs.Trigger value="submit" class="flex items-center gap-2">
					<Send class="h-4 w-4" /> 제출
				</Tabs.Trigger>
				<Tabs.Trigger value="submissions" class="flex items-center gap-2">
					<History class="h-4 w-4" /> 내 제출
				</Tabs.Trigger>
			</Tabs.List>

			<!-- Description Tab -->
			<Tabs.Content value="description" class="mt-6 flex flex-col gap-8">
				<section>
					<h3 class="mb-3 text-xl font-bold">문제 설명</h3>
					<div class="prose prose-slate max-w-none dark:prose-invert">
						<p>{problem.description}</p>
					</div>
				</section>

				<section class="grid gap-8 md:grid-cols-2">
					<div>
						<h3 class="mb-3 text-lg font-bold">입력 형식</h3>
						<div class="rounded-lg border bg-muted p-4 font-mono text-sm">
							{problem.inputFormat}
						</div>
					</div>
					<div>
						<h3 class="mb-3 text-lg font-bold">출력 형식</h3>
						<div class="rounded-lg border bg-muted p-4 font-mono text-sm">
							{problem.outputFormat}
						</div>
					</div>
				</section>

				<section class="grid gap-8 md:grid-cols-1">
					{#each problem.testcases as tc, i}
						<div class="grid gap-4 md:grid-cols-2">
							<div>
								<h3 class="mb-3 text-lg font-bold">예제 입력 {i + 1}</h3>
								<pre class="overflow-auto rounded-lg bg-slate-950 p-4 font-mono text-sm text-slate-50">{tc.input}</pre>
							</div>
							<div>
								<h3 class="mb-3 text-lg font-bold">예제 출력 {i + 1}</h3>
								<pre class="overflow-auto rounded-lg bg-slate-950 p-4 font-mono text-sm text-slate-50">{tc.output}</pre>
							</div>
						</div>
					{/each}
					{#if problem.testcases.length === 0}
						<div class="text-muted-foreground italic text-sm py-4 border-y">
							표시할 예제 입출력이 없습니다.
						</div>
					{/if}
				</section>

				{#if problem.hint}
					<section>
						<h3 class="mb-3 text-lg font-bold">힌트</h3>
						<div class="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm italic">
							{problem.hint}
						</div>
					</section>
				{/if}
			</Tabs.Content>

			<!-- Submit Tab -->
			<Tabs.Content value="submit" class="mt-6">
				<Card.Root>
					<Card.Header>
						<Card.Title>코드 제출</Card.Title>
						<Card.Description>언어를 선택하고 아래에 소스 코드를 붙여넣으세요.</Card.Description>
					</Card.Header>
					<Card.Content class="flex flex-col gap-6">
						<div class="grid max-w-xs gap-2">
							<Label for="language">언어</Label>
							<Select.Root type="single" name="language" bind:value={selectedLanguage}>
								<Select.Trigger class="w-full">
									{selectedLanguageLabel}
								</Select.Trigger>
								<Select.Content>
									{#each languages as lang}
										<Select.Item value={lang.value} label={lang.label}>
											{lang.label}
										</Select.Item>
									{/each}
								</Select.Content>
							</Select.Root>
						</div>

						<div class="grid gap-2">
							<Label for="code">소스 코드</Label>
							<Textarea
								id="code"
								placeholder="// 여기에 코드를 작성하세요..."
								class="min-h-[400px] w-full bg-muted/50 font-mono text-sm"
							/>
						</div>
					</Card.Content>
					<Card.Footer class="flex justify-between border-t p-6">
						<Button variant="outline">초기화</Button>
						<Button class="flex gap-2">
							<Send class="h-4 w-4" /> 제출하기
						</Button>
					</Card.Footer>
				</Card.Root>
			</Tabs.Content>

			<!-- Submissions Tab -->
			<Tabs.Content value="submissions" class="mt-6">
				<Card.Root>
					<Card.Content class="flex flex-col items-center gap-4 p-12 text-center">
						<div class="rounded-full bg-muted p-4">
							<History class="h-8 w-8 text-muted-foreground" />
						</div>
						<div>
							<h3 class="text-xl font-bold">제출 내역이 없습니다</h3>
							<p class="mt-1 text-muted-foreground">이 문제에 대한 당신의 제출 기록이 여기에 표시됩니다.</p>
						</div>
						<Button variant="secondary" onclick={() => { /* Switch to submit tab */ }}>첫 번째 코드 제출하기</Button>
					</Card.Content>
				</Card.Root>
			</Tabs.Content>
		</Tabs.Root>
	</div>
</div>
