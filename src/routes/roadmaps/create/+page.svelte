<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { ChevronLeft, Save } from '@lucide/svelte';

	let { form } = $props();
	let isSubmitting = $state(false);
</script>

<div class="container mx-auto max-w-2xl px-4 py-10">
	<div class="mb-8">
		<Button variant="ghost" size="sm" class="mb-4 -ml-2 w-fit" href="/roadmaps">
			<ChevronLeft class="mr-1 h-4 w-4" /> 로드맵 목록으로
		</Button>
		<h1 class="text-3xl font-extrabold tracking-tight">새 로드맵 만들기</h1>
		<p class="mt-2 text-muted-foreground">로드맵의 기본 정보를 입력하고 그래프를 편집해보세요.</p>
	</div>

	<Card.Root>
		<form
			method="POST"
			use:enhance={() => {
				isSubmitting = true;
				return async ({ update }) => {
					await update();
					isSubmitting = false;
				};
			}}
		>
			<Card.Header>
				<Card.Title>로드맵 정보</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-6">
				{#if form?.missing}
					<p class="text-sm font-medium text-destructive">제목은 필수 입력 항목입니다.</p>
				{/if}
				{#if form?.message}
					<p class="text-sm font-medium text-destructive">{form.message}</p>
				{/if}

				<div class="space-y-2">
					<Label for="title">로드맵 제목</Label>
					<Input
						id="title"
						name="title"
						value={form?.title ?? ''}
						placeholder="예: 백엔드 개발자 알고리즘 코스"
						required
					/>
				</div>

				<div class="space-y-2">
					<Label for="description">설명</Label>
					<Textarea
						id="description"
						name="description"
						value={form?.description ?? ''}
						placeholder="이 로드맵의 목표와 특징을 설명해주세요."
						class="min-h-[100px]"
					/>
				</div>
			</Card.Content>
			<Card.Footer class="flex justify-end gap-4 border-t pt-6">
				<Button type="button" variant="outline" href="/roadmaps">취소</Button>
				<Button type="submit" class="gap-2" disabled={isSubmitting}>
					{#if isSubmitting}
						저장 중...
					{:else}
						<Save class="h-4 w-4" /> 그래프 편집하러 가기
					{/if}
				</Button>
			</Card.Footer>
		</form>
	</Card.Root>
</div>
