<script lang="ts">
	import '../app.css';
	import { initialize, isLoading } from '$lib/stores/materialized-state.svelte.js';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		initialize();
	});
</script>

{#if isLoading()}
	<div class="flex h-screen items-center justify-center">
		<p class="text-lg text-gray-500">Loading...</p>
	</div>
{:else}
	{@render children()}
{/if}
