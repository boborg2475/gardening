<script lang="ts">
	import { getProperties } from '$lib/stores/materialized-state.svelte.js';
	import PropertyCreationForm from '$lib/ui/onboarding/PropertyCreationForm.svelte';
	import PropertyHeader from '$lib/ui/panels/PropertyHeader.svelte';
</script>

{#if getProperties().length === 0}
	<main class="flex min-h-screen items-center justify-center">
		<PropertyCreationForm />
	</main>
{:else}
	<PropertyHeader property={getProperties()[0]} />
	<main class="p-4">
		<p class="text-gray-500">Canvas and drawing tools coming soon.</p>
	</main>
{/if}
