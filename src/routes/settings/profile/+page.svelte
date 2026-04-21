<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import * as Card from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Avatar, AvatarFallback, AvatarImage } from '$lib/components/ui/avatar';
	import { enhance } from '$app/forms';
	import { ChevronLeft, Save, User, Image as ImageIcon } from '@lucide/svelte';
	import { cn } from '$lib/utils';

	let { data, form } = $props();
	const user = $derived(data.currentUser);
	
	let name = $state(user.name);
	let imageUrl = $state(user.image ?? '');
</script>

<div class="container mx-auto max-w-2xl px-4 py-10">
	<div class="flex flex-col gap-6">
		<Button variant="ghost" size="sm" class="w-fit -ml-2" href={`/profile/${user.id}`}>
			<ChevronLeft class="mr-1 h-4 w-4" /> 프로필로 돌아가기
		</Button>

		<div>
			<h1 class="text-3xl font-bold tracking-tight">프로필 설정</h1>
			<p class="mt-1 text-muted-foreground">공개 프로필 정보를 관리합니다.</p>
		</div>

		<Card.Root>
			<form method="POST" action="?/updateProfile" use:enhance>
				<Card.Header>
					<Card.Title>기본 정보</Card.Title>
					<Card.Description>다른 유저들에게 보여질 닉네임과 사진을 설정하세요.</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-6">
					<!-- Profile Preview -->
					<div class="flex items-center gap-6 p-4 rounded-lg bg-muted/30">
						<Avatar class="h-20 w-20">
							<AvatarImage src={imageUrl} alt={name} />
							<AvatarFallback class="text-xl">{name[0]}</AvatarFallback>
						</Avatar>
						<div>
							<p class="font-bold text-lg">{name}</p>
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
						<p class="text-[0.8rem] text-muted-foreground">
							최소 2글자 이상 입력해주세요.
						</p>
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

					{#if form?.message}
						<p class={cn("text-sm font-medium", form.success ? "text-green-600" : "text-destructive")}>
							{form.message}
						</p>
					{/if}
					
					{#if form?.success}
						<p class="text-sm font-medium text-green-600">
							프로필이 성공적으로 업데이트되었습니다!
						</p>
					{/if}
				</Card.Content>
				<Card.Footer class="border-t px-6 py-4 flex justify-end">
					<Button type="submit" class="gap-2">
						<Save class="h-4 w-4" /> 변경사항 저장
					</Button>
				</Card.Footer>
			</form>
		</Card.Root>
	</div>
</div>
