<script lang="ts">
	import { Slider } from "bits-ui";
	import { cn } from "$lib/utils";

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
	class={cn("relative flex w-full touch-none select-none items-center py-4", className)}
	{...restProps}
>
	{#snippet children({ thumbItems })}
		<span class="relative h-1.5 w-full grow overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
			<Slider.Range class="absolute h-full bg-primary" />
		</span>
		{#each thumbItems as thumb}
			<Slider.Thumb
				index={thumb.index}
				class="block h-5 w-5 rounded-full border-2 border-primary bg-background shadow-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:scale-110 cursor-pointer"
			/>
		{/each}
	{/snippet}
</Slider.Root>
