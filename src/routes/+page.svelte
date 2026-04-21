<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Code2, Trophy, ArrowRight, Star, Zap } from '@lucide/svelte';

	let { data } = $props();
	const featuredProblems = $derived(data.featuredProblems);
	const upcomingContests = $derived(data.upcomingContests);

	const formatDate = (date: Date) => {
		return new Intl.DateTimeFormat('ko-KR', {
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(date);
	};
</script>

<div class="flex flex-col gap-16 pb-16">
	<!-- Hero Section -->
	<section class="relative overflow-hidden bg-slate-950 py-24 text-white lg:py-32">
		<div class="relative z-10 container mx-auto px-4">
			<div class="max-w-3xl">
				<h1 class="mb-6 text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
					당신의 <span class="text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]"
						>코딩 실력</span
					>을 한 단계 높이세요
				</h1>
				<p class="mb-10 max-w-2xl text-xl leading-relaxed text-slate-300">
					수천 명의 개발자들과 함께 복잡한 알고리즘을 해결하고, 긴장감 넘치는 대회에 참여하며 원하는
					프로그래밍 언어를 마스터하세요.
				</p>
				<div class="flex flex-wrap gap-4">
					<Button size="lg" class="h-14 px-8 text-lg" href="/problems">
						문제 풀기 시작 <ArrowRight class="ml-2 h-5 w-5" />
					</Button>
					<Button
						size="lg"
						variant="outline"
						class="h-14 border-white/20 bg-white/5 px-8 text-lg text-white hover:bg-white/10"
						href="/competitions"
					>
						대회 일정 보기
					</Button>
				</div>
			</div>
		</div>

		<!-- Decorative Background -->
		<div
			class="pointer-events-none absolute top-0 right-0 h-full w-full translate-x-1/4 -translate-y-1/2 opacity-20"
		>
			<div
				class="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-purple-600 blur-3xl"
			></div>
		</div>
	</section>

	<div class="container mx-auto flex flex-col gap-20 px-4">
		<!-- Problems and Contests -->
		<section class="grid gap-10 lg:grid-cols-3">
			<!-- Featured Problems -->
			<div class="flex flex-col gap-6 lg:col-span-2">
				<div class="flex items-center justify-between">
					<h2 class="text-3xl font-bold tracking-tight">추천 문제</h2>
					<Button variant="link" href="/problems" class="text-primary">모든 문제 보기</Button>
				</div>
				<div class="grid gap-4">
					{#each featuredProblems as problem}
						<a href={`/problems/${problem.id}`} class="block">
							<Card.Root class="group transition-all hover:border-primary">
								<Card.Content class="flex items-center justify-between p-4">
									<div class="flex items-center gap-4">
										<div class="w-12 font-mono text-sm text-muted-foreground">{problem.id}</div>
										<div>
											<h3 class="font-semibold transition-colors group-hover:text-primary">
												{problem.title}
											</h3>
											<div class="mt-1 flex gap-2">
												<Badge variant="outline" class="h-5 text-[10px]">{problem.category}</Badge>
											</div>
										</div>
									</div>
									<div class="flex items-center gap-4">
										<Badge
											variant={problem.difficulty === '쉬움'
												? 'secondary'
												: problem.difficulty === '보통'
													? 'default'
													: 'destructive'}
											class="px-2"
										>
											{problem.difficulty}
										</Badge>
										<Button variant="ghost" size="icon" class="rounded-full">
											<Zap class="h-4 w-4" />
										</Button>
									</div>
								</Card.Content>
							</Card.Root>
						</a>
					{/each}
				</div>
			</div>

			<!-- Upcoming Contests -->
			<div class="flex flex-col gap-6">
				<h2 class="text-3xl font-bold tracking-tight">예정된 대회</h2>
				<div class="grid gap-4">
					{#each upcomingContests as contest}
						<Card.Root class="border-primary/20 bg-primary/5">
							<Card.Header class="p-5 pb-2">
								<Card.Title class="text-lg">{contest.title}</Card.Title>
								<Card.Description class="mt-1 flex items-center gap-1">
									<Trophy class="h-3 w-3" /> 대회
								</Card.Description>
							</Card.Header>
							<Card.Content class="p-5 pt-0">
								<div class="mt-4 flex flex-col gap-4">
									<div class="flex items-center justify-between text-sm">
										<span class="text-muted-foreground">시작 시간</span>
										<span class="font-medium">{formatDate(contest.date)}</span>
									</div>
									<div class="flex items-center justify-between text-sm">
										<span class="text-muted-foreground">참가 인원</span>
										<span class="font-medium">{contest.participants}명</span>
									</div>
									<Button class="mt-2 w-full" href={`/competitions/${contest.id}`}>지금 신청하기</Button>
								</div>
							</Card.Content>
						</Card.Root>
					{:else}
						<div
							class="flex h-32 flex-col items-center justify-center rounded-lg border border-dashed text-center"
						>
							<p class="text-sm text-muted-foreground">현재 예정된 대회가 없습니다.</p>
						</div>
					{/each}

					<Card.Root class="border-dashed">
						<Card.Content class="flex flex-col items-center justify-center gap-4 p-8 text-center">
							<div class="rounded-full bg-muted p-3">
								<Star class="h-6 w-6 text-muted-foreground" />
							</div>
							<div>
								<h3 class="font-semibold">대회를 직접 개최하고 싶으신가요?</h3>
								<p class="mt-1 text-sm text-muted-foreground">
									친구들이나 팀원들을 위한 비공개 대회를 만들어보세요.
								</p>
							</div>
							<Button variant="outline" size="sm">대회 생성하기</Button>
						</Card.Content>
					</Card.Root>
				</div>
			</div>
		</section>
	</div>
</div>
