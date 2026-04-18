<script lang="ts">
	import type { Property } from '../../types/entities.js';

	let { property }: { property: Property } = $props();
</script>

<header class="border-b border-border bg-surface p-4">
	<h1 class="text-2xl font-bold text-foreground">{property.name}</h1>
	{#if property.dimensions}
		<p class="mt-1 text-sm text-muted">
			{property.dimensions.width} × {property.dimensions.length}
			{property.dimensions.unit}
		</p>
	{/if}
</header>
