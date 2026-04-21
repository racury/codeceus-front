<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import * as Avatar from '$lib/components/ui/avatar';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Separator } from '$lib/components/ui/separator';
	import { enhance } from '$app/forms';
	import {
		ChevronLeft,
		Save,
		User,
		Image as ImageIcon,
		Lock,
		KeyRound,
		ShieldCheck
	} from '@lucide/svelte';
	import { cn } from '$lib/utils';

	let { data, form } = $props();
	const user = $derived(data.currentUser);

	let name = $state(user.name);
	let imageUrl = $state(user.image ?? '');

	// Sync local state when user data changes (e.g. after successful server update)
	$effect(() => {
		name = user.name;
		imageUrl = user.image ?? '';
	});

	let activeTab = $state(form?.passwordError ? 'password' : 'general');

	// Update active tab if form error state changes
	$effect(() => {
		if (form?.passwordError) {
			activeTab = 'password';
		}
	});
</script>

<div class="container mx-auto max-w-2xl px-4 py-10">
	<div class="flex flex-col gap-6">
		<Button variant="ghost" size="sm" class="-ml-2 w-fit" href={`/profile/${user.id}`}>
			<ChevronLeft class="mr-1 h-4 w-4" /> 프로필로 돌아가기
		</Button>

		<div>
			<h1 class="text-3xl font-bold tracking-tight">계정 설정</h1>
			<p class="mt-1 text-muted-foreground">프로필 정보 및 보안 설정을 관리합니다.</p>
		</div>

		<Tabs.Root bind:value={activeTab} class="w-full">
			<Tabs.List class="grid w-full grid-cols-2">
				<Tabs.Trigger value="general" class="flex items-center gap-2">
					<User class="h-4 w-4" /> 일반
				</Tabs.Trigger>
				<Tabs.Trigger value="password" class="flex items-center gap-2">
					<Lock class="h-4 w-4" /> 비밀번호
				</Tabs.Trigger>
			</Tabs.List>

			<Tabs.Content value="general" class="mt-6">
				<Card.Root>
					<form
						method="POST"
						action="?/updateProfile"
						use:enhance={() => {
							return async ({ update }) => {
								await update({ reset: false });
							};
						}}
					>
						<Card.Header>
							<Card.Title>기본 정보</Card.Title>
							<Card.Description>다른 유저들에게 보여질 닉네임과 사진을 설정하세요.</Card.Description
							>
						</Card.Header>
						<Card.Content class="space-y-6">
							<!-- Profile Preview -->
							<div class="flex items-center gap-6 rounded-lg bg-muted/30 p-4">
								<Avatar.Root class="h-20 w-20 border border-border shadow-sm">
									<Avatar.Image src={imageUrl} alt={name} />
									<Avatar.Fallback class="text-xl font-bold"
										>{name ? name[0] : '?'}</Avatar.Fallback
									>
								</Avatar.Root>
								<div class="space-y-1">
									<p class="text-lg leading-none font-bold">{name}</p>
									<p class="text-sm text-muted-foreground">{user.email}</p>
								</div>
							</div>

							<div class="space-y-2">
								<Label for="name" class="flex items-center gap-2">
									<User class="h-4 w-4" /> 닉네임
								</Label>
								<Input
									id="name"
									name="name"
									bind:value={name}
									placeholder="사용할 닉네임을 입력하세요"
									required
								/>
								<p class="text-[0.8rem] text-muted-foreground">최소 2글자 이상 입력해주세요.</p>
							</div>

							<div class="space-y-2">
								<Label for="image" class="flex items-center gap-2">
									<ImageIcon class="h-4 w-4" /> 프로필 이미지 URL
								</Label>
								<Input
									id="image"
									name="image"
									bind:value={imageUrl}
									placeholder="https://example.com/image.png"
								/>
								<p class="text-[0.8rem] text-muted-foreground">
									이미지 호스팅 서비스의 직접 링크를 입력하세요.
								</p>
							</div>

							{#if form?.message && form?.action === 'updateProfile'}
								<div
									class={cn(
										'rounded-md border p-3 text-sm font-medium',
										form.success
											? 'border-green-500/20 bg-green-500/10 text-green-600'
											: 'border-destructive/20 bg-destructive/10 text-destructive'
									)}
								>
									{form.message}
								</div>
							{/if}
						</Card.Content>
						<Card.Footer class="flex justify-end border-t px-6 py-4">
							<Button type="submit" class="gap-2 px-6 font-bold">
								<Save class="h-4 w-4" /> 프로필 저장
							</Button>
						</Card.Footer>
					</form>
				</Card.Root>
			</Tabs.Content>

			<Tabs.Content value="password" class="mt-6">
				<Card.Root>
					<form
						method="POST"
						action="?/changePassword"
						use:enhance={() => {
							return async ({ update }) => {
								await update();
							};
						}}
					>
						<Card.Header>
							<Card.Title>{data.hasPassword ? '비밀번호 변경' : '비밀번호 설정'}</Card.Title>
							<Card.Description>
								{data.hasPassword
									? '주기적으로 비밀번호를 변경하여 계정을 안전하게 보호하세요.'
									: '계정에 비밀번호를 설정하여 이메일로도 로그인할 수 있습니다.'}
							</Card.Description>
						</Card.Header>
						<Card.Content class="space-y-6">
							{#if data.hasPassword}
								<div class="space-y-2">
									<Label for="currentPassword" class="flex items-center gap-2">
										<KeyRound class="h-4 w-4" /> 현재 비밀번호
									</Label>
									<Input
										id="currentPassword"
										name="currentPassword"
										type="password"
										placeholder="••••••••"
										required
									/>
								</div>

								<Separator />
							{/if}

							<div class="space-y-2">
								<Label for="newPassword" class="flex items-center gap-2">
									<Lock class="h-4 w-4" /> {data.hasPassword ? '새 비밀번호' : '비밀번호'}
								</Label>
								<Input
									id="newPassword"
									name="newPassword"
									type="password"
									placeholder="••••••••"
									required
								/>
								<p class="text-[0.8rem] text-muted-foreground">
									최소 8자 이상의 영문, 숫자, 특수문자 조합을 권장합니다.
								</p>
							</div>

							<div class="space-y-2">
								<Label for="confirmPassword" class="flex items-center gap-2">
									<ShieldCheck class="h-4 w-4" /> {data.hasPassword
										? '새 비밀번호 확인'
										: '비밀번호 확인'}
								</Label>
								<Input
									id="confirmPassword"
									name="confirmPassword"
									type="password"
									placeholder="••••••••"
									required
								/>
							</div>

							{#if form?.message && form?.action === 'changePassword'}
								<div
									class={cn(
										'rounded-md border p-3 text-sm font-medium',
										form.success
											? 'border-green-500/20 bg-green-500/10 text-green-600'
											: 'border-destructive/20 bg-destructive/10 text-destructive'
									)}
								>
									{form.message}
								</div>
							{/if}
						</Card.Content>
						<Card.Footer class="flex justify-end border-t px-6 py-4">
							<Button type="submit" variant="default" class="gap-2 px-6 font-bold">
								<Lock class="h-4 w-4" />
								{data.hasPassword ? '비밀번호 업데이트' : '비밀번호 설정 완료'}
							</Button>
						</Card.Footer>
					</form>
				</Card.Root>
			</Tabs.Content>
		</Tabs.Root>
	</div>
</div>
