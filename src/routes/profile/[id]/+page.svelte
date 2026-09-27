<script lang="ts">
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { getTier, cn } from '$lib/utils';
	import { Settings, Calendar, Award, Code2, CheckCircle2, History } from '@lucide/svelte';

	let { data } = $props();
	const user = $derived(data.profileUser);
	const tier = $derived(getTier(user.rating));
	const isOwnProfile = $derived(data.user?.id === user.id);
</script>

<div class="container mx-auto px-4 py-10">
	<div class="grid gap-8 md:grid-cols-12">
		<!-- Sidebar: User Info -->
		<div class="flex flex-col gap-6 md:col-span-4">
			<Card.Root>
				<Card.Content class="pt-6">
					<div class="flex flex-col items-center text-center">
						<Avatar class="mb-4 h-24 w-24 border-4 border-background ring-2 ring-muted">
							<AvatarImage src={user.image} alt={user.name} />
							<AvatarFallback class="text-2xl">{user.name[0]}</AvatarFallback>
						</Avatar>
						<h2 class="text-2xl font-bold">{user.name}</h2>
						<p class="mb-4 text-sm text-muted-foreground">{user.email}</p>

						<Badge variant="outline" class={cn('mb-6 px-4 py-1 text-base font-bold', tier.color)}>
							{tier.name}
							{user.rating}
						</Badge>

						{#if isOwnProfile}
							<Button variant="outline" class="w-full gap-2" href="/settings/profile">
								<Settings class="h-4 w-4" /> 프로필 수정
							</Button>
						{/if}
					</div>
				</Card.Content>
				<Card.Footer class="flex flex-col gap-3 border-t bg-muted/30 px-6 py-4">
					<div class="flex w-full items-center gap-2 text-sm text-muted-foreground">
						<Calendar class="h-4 w-4" />
						가입일: {new Date(user.createdAt).toLocaleDateString('ko-KR')}
					</div>
				</Card.Footer>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title class="text-lg">통계</Card.Title>
				</Card.Header>
				<Card.Content class="grid grid-cols-2 gap-4">
					<div
						class="flex flex-col items-center rounded-lg border border-primary/10 bg-primary/5 p-3"
					>
						<span class="text-2xl font-bold text-primary">{data.solvedCount}</span>
						<span class="text-xs text-muted-foreground">해결한 문제</span>
					</div>
					<div class="flex flex-col items-center rounded-lg border bg-muted/50 p-3">
						<span class="text-2xl font-bold">{data.recentSubmissions.length}</span>
						<span class="text-xs text-muted-foreground">최근 활동</span>
					</div>
				</Card.Content>
			</Card.Root>
		</div>

		<!-- Main Content -->
		<div class="flex flex-col gap-6 md:col-span-8">
			<h3 class="flex items-center gap-2 text-xl font-bold">
				<History class="h-5 w-5" /> 최근 제출 내역
			</h3>

			{#if data.recentSubmissions.length === 0}
				<Card.Root>
					<Card.Content class="py-12 text-center text-muted-foreground">
						아직 제출한 기록이 없습니다.
					</Card.Content>
				</Card.Root>
			{:else}
				<div class="flex flex-col gap-3">
					{#each data.recentSubmissions as sub}
						<Card.Root>
							<Card.Content class="flex items-center justify-between p-4">
								<div class="flex items-center gap-4">
									<div
										class={cn(
											'rounded-full p-2',
											sub.status === 'Accepted'
												? 'bg-green-500/10 text-green-600'
												: 'bg-red-500/10 text-red-600'
										)}
									>
										{#if sub.status === 'Accepted'}
											<CheckCircle2 class="h-5 w-5" />
										{:else}
											<Code2 class="h-5 w-5" />
										{/if}
									</div>
									<div>
										<a href={`/problems/${sub.problem.id}`} class="font-bold hover:underline">
											{sub.problem.id}. {sub.problem.title}
										</a>
										<p class="text-xs text-muted-foreground">
											{new Date(sub.createdAt).toLocaleString('ko-KR')} • {sub.language}
										</p>
									</div>
								</div>
								<Badge variant={sub.status === 'Accepted' ? 'default' : 'destructive'}>
									{sub.status === 'Accepted' ? '성공' : sub.status}
								</Badge>
							</Card.Content>
						</Card.Root>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>
