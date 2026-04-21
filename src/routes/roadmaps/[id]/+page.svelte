<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { ChevronLeft, Pencil, Map } from '@lucide/svelte';
	import { untrack } from 'svelte';
	import '@xyflow/svelte/dist/style.css';
	import {
		SvelteFlow,
		Background,
		Controls,
		MiniMap,
		type Node,
		type Edge,
		BackgroundVariant
	} from '@xyflow/svelte';
	import { writable } from 'svelte/store';
	import RoadmapNode from './RoadmapNode.svelte';

	let { data } = $props();
	const roadmap = $derived(data.roadmap);
	const nodeProgress = $derived(data.nodeProgress);
	const user = $derived(data.user);

	const isAuthorized = $derived(user && (user.role === 'admin' || user.id === roadmap.createdById));

	let nodes = $state<Node[]>([]);
	let edges = $state<Edge[]>([]);

	const nodeTypes = {
		custom: RoadmapNode
	};

	$effect(() => {
		const rm = roadmap;
		const prog = nodeProgress;
		untrack(() => {
			const initialNodes: Node[] = rm.nodes.map((n) => ({
				id: n.id,
				position: { x: n.positionX, y: n.positionY },
				data: {
					label: n.problemset.title,
					problemsetId: n.problemsetId,
					progress: prog[n.id]
				},
				type: 'custom',
				draggable: false, // Viewer mode, disable dragging
				selectable: false
			}));

			const initialEdges: Edge[] = rm.edges.map(e => {
				const isSourceCompleted = prog[e.sourceId]?.isCompleted ?? false;
				return {
					id: e.id,
					source: e.sourceId,
					target: e.targetId,
					type: 'smoothstep',
					animated: !isSourceCompleted,
					class: isSourceCompleted ? 'stroke-primary stroke-2' : 'stroke-muted-foreground stroke-2'
				};
			});

			nodes = initialNodes;
			edges = initialEdges;
		});
	});
</script>

<div class="flex h-[calc(100vh-4rem)] flex-col">
	<div class="border-b bg-muted/10 p-4">
		<div class="container mx-auto flex items-center justify-between">
			<div class="flex items-center gap-4">
				<Button variant="ghost" size="icon" href="/roadmaps">
					<ChevronLeft class="h-4 w-4" />
				</Button>
				<div>
					<div class="flex items-center gap-3">
						<h1 class="text-2xl font-bold">{roadmap.title}</h1>
					</div>
					<p class="mt-1 line-clamp-1 max-w-2xl text-sm text-muted-foreground">
						{roadmap.description || '설명이 없습니다.'}
					</p>
				</div>
			</div>

			<div class="flex items-center gap-2">
				{#if isAuthorized}
					<Button variant="outline" size="sm" href={`/roadmaps/${roadmap.id}/edit`} class="gap-2">
						<Pencil class="h-4 w-4" /> 로드맵 편집
					</Button>
				{/if}
			</div>
		</div>
	</div>

	<div class="relative flex-1">
		{#if roadmap.nodes.length === 0}
			<div
				class="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm"
			>
				<Map class="mb-4 h-12 w-12 text-muted-foreground" />
				<h3 class="mb-2 text-xl font-semibold">텅 빈 로드맵입니다</h3>
				<p class="text-muted-foreground">아직 노드가 추가되지 않았습니다.</p>
			</div>
		{/if}

		<SvelteFlow
			{nodes}
			{edges}
			{nodeTypes}
			fitView
			nodesDraggable={false}
			nodesConnectable={false}
			elementsSelectable={false}
			class="bg-slate-50 dark:bg-slate-950"
		>
			<Background variant={BackgroundVariant.Dots} />
			<Controls showInteractive={false} />
			<MiniMap />
		</SvelteFlow>
	</div>
</div>
