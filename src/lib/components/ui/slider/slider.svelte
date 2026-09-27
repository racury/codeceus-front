<script lang="ts">
	import { Slider } from 'bits-ui';
	import { cn } from '$lib/utils';

	// A range (multi-thumb) slider. bits-ui's RootProps is a single|multiple
	// union that TypeScript can't spread through a wrapper, so the props this
	// wrapper supports are declared explicitly.
	type Props = {
		value?: number[];
		onValueChange?: (value: number[]) => void;
		onValueCommit?: (value: number[]) => void;
		min?: number;
		max?: number;
		step?: number;
		disabled?: boolean;
		class?: string;
	};

	let { value = $bindable([]), class: className, ...restProps }: Props = $props();
</script>

<Slider.Root
	type="multiple"
	bind:value
	class={cn('relative flex w-full touch-none items-center py-4 select-none', className)}
	{...restProps}
>
	{#snippet children({ thumbItems })}
		<span
			class="relative h-1.5 w-full grow overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
		>
			<Slider.Range class="absolute h-full bg-primary" />
		</span>
		{#each thumbItems as thumb (thumb.index)}
			<Slider.Thumb
				index={thumb.index}
				class="block h-5 w-5 cursor-pointer rounded-full border-2 border-primary bg-background shadow-lg transition-colors hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
			/>
		{/each}
	{/snippet}
</Slider.Root>
