<script lang="ts">
	import type { GridScale } from '../../types/canvas.js';
	import { IMPERIAL_SCALES, METRIC_SCALES } from '../../types/canvas.js';

	let {
		unit,
		value,
		onchange
	}: {
		unit: 'ft' | 'm';
		value: GridScale;
		onchange: (scale: GridScale) => void;
	} = $props();

	const options = $derived(unit === 'm' ? METRIC_SCALES : IMPERIAL_SCALES);

	function handleChange(e: Event) {
		const target = e.target as HTMLSelectElement;
		onchange(target.value as GridScale);
	}
</script>

<label class="flex items-center gap-2 text-sm text-foreground">
	<span>Grid Scale</span>
	<select
		aria-label="Grid Scale"
		{value}
		onchange={handleChange}
		class="rounded-md border border-border bg-input px-2 py-1 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-ring"
	>
		{#each options as option (option)}
			<option value={option}>{option}</option>
		{/each}
	</select>
</label>
