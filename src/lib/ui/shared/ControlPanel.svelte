<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div
	class="flex items-center gap-2 rounded-lg border border-border bg-surface/90 px-3 py-2 backdrop-blur-sm"
	style="box-shadow: var(--shadow-md);"
>
	{@render children()}
</div>
