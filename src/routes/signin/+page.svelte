<script lang="ts">
	let isLogin = $state(true);
	let { form } = $props();
</script>

<div class="flex min-h-screen items-center justify-center bg-gray-950 px-4 text-white">
	<div class="w-full max-w-md space-y-8 rounded-2xl border border-gray-800 bg-gray-900 p-8 shadow-2xl">
		<div class="text-center">
			<h1 class="text-3xl font-bold tracking-tight">
				{isLogin ? 'Welcome Back' : 'Create Account'}
			</h1>
			<p class="mt-2 text-sm text-gray-400">Enter your details to access the judge.</p>
		</div>

		<div class="grid grid-cols-1 gap-3">
			<a
				href="/login/github"
				class="flex items-center justify-center gap-2 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 font-medium transition hover:bg-gray-700"
			>
				<svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
					<path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
				</svg>
				Continue with GitHub
			</a>
		</div>

		<div class="relative flex items-center py-2">
			<div class="flex-grow border-t border-gray-800"></div>
			<span class="mx-4 flex-shrink text-xs uppercase text-gray-500">Or continue with email</span>
			<div class="flex-grow border-t border-gray-800"></div>
		</div>

		<form method="POST" action={isLogin ? '?/login' : '?/register'} class="space-y-4">
			<div>
				<label for="email" class="block text-sm font-medium text-gray-400">Email</label>
				<input
					name="email"
					type="email"
					required
					class="mt-1 w-full rounded-lg border border-gray-800 bg-gray-950 px-4 py-2 focus:border-blue-500 focus:outline-none"
				/>
			</div>
			<div>
				<label for="password" class="block text-sm font-medium text-gray-400">Password</label>
				<input
					name="password"
					type="password"
					required
					class="mt-1 w-full rounded-lg border border-gray-800 bg-gray-950 px-4 py-2 focus:border-blue-500 focus:outline-none"
				/>
			</div>

			{#if form?.error}
				<p class="text-sm text-red-500">{form.error}</p>
			{/if}

			<button
				type="submit"
				class="w-full rounded-lg bg-blue-600 py-2.5 font-semibold text-white transition hover:bg-blue-700"
			>
				{isLogin ? 'Sign In' : 'Create Account'}
			</button>
		</form>

		<p class="text-center text-sm text-gray-400">
			{isLogin ? "Don't have an account?" : 'Already have an account?'}
			<button
				onclick={() => (isLogin = !isLogin)}
				class="font-medium text-blue-500 hover:underline"
			>
				{isLogin ? 'Sign Up' : 'Login'}
			</button>
		</p>
	</div>
</div>