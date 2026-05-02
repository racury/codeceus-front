<script lang="ts">
	import { enhance } from '$app/forms';
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
	let stdin = $state('');
	let submitting = $state(false);
	let activeTab = $state('description');

	type Result = {
		token: string;
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
	let results = $state<Result[]>([]);

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
		const idx = results.findIndex((r) => r.token === token);
		if (idx < 0) return;
		for (let i = 0; i < 60; i++) {
			try {
				const res = await fetch(`/api/submissions/${token}`);
				if (!res.ok) throw new Error(`status ${res.status}`);
				const sub = await res.json();
				const done = sub.status_id !== 1 && sub.status_id !== 2;
				results[idx] = {
					token,
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
				if (done) return;
			} catch (err) {
				console.error('poll error:', err);
			}
			await new Promise((r) => setTimeout(r, 800));
		}
	}

	$effect(() => {
		if (form && 'success' in form && form.success && form.token) {
			const token = form.token as string;
			if (!results.some((r) => r.token === token)) {
				results = [
					{
						token,
						status_id: 1,
						status_label: 'In Queue',
						stdout: null,
						stderr: null,
						compile_output: null,
						message: null,
						time_ms: null,
						memory_kb: null,
						done: false
					},
					...results
				];
				activeTab = 'submissions';
				pollSubmission(token);
			}
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

							<div class="grid gap-2">
								<Label for="stdin">표준 입력 (선택)</Label>
								<Textarea
									id="stdin"
									name="stdin"
									bind:value={stdin}
									placeholder="채점 시 stdin으로 전달됩니다."
									class="min-h-[100px] w-full bg-muted/50 font-mono text-sm"
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
									stdin = '';
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
					<div class="flex flex-col gap-4">
						{#each results as r (r.token)}
							<Card.Root>
								<Card.Header class="flex flex-row items-center justify-between gap-4">
									<div class="flex items-center gap-3">
										<Badge variant={statusVariant(r.status_id)}>
											{#if !r.done}
												<Loader2 class="mr-1 h-3 w-3 animate-spin" />
											{/if}
											{r.status_label}
										</Badge>
										<code class="text-xs text-muted-foreground">{r.token.slice(0, 8)}</code>
									</div>
									<div class="flex gap-3 text-xs text-muted-foreground">
										{#if r.time_ms !== null}<span>{r.time_ms} ms</span>{/if}
										{#if r.memory_kb !== null}<span>{r.memory_kb} KB</span>{/if}
									</div>
								</Card.Header>
								{#if r.compile_output || r.stdout || r.stderr || r.message}
									<Card.Content class="flex flex-col gap-3">
										{#if r.compile_output}
											<div>
												<div class="mb-1 text-xs font-semibold text-muted-foreground">컴파일 출력</div>
												<pre class="overflow-auto rounded bg-slate-950 p-3 font-mono text-xs text-slate-50">{r.compile_output}</pre>
											</div>
										{/if}
										{#if r.stdout}
											<div>
												<div class="mb-1 text-xs font-semibold text-muted-foreground">stdout</div>
												<pre class="overflow-auto rounded bg-slate-950 p-3 font-mono text-xs text-slate-50">{r.stdout}</pre>
											</div>
										{/if}
										{#if r.stderr}
											<div>
												<div class="mb-1 text-xs font-semibold text-muted-foreground">stderr</div>
												<pre class="overflow-auto rounded bg-slate-950 p-3 font-mono text-xs text-slate-50">{r.stderr}</pre>
											</div>
										{/if}
										{#if r.message}
											<div class="text-xs text-muted-foreground">{r.message}</div>
										{/if}
									</Card.Content>
								{/if}
							</Card.Root>
						{/each}
					</div>
				{/if}
			</Tabs.Content>
		</Tabs.Root>
	</div>
</div>
