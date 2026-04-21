<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Mail, Lock, Code2, AlertCircle, User } from '@lucide/svelte';
	import type { ActionData } from './$types';

	let { form }: { form: ActionData } = $props();
</script>

<div class="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50/50 p-4">
	<Card.Root class="w-full max-w-md border-muted-foreground/10 shadow-lg">
		<Card.Header class="space-y-2 text-center">
			<div class="mb-2 flex justify-center">
				<div class="rounded-2xl bg-primary/10 p-3 text-primary">
					<Code2 class="h-8 w-8" />
				</div>
			</div>
			<Card.Title class="text-3xl font-bold tracking-tight">회원가입</Card.Title>
			<Card.Description>Racury OJ의 새로운 회원이 되어보세요</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-6 pt-4">
			{#if form?.message}
				<div
					class="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
				>
					<AlertCircle class="h-4 w-4" />
					<span>{form.message}</span>
				</div>
			{/if}

			<form method="post" action="?/signUpEmail" use:enhance class="space-y-4">
				<div class="space-y-2">
					<Label for="name">이름</Label>
					<div class="relative">
						<User class="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
						<Input id="name" name="name" type="text" placeholder="홍길동" class="pl-10" required />
					</div>
				</div>
				<div class="space-y-2">
					<Label for="email">이메일</Label>
					<div class="relative">
						<Mail class="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
						<Input
							id="email"
							name="email"
							type="email"
							placeholder="name@example.com"
							class="pl-10"
							required
						/>
					</div>
				</div>
				<div class="space-y-2">
					<Label for="password">비밀번호</Label>
					<div class="relative">
						<Lock class="absolute top-3 left-3 h-4 w-4 text-muted-foreground" />
						<Input id="password" name="password" type="password" class="pl-10" required />
					</div>
				</div>
				<Button type="submit" class="h-11 w-full text-base font-semibold">회원가입</Button>
			</form>

			<div class="relative">
				<div class="absolute inset-0 flex items-center">
					<span class="w-full border-t"></span>
				</div>
				<div class="relative flex justify-center text-xs uppercase">
					<span class="bg-card px-2 tracking-widest text-muted-foreground">또는</span>
				</div>
			</div>

			<form method="post" action="?/signInSocial" use:enhance>
				<input type="hidden" name="provider" value="github" />
				<input type="hidden" name="callbackURL" value="/" />
				<Button
					variant="outline"
					type="submit"
					class="h-11 w-full gap-3 border-slate-200 font-medium hover:bg-slate-50"
				>
					<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-github"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
					GitHub으로 가입하기
				</Button>
			</form>
		</Card.Content>
		<Card.Footer class="flex flex-col gap-4 border-t bg-slate-50/50 pt-6">
			<div class="text-center text-sm text-muted-foreground">
				이미 계정이 있으신가요?
				<Button variant="link" class="h-auto p-0 font-semibold" href="/signin">로그인</Button>
			</div>
		</Card.Footer>
	</Card.Root>
</div>
