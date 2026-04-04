<script lang="ts">
	import { getProperties } from '$lib/stores/materialized-state.svelte.js';
	import PropertyCreationForm from '$lib/ui/onboarding/PropertyCreationForm.svelte';
	import PropertyHeader from '$lib/ui/panels/PropertyHeader.svelte';
	import PropertyMap from '$lib/canvas/map/PropertyMap.svelte';
	import GridScaleSelector from '$lib/ui/shared/GridScaleSelector.svelte';
	import type { GridScale } from '$lib/types/canvas.js';

	let propertyMapRef: PropertyMap | undefined = $state(undefined);

	function handleGridScaleChange(scale: GridScale) {
		propertyMapRef?.setGridScale(scale);
	}
</script>

{#if getProperties().length === 0}
	<main class="flex min-h-screen items-center justify-center">
		<PropertyCreationForm />
	</main>
{:else}
	{@const property = getProperties()[0]}
	<PropertyHeader {property} />
	<div class="relative" style="height: calc(100vh - 4rem);">
		<div class="absolute top-2 right-2 z-10">
			<GridScaleSelector
				unit={property.dimensions?.unit ?? 'ft'}
				value={propertyMapRef?.getGridScale() ?? '1ft'}
				onchange={handleGridScaleChange}
			/>
		</div>
		<PropertyMap bind:this={propertyMapRef} {property} />
	</div>
{/if}
