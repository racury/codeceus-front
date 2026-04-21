<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Button } from '$lib/components/ui/button';
	import { Label } from '$lib/components/ui/label';
	import { Badge } from '$lib/components/ui/badge';
	import { ChevronLeft, Info, Settings2, FileText, Code2, Layers } from '@lucide/svelte';
	import { cn } from '$lib/utils';

	let { data, form } = $props();

	let isSubmitting = $state(false);

	$effect(() => {
		if (form?.success) {
			goto(`/problems/${form.problemId}`);
		}
	});
</script>

<div class="container mx-auto max-w-5xl py-10 px-4">
	<div class="mb-8 flex items-center gap-4">
		<Button variant="ghost" size="icon" href="/problems">
			<ChevronLeft class="h-4 w-4" />
		</Button>
		<div>
			<h1 class="text-3xl font-bold tracking-tight">새 문제 만들기</h1>
			<p class="text-muted-foreground">성취감을 줄 수 있는 좋은 문제를 작성해주세요.</p>
		</div>
	</div>

	{#if form?.message}
		<div
			class="mb-6 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive"
		>
			{form.message}
		</div>
	{/if}

	<form
		method="POST"
		action="?/createProblem"
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
			<!-- Basic Info -->
			<Card.Root>
				<Card.Header>
					<div class="flex items-center gap-2 text-primary">
						<FileText class="h-5 w-5" />
						<Card.Title>기본 정보</Card.Title>
					</div>
					<Card.Description>문제의 제목과 본문을 작성합니다.</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-6">
					<div class="space-y-2">
						<Label for="title">문제 제목</Label>
						<Input id="title" name="title" placeholder="예: A+B 문제" required />
					</div>
					<div class="space-y-2">
						<Label for="description">문제 설명 (Markdown 지원 예정)</Label>
						<Textarea
							id="description"
							name="description"
							placeholder="문제 상황과 해결해야 할 과제를 상세히 적어주세요."
							class="min-h-[300px]"
							required
						/>
					</div>
				</Card.Content>
			</Card.Root>

			<!-- Input/Output Formats -->
			<Card.Root>
				<Card.Header>
					<div class="flex items-center gap-2 text-primary">
						<Info class="h-5 w-5" />
						<Card.Title>입출력 형식</Card.Title>
					</div>
					<Card.Description>데이터의 입력과 출력 형식을 명시합니다.</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-6">
					<div class="space-y-2">
						<Label for="inputFormat">입력 형식</Label>
						<Textarea
							id="inputFormat"
							name="inputFormat"
							placeholder="예: 첫째 줄에 정수 A와 B가 주어집니다."
						/>
					</div>
					<div class="space-y-2">
						<Label for="outputFormat">출력 형식</Label>
						<Textarea
							id="outputFormat"
							name="outputFormat"
							placeholder="예: 첫째 줄에 A+B의 결과를 출력합니다."
						/>
					</div>
				</Card.Content>
			</Card.Root>

			<!-- Hint -->
			<Card.Root>
				<Card.Header>
					<div class="flex items-center gap-2 text-primary">
						<Code2 class="h-5 w-5" />
						<Card.Title>힌트</Card.Title>
					</div>
					<Card.Description>추가적인 힌트나 주의사항을 적어주세요.</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-6">
					<div class="space-y-2">
						<Label for="hint">힌트 (선택)</Label>
						<Textarea id="hint" name="hint" placeholder="예: 두 정수는 32비트 정수형 범위 내에 있습니다." />
					</div>
					<div class="p-4 bg-muted/50 rounded-lg border border-dashed flex items-center gap-3">
						<Info class="h-5 w-5 text-muted-foreground" />
						<p class="text-xs text-muted-foreground">
							<strong>참고:</strong> 채점 및 예제용 테스트케이스는 문제 생성 후 <strong>'문제 편집'</strong> 페이지에서 추가하실 수 있습니다.
						</p>
					</div>
				</Card.Content>
			</Card.Root>
		</div>

		<!-- Sidebar Controls -->
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
						<Input id="timeLimit" name="timeLimit" placeholder="1000ms" defaultValue="1000ms" />
					</div>
					<div class="space-y-2">
						<Label for="memoryLimit">메모리 제한</Label>
						<Input id="memoryLimit" name="memoryLimit" placeholder="256MB" defaultValue="256MB" />
					</div>
					<div class="border-t pt-4">
						<div class="mb-4 flex items-center justify-between">
							<span class="text-sm font-medium">초기 난이도</span>
							<Badge variant="outline" class="bg-gray-400/10 text-gray-400">언레이티드</Badge>
						</div>
						<p class="text-[12px] leading-relaxed text-muted-foreground">
							새 문제는 기본적으로 '언레이티드' 상태로 생성됩니다. 관리자가 검토 후 난이도를 지정할
							예정입니다.
						</p>
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
						{#each data.categories as category}
							<label
								class="flex cursor-pointer items-center gap-2 rounded-md border border-transparent p-2 transition-colors hover:border-border hover:bg-muted"
							>
								<input
									type="checkbox"
									name="categories"
									value={category.id}
									class="h-4 w-4 rounded border-input text-primary focus:ring-primary"
								/>
								<span class="text-sm">{category.name}</span>
							</label>
						{/each}
					</div>
				</Card.Content>
			</Card.Root>

			<Button type="submit" class="h-12 w-full text-lg font-bold" disabled={isSubmitting}>
				{isSubmitting ? '생성 중...' : '문제 등록하기'}
			</Button>
		</div>
	</form>
</div>
