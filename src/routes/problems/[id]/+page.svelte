<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Textarea } from '$lib/components/ui/textarea';
	import * as Select from '$lib/components/ui/select';
	import { Label } from '$lib/components/ui/label';
	import { Code2, Send, History, Info, ChevronLeft, Pencil, Loader2 } from '@lucide/svelte';

	import { getTier, cn } from '$lib/utils';

	let { data, form } = $props();
	const problem = $derived(data.problem);
	const user = $derived(data.user);
	const tier = $derived(getTier(problem.difficultyRating));
	const languages = $derived(data.languages);
	const languagesError = $derived(data.languagesError);
	const userSubmissions = $derived(data.userSubmissions);

	const isAuthorized = $derived(
		user && (user.role === 'admin' || user.id === problem.createdById)
	);

	let selectedLanguage = $state<string>('');
	$effect(() => {
		if (!selectedLanguage && languages.length > 0) {
			selectedLanguage = String(languages[0].id);
		}
	});
	const selectedLanguageLabel = $derived(
		languages.find((l) => String(l.id) === selectedLanguage)?.name ?? '언어 선택'
	);

	let sourceCode = $state('');
	let submitting = $state(false);
	let activeTab = $state('description');

	type TestCaseResult = {
		token: string;
		testcase_index: number | null;
		status_id: number;
		status_label: string;
		stdout: string | null;
		stderr: string | null;
		compile_output: string | null;
		message: string | null;
		time_ms: number | null;
		memory_kb: number | null;
		done: boolean;
	};

	type ProblemResult = {
		id: number;
		status_id: number;
		status_label: string;
		language: string;
		code: string;
		runtime: number | null;
		memory: number | null;
		createdAt: Date;
		testcases: TestCaseResult[];
		done: boolean;
	};

	let results = $state<ProblemResult[]>([]);
	let initialized = $state(false);

	// Initialize results from history
	$effect(() => {
		if (userSubmissions && !initialized) {
			results = userSubmissions.map((ps: any) => ({
				id: ps.id,
				status_id: ps.statusId,
				status_label: ps.status,
				language: ps.language,
				code: ps.code,
				runtime: ps.runtime,
				memory: ps.memory,
				createdAt: new Date(ps.createdAt),
				testcases: ps.testcaseSubmissions.map((s: any) => ({
					token: s.token,
					testcase_index: s.testcaseIndex,
					status_id: s.statusId,
					status_label: s.status,
					stdout: s.stdout,
					stderr: s.stderr,
					compile_output: s.compileOutput,
					message: s.message,
					time_ms: s.runtime,
					memory_kb: s.memory,
					done: s.statusId !== 1 && s.statusId !== 2
				})),
				done: ps.statusId !== 1 && ps.statusId !== 2
			}));
			initialized = true;

			// Poll unfinished ones
			for (const pr of results) {
				for (const tr of pr.testcases) {
					if (!tr.done) {
						pollSubmission(tr.token);
					}
				}
			}
		}
	});

	const STATUS_LABELS: Record<number, string> = {
		1: 'In Queue',
		2: 'Processing',
		3: 'Accepted',
		4: 'Wrong Answer',
		5: 'Time Limit Exceeded',
		6: 'Compilation Error',
		7: 'Runtime Error (SIGSEGV)',
		8: 'Runtime Error (SIGXFSZ)',
		9: 'Runtime Error (SIGFPE)',
		10: 'Runtime Error (SIGABRT)',
		11: 'Runtime Error (NZEC)',
		12: 'Runtime Error',
		13: 'Internal Error',
		14: 'Exec Format Error',
		15: 'Memory Limit Exceeded'
	};

	function statusVariant(status_id: number): 'default' | 'destructive' | 'secondary' | 'outline' {
		if (status_id === 3) return 'default';
		if (status_id === 1 || status_id === 2) return 'secondary';
		return 'destructive';
	}

	async function pollSubmission(token: string) {
		for (let i = 0; i < 120; i++) {
			let found = false;
			let targetTR: TestCaseResult | null = null;
			let targetPR: ProblemResult | null = null;

			for (const pr of results) {
				const tr = pr.testcases.find(t => t.token === token);
				if (tr) {
					targetTR = tr;
					targetPR = pr;
					found = true;
					break;
				}
			}

			if (!found) return;

			try {
				const res = await fetch(`/api/submissions/${token}`);
				if (!res.ok) throw new Error(`status ${res.status}`);
				const sub = await res.json();
				const done = sub.status_id !== 1 && sub.status_id !== 2;
				
				// Update the nested state
				for (let prIdx = 0; prIdx < results.length; prIdx++) {
					const pr = results[prIdx];
					const trIdx = pr.testcases.findIndex(t => t.token === token);
					if (trIdx >= 0) {
						// Update testcase
						const tr = pr.testcases[trIdx];
						pr.testcases[trIdx] = {
							...tr,
							status_id: sub.status_id,
							status_label: STATUS_LABELS[sub.status_id] ?? `Status ${sub.status_id}`,
							stdout: sub.stdout,
							stderr: sub.stderr,
							compile_output: sub.compile_output,
							message: sub.message,
							time_ms: sub.time_ms,
							memory_kb: sub.memory_kb,
							done
						};

						// Recalculate parent status if all testcases are done
						const allDone = pr.testcases.every(t => t.done);
						if (allDone) {
							const failed = pr.testcases.find(t => t.status_id !== 3);
							pr.status_id = failed ? failed.status_id : 3;
							pr.status_label = failed ? failed.status_label : 'Accepted';
							pr.runtime = pr.testcases.reduce((acc, t) => acc + (t.time_ms ?? 0), 0);
							pr.memory = pr.testcases.reduce((acc, t) => Math.max(acc, t.memory_kb ?? 0), 0);
							pr.done = true;
						}
						
						// Trigger reactivity
						results[prIdx] = { ...pr };
						break;
					}
				}

				if (done) return;
			} catch (err) {
				console.error('poll error:', err);
			}
			await new Promise((r) => setTimeout(r, 1500));
		}
	}

	async function refreshResults() {
		results = [];
		initialized = false;
		await invalidateAll();
	}

	$effect(() => {
		if (form && 'success' in form && form.success && form.results) {
			const formResults = form.results as { token: string; testcase_index: number | null }[];
			
			// We need the ID of the new problem submission, which is not in form.results
			// Simplest way: refresh from server to get the full structure
			refreshResults();
			activeTab = 'submissions';
		}
	});
</script>

<div class="container mx-auto px-4 py-8">
	<div class="flex flex-col gap-6">
		<div class="flex flex-col gap-4">
			<Button variant="ghost" size="sm" class="w-fit -ml-2" href="/problems">
				<ChevronLeft class="mr-1 h-4 w-4" /> 문제 목록으로 돌아가기
			</Button>
			<div class="flex flex-wrap items-center justify-between gap-4">
				<div class="flex items-center gap-4">
					<h1 class="text-4xl font-extrabold tracking-tight">{problem.id}. {problem.title}</h1>
					{#if results.some(r => r.status_id === 3)}
						<Badge class="bg-green-500 hover:bg-green-600">SOLVED</Badge>
					{/if}
					<Badge variant="outline" class={cn('font-semibold shadow-sm', tier.color)}>
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

		<Tabs.Root bind:value={activeTab} class="w-full">
			<Tabs.List class="grid w-full max-w-md grid-cols-3">
				<Tabs.Trigger value="description" class="flex items-center gap-2">
					<Info class="h-4 w-4" /> 문제 설명
				</Tabs.Trigger>
				<Tabs.Trigger value="submit" class="flex items-center gap-2">
					<Send class="h-4 w-4" /> 제출
				</Tabs.Trigger>
				<Tabs.Trigger value="submissions" class="flex items-center gap-2">
					<History class="h-4 w-4" /> 내 제출
					{#if results.length > 0}
						<Badge variant="secondary" class="ml-1">{results.length}</Badge>
					{/if}
				</Tabs.Trigger>
			</Tabs.List>

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

			<Tabs.Content value="submit" class="mt-6">
				<Card.Root>
					<Card.Header>
						<Card.Title>코드 제출</Card.Title>
						<Card.Description>언어를 선택하고 아래에 소스 코드를 붙여넣으세요.</Card.Description>
					</Card.Header>

					{#if languagesError}
						<div class="mx-6 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
							채점 서버에 연결할 수 없습니다: {languagesError}
						</div>
					{/if}

					<form
						method="POST"
						action="?/submit"
						use:enhance={() => {
							submitting = true;
							return async ({ update }) => {
								await update({ reset: false });
								submitting = false;
							};
						}}
					>
						<Card.Content class="flex flex-col gap-6">
							<div class="grid max-w-xs gap-2">
								<Label for="language">언어</Label>
								<Select.Root type="single" name="language_id" bind:value={selectedLanguage}>
									<Select.Trigger class="w-full">
										{selectedLanguageLabel}
									</Select.Trigger>
									<Select.Content>
										{#each languages as lang}
											<Select.Item value={String(lang.id)} label={lang.name}>
												{lang.name}
											</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
							</div>

							<div class="grid gap-2">
								<Label for="source_code">소스 코드</Label>
								<Textarea
									id="source_code"
									name="source_code"
									bind:value={sourceCode}
									placeholder="// 여기에 코드를 작성하세요..."
									class="min-h-[400px] w-full bg-muted/50 font-mono text-sm"
								/>
							</div>

							{#if form && 'message' in form && form.message}
								<div class="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
									{form.message}
								</div>
							{/if}
						</Card.Content>
						<Card.Footer class="flex justify-between border-t p-6">
							<Button
								type="button"
								variant="outline"
								onclick={() => {
									sourceCode = '';
								}}
							>
								초기화
							</Button>
							<Button
								type="submit"
								class="flex gap-2"
								disabled={submitting || languages.length === 0}
							>
								{#if submitting}
									<Loader2 class="h-4 w-4 animate-spin" /> 제출 중...
								{:else}
									<Send class="h-4 w-4" /> 제출하기
								{/if}
							</Button>
						</Card.Footer>
					</form>
				</Card.Root>
			</Tabs.Content>

			<Tabs.Content value="submissions" class="mt-6">
				<div class="mb-4 flex justify-end">
					<Button variant="outline" size="sm" onclick={refreshResults} class="gap-2">
						<History class="h-4 w-4" /> 기록 새로고침
					</Button>
				</div>
				{#if results.length === 0}
					<Card.Root>
						<Card.Content class="flex flex-col items-center gap-4 p-12 text-center">
							<div class="rounded-full bg-muted p-4">
								<History class="h-8 w-8 text-muted-foreground" />
							</div>
							<div>
								<h3 class="text-xl font-bold">제출 내역이 없습니다</h3>
								<p class="mt-1 text-muted-foreground">
									이 문제에 대한 당신의 제출 기록이 여기에 표시됩니다.
								</p>
							</div>
							<Button variant="secondary" onclick={() => (activeTab = 'submit')}>
								첫 번째 코드 제출하기
							</Button>
						</Card.Content>
					</Card.Root>
				{:else}
					<div class="flex flex-col gap-6">
						{#each results as pr (pr.id)}
							<Card.Root class={cn(pr.status_id === 3 && "border-green-500/50 bg-green-500/5")}>
								<Card.Header class="flex flex-row items-center justify-between gap-4 pb-2">
									<div class="flex items-center gap-3">
										<Badge variant={statusVariant(pr.status_id)} class="px-3 py-1 text-sm font-bold">
											{#if !pr.done}
												<Loader2 class="mr-2 h-4 w-4 animate-spin" />
											{/if}
											{pr.status_label}
										</Badge>
										<span class="text-xs text-muted-foreground">
											{pr.createdAt.toLocaleString()}
										</span>
									</div>
									<div class="flex gap-4 text-sm text-muted-foreground">
										<span class="font-mono">{pr.language}</span>
										{#if pr.runtime !== null}<span>{pr.runtime} ms</span>{/if}
										{#if pr.memory !== null}<span>{pr.memory} KB</span>{/if}
									</div>
								</Card.Header>
								<Card.Content>
									<div class="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
										{#each pr.testcases as tr}
											<div 
												class={cn(
													"flex flex-col items-center justify-center rounded-md border p-2 text-center transition-all",
													tr.status_id === 3 ? "border-green-500/30 bg-green-500/10 text-green-700" : 
													tr.status_id === 1 || tr.status_id === 2 ? "border-muted bg-muted/50" : 
													"border-destructive/30 bg-destructive/10 text-destructive"
												)}
												title={tr.status_label}
											>
												<span class="text-[10px] font-bold uppercase opacity-70">TC {tr.testcase_index ?? '?'}</span>
												{#if tr.status_id === 3}
													<Badge variant="outline" class="mt-1 h-5 border-green-500/50 px-1 text-[10px] text-green-600">PASS</Badge>
												{:else if tr.status_id === 1 || tr.status_id === 2}
													<Loader2 class="mt-1 h-3 w-3 animate-spin opacity-50" />
												{:else}
													<span class="mt-1 text-[10px] font-bold line-clamp-1">{tr.status_label.split(' ')[0]}</span>
												{/if}
											</div>
										{/each}
									</div>

									{#if pr.status_id !== 3 && pr.status_id > 2}
										<div class="mt-4 space-y-3">
											{#each pr.testcases.filter(t => t.status_id !== 3 && t.status_id > 2).slice(0, 1) as errorTr}
												<div class="rounded-lg bg-slate-950 p-4 font-mono text-xs text-slate-50">
													<div class="mb-2 flex items-center justify-between border-b border-slate-800 pb-2">
														<span class="font-bold text-destructive">Testcase {errorTr.testcase_index} Failure</span>
														<span class="opacity-70">{errorTr.status_label}</span>
													</div>
													{#if errorTr.compile_output}
														<div class="mt-2">
															<div class="mb-1 font-bold text-yellow-500">Compile Output:</div>
															<pre class="whitespace-pre-wrap">{errorTr.compile_output}</pre>
														</div>
													{/if}
													{#if errorTr.stderr}
														<div class="mt-2">
															<div class="mb-1 font-bold text-red-400">Stderr:</div>
															<pre class="whitespace-pre-wrap">{errorTr.stderr}</pre>
														</div>
													{/if}
													{#if errorTr.message}
														<div class="mt-2 italic opacity-80">{errorTr.message}</div>
													{/if}
												</div>
											{/each}
										</div>
									{/if}
								</Card.Content>
							</Card.Root>
						{/each}
					</div>
				{/if}
			</Tabs.Content>
		</Tabs.Root>
	</div>
</div>
