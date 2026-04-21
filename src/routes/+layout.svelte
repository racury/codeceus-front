<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { Button } from '$lib/components/ui/button';
	import * as NavigationMenu from '$lib/components/ui/navigation-menu';
	import { Input } from '$lib/components/ui/input';
	import * as Avatar from '$lib/components/ui/avatar';
	import { Separator } from '$lib/components/ui/separator';
	import { Search, Trophy, Code2, Layers, BarChart3, Bell, User, Map } from '@lucide/svelte';

	let { data, children } = $props();
	const user = $derived(data.user);

	const navItems = [
		{ name: '문제', href: '/problems', icon: Code2 },
		{ name: '문제집', href: '/problemsets', icon: Layers },
		{ name: '로드맵', href: '/roadmaps', icon: Map },
		{ name: '대회', href: '/competitions', icon: Trophy },
		{ name: '랭킹', href: '/ranking', icon: BarChart3 }
	];
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>Racury Online Judge</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-background font-sans antialiased">
	<!-- Navigation Bar -->
	<header
		class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
	>
		<div class="container mx-auto flex h-16 items-center justify-between px-4">
			<div class="flex items-center gap-6">
				<a href="/" class="flex items-center space-x-2">
					<Code2 class="h-6 w-6 text-primary" />
					<span class="inline-block text-xl font-bold tracking-tight">Racury OJ</span>
				</a>

				<nav class="hidden items-center space-x-1 text-sm font-medium md:flex">
					{#each navItems as item}
						<Button variant="ghost" href={item.href} class="flex items-center gap-2">
							<item.icon class="h-4 w-4" />
							{item.name}
						</Button>
					{/each}
				</nav>
			</div>

			<div class="flex items-center gap-4">
				<form action="/problems" method="GET" class="relative hidden w-64 items-center lg:flex">
					<Search class="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						name="q"
						type="search"
						placeholder="문제 검색..."
						class="border-none bg-muted/50 pl-9 focus-visible:ring-1"
					/>
				</form>

				<div class="flex items-center gap-2">
					<Separator orientation="vertical" class="h-6" />

					{#if user}
						<div class="flex items-center gap-3 pl-2">
							<div class="hidden flex-col items-end sm:flex">
								<a
									href={`/profile/${user.id}`}
									class="text-sm leading-none font-medium transition-colors hover:text-primary"
									>{user.name}</a
								>
								<form method="post" action="/signin?/signOut">
									<button
										type="submit"
										class="text-xs text-muted-foreground transition-colors hover:text-primary"
										>로그아웃</button
									>
								</form>
							</div>
							<Avatar.Root class="h-9 w-9 border border-border">
								{#if user.image}
									<Avatar.Image src={user.image} alt={user.name} />
								{/if}
								<Avatar.Fallback>{user.name?.charAt(0) ?? 'U'}</Avatar.Fallback>
							</Avatar.Root>
						</div>
					{:else}
						<a
							href="/signin"
							class="flex items-center gap-3 pl-2 transition-opacity hover:opacity-80"
						>
							<div class="hidden flex-col items-end sm:flex">
								<span class="text-sm leading-none font-medium">게스트</span>
								<span class="text-xs text-muted-foreground">로그인하여 제출하기</span>
							</div>
							<Avatar.Root class="h-9 w-9 border border-border">
								<Avatar.Fallback><User class="h-5 w-5" /></Avatar.Fallback>
							</Avatar.Root>
						</a>
					{/if}
				</div>
			</div>
		</div>
	</header>

	<!-- Main Content -->
	<main class="flex-1">
		{@render children()}
	</main>

	<!-- Footer -->
	<footer class="border-t bg-muted/30 py-8">
		<div class="container mx-auto px-4 text-center text-sm text-muted-foreground">
			<p>© 2024 Racury Online Judge. All rights reserved.</p>
		</div>
	</footer>
</div>
