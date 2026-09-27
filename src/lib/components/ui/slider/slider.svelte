<script lang="ts">
	import { Slider } from 'bits-ui';
	import { cn } from '$lib/utils';

	let {
		value = $bindable(),
		onValueChange,
		class: className,
		...restProps
	}: Slider.RootProps = $props();
</script>

<Slider.Root
	bind:value
	onValueChange={(v) => {
		if (onValueChange) onValueChange(v as any);
		else value = v as any;
	}}
	type="multiple"
	class={cn('relative flex w-full touch-none items-center py-4 select-none', className)}
	{...restProps}
>
	{#snippet children({ thumbItems })}
		<span
			class="relative h-1.5 w-full grow overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
		>
			<Slider.Range class="absolute h-full bg-primary" />
		</span>
		{#each thumbItems as thumb}
			<Slider.Thumb
				index={thumb.index}
				class="block h-5 w-5 cursor-pointer rounded-full border-2 border-primary bg-background shadow-lg transition-colors hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
			/>
		{/each}
	{/snippet}
</Slider.Root>
