<script lang="ts">
	import { Handle, Position, type NodeProps } from '@xyflow/svelte';
	import { Badge } from '$lib/components/ui/badge';
	import { Lock, Unlock, CheckCircle2 } from '@lucide/svelte';

	let { data, id }: NodeProps = $props();

	const { label, problemsetId, progress } = data as {
		label: string;
		problemsetId: number;
		progress: { total: number; solved: number; isCompleted: boolean; isLocked: boolean };
	};

	const percentage = progress.total > 0 ? Math.round((progress.solved / progress.total) * 100) : 0;
</script>

<div
	class="relative min-w-[200px] rounded-lg border-2 bg-background p-4 shadow-sm transition-all {progress.isLocked
		? 'border-muted bg-muted/20 opacity-60'
		: progress.isCompleted
			? 'border-primary/50 bg-primary/5'
			: 'border-border hover:border-primary/30'}"
>
	<Handle type="target" position={Position.Top} class="h-3 w-3" />

	<div class="flex flex-col gap-3">
		<div class="flex items-start justify-between gap-2">
			<h3 class="leading-tight font-bold break-words">{label}</h3>
			{#if progress.isLocked}
				<Lock class="h-4 w-4 shrink-0 text-muted-foreground" />
			{:else if progress.isCompleted}
				<CheckCircle2 class="h-4 w-4 shrink-0 text-primary" />
			{:else}
				<Unlock class="h-4 w-4 shrink-0 text-muted-foreground" />
			{/if}
		</div>

		<div class="space-y-1">
			<div class="flex items-center justify-between text-xs font-medium text-muted-foreground">
				<span>진행률 ({progress.solved}/{progress.total})</span>
				<span>{percentage}%</span>
			</div>
			<div class="h-2 w-full overflow-hidden rounded-full bg-secondary">
				<div
					class="h-full {progress.isCompleted ? 'bg-primary' : 'bg-primary/50'}"
					style="width: {percentage}%"
				></div>
			</div>
			{#if !progress.isLocked}
				<a
					href={`/problemsets/${problemsetId}`}
					class="absolute inset-0 z-10 block rounded-lg focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:outline-none"
				>
					<span class="sr-only">{label} 문제집으로 이동</span>
				</a>
			{/if}
		</div>
	</div>

	<Handle type="source" position={Position.Bottom} class="h-3 w-3" />
</div>
