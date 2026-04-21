<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import * as Select from '$lib/components/ui/select';
	import { Label } from '$lib/components/ui/label';
	import { ChevronLeft, Save, Plus, Trash2, Link } from '@lucide/svelte';
	import { untrack } from 'svelte';
	import '@xyflow/svelte/dist/style.css';
	import {
		SvelteFlow,
		Background,
		Controls,
		MiniMap,
		useSvelteFlow,
		type Node,
		type Edge,
		type Connection,
		addEdge,
		BackgroundVariant
	} from '@xyflow/svelte';
	import { writable } from 'svelte/store';
	import RoadmapNode from '../RoadmapNode.svelte';

	let { data, form } = $props();
	const roadmap = $derived(data.roadmap);
	const allProblemsets = $derived(data.allProblemsets);

	let isSubmitting = $state(false);
	let selectedProblemsetId = $state<string>('');

	// xyflow uses $state arrays in Svelte 5
	let nodes = $state<Node[]>([]);
	let edges = $state<Edge[]>([]);

	const nodeTypes = {
		custom: RoadmapNode
	};

	const dummyProgress = { total: 0, solved: 0, isCompleted: true, isLocked: false };

	// Initialize stores when roadmap changes
	$effect(() => {
		const rm = roadmap;
		untrack(() => {
			const initialNodes: Node[] = rm.nodes.map((n) => ({
				id: n.id,
				position: { x: n.positionX, y: n.positionY },
				data: { label: n.problemset.title, problemsetId: n.problemsetId, progress: dummyProgress },
				type: 'custom'
			}));
			const initialEdges: Edge[] = rm.edges.map((e) => ({
				id: e.id,
				source: e.sourceId,
				target: e.targetId,
				type: 'smoothstep',
				animated: true,
				class: 'stroke-foreground stroke-2'
			}));
			nodes = initialNodes;
			edges = initialEdges;
		});
	});

	function addNode() {
		if (!selectedProblemsetId) return;
		const psId = parseInt(selectedProblemsetId);
		const ps = allProblemsets.find((p) => p.id === psId);
		if (!ps) return;

		const newNodeId = `node-${Date.now()}`;
		nodes = [
			...nodes,
			{
				id: newNodeId,
				position: { x: Math.random() * 200 + 100, y: Math.random() * 200 + 100 },
				data: { label: ps.title, problemsetId: psId, progress: dummyProgress },
				type: 'custom'
			}
		];
	}

	function handleConnect(connection: Connection) {
		edges = addEdge({ ...connection, type: 'smoothstep', animated: true, class: 'stroke-foreground stroke-2' }, edges);
	}

	function deleteSelected() {
		nodes = nodes.filter((n) => !n.selected);
		edges = edges.filter((e) => !e.selected);
	}

	let showDeleteConfirm = $state(false);
</script>

<div class="flex h-[calc(100vh-4rem)] flex-col">
	<div class="border-b bg-muted/20 p-4">
		<div class="container mx-auto flex items-center justify-between">
			<div class="flex items-center gap-4">
				<Button variant="ghost" size="icon" href={`/roadmaps/${roadmap.id}`}>
					<ChevronLeft class="h-4 w-4" />
				</Button>
				<div>
					<h1 class="text-xl font-bold">{roadmap.title} 편집</h1>
					<p class="text-xs text-muted-foreground">
						노드를 드래그하여 배치하고 연결점을 이어주세요. 항목을 선택하고 [선택 삭제] 또는 [Backspace]를 누르면 제거됩니다.
					</p>
				</div>
			</div>

			<div class="flex items-center gap-4">
				<div class="flex items-center gap-2 rounded-md border bg-background p-1 shadow-sm">
					<Select.Root type="single" bind:value={selectedProblemsetId}>
						<Select.Trigger class="h-8 w-[200px] border-none text-xs">
							{selectedProblemsetId
								? allProblemsets.find((p) => p.id.toString() === selectedProblemsetId)?.title
								: '추가할 문제집 선택'}
						</Select.Trigger>
						<Select.Content class="max-h-60">
							{#each allProblemsets as ps}
								<Select.Item value={ps.id.toString()} label={ps.title} class="text-xs">
									{ps.title}
								</Select.Item>
							{/each}
						</Select.Content>
					</Select.Root>
					<Button
						variant="secondary"
						size="sm"
						class="h-8 gap-1 text-xs"
						onclick={addNode}
						disabled={!selectedProblemsetId}
					>
						<Plus class="h-3 w-3" /> 노드 추가
					</Button>
					<Button
						variant="outline"
						size="sm"
						class="h-8 gap-1 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
						onclick={deleteSelected}
					>
						<Trash2 class="h-3 w-3" /> 선택 삭제
					</Button>
				</div>

				<form
					method="POST"
					action="?/saveGraph"
					use:enhance={({ formData }) => {
						formData.set('graphData', JSON.stringify({ nodes, edges }));
						isSubmitting = true;
						return async ({ update }) => {
							await update({ reset: false });
							isSubmitting = false;
						};
					}}
				>
					<Button type="submit" class="gap-2" disabled={isSubmitting}>
						<Save class="h-4 w-4" />
						{isSubmitting ? '저장 중...' : '그래프 저장'}
					</Button>
				</form>

				{#if !showDeleteConfirm}
					<Button variant="destructive" size="icon" onclick={() => (showDeleteConfirm = true)}>
						<Trash2 class="h-4 w-4" />
					</Button>
				{:else}
					<div
						class="flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/10 p-1"
					>
						<form method="POST" action="?/deleteRoadmap" use:enhance>
							<button
								type="submit"
								class="text-destructive-foreground rounded bg-destructive px-2 py-1.5 text-xs font-bold transition hover:bg-destructive/90"
							>
								삭제 확인
							</button>
						</form>
						<Button
							variant="ghost"
							size="sm"
							class="h-7 text-xs"
							onclick={() => (showDeleteConfirm = false)}>취소</Button
						>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<div class="relative flex-1">
		{#if form?.message}
			<div
				class="text-destructive-foreground absolute top-4 left-1/2 z-10 -translate-x-1/2 rounded-md bg-destructive px-4 py-2 text-sm font-bold shadow-lg"
			>
				{form.message}
			</div>
		{/if}
		{#if form?.success}
			<div
				class="absolute top-4 left-1/2 z-10 -translate-x-1/2 rounded-md bg-green-500 px-4 py-2 text-sm font-bold text-white shadow-lg"
			>
				성공적으로 저장되었습니다!
			</div>
		{/if}

		<SvelteFlow 
			bind:nodes
			bind:edges
			{nodeTypes}
			onconnect={handleConnect}
			fitView

			class="bg-slate-50 dark:bg-slate-950"
		>
			<Background variant={BackgroundVariant.Dots} />
			<Controls />
			<MiniMap />
		</SvelteFlow>
	</div>
</div>
