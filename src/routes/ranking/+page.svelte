<script lang="ts">
	import * as Table from '$lib/components/ui/table';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import { Badge } from '$lib/components/ui/badge';
	import { getTier, cn } from '$lib/utils';
	import { Trophy, Medal, Star } from '@lucide/svelte';

	let { data } = $props();
	const users = $derived(data.topUsers);
</script>

<div class="container mx-auto px-4 py-10">
	<div class="flex flex-col gap-8">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">랭킹</h1>
			<p class="mt-1 text-muted-foreground">최고의 실력을 가진 유저들을 확인해보세요.</p>
		</div>

		<div class="rounded-lg border bg-card">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head class="w-20 text-center">순위</Table.Head>
						<Table.Head>유저</Table.Head>
						<Table.Head>티어</Table.Head>
						<Table.Head class="text-right">레이팅</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each users as user, i}
						{@const tier = getTier(user.rating)}
						<Table.Row>
							<Table.Cell class="text-center font-bold">
								<a href={`/profile/${user.id}`} class="block w-full h-full">
									{#if i === 0}
										<Trophy class="mx-auto h-5 w-5 text-yellow-500" />
									{:else if i === 1}
										<Medal class="mx-auto h-5 w-5 text-slate-400" />
									{:else if i === 2}
										<Medal class="mx-auto h-5 w-5 text-amber-600" />
									{:else}
										{i + 1}
									{/if}
								</a>
							</Table.Cell>
							<Table.Cell>
								<div class="flex items-center gap-3">
									<Avatar class="h-8 w-8">
										<AvatarImage src={user.image} alt={user.name} />
										<AvatarFallback>{user.name[0]}</AvatarFallback>
									</Avatar>
									<a href={`/profile/${user.id}`} class="font-medium hover:underline">
										{user.name}
									</a>
								</div>
							</Table.Cell>
							<Table.Cell>
								<Badge variant="outline" class={cn('font-semibold', tier.color)}>
									{tier.name}
								</Badge>
							</Table.Cell>
							<Table.Cell class="text-right font-mono font-bold">
								{user.rating}
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</div>
	</div>
</div>
