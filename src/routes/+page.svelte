<script lang="ts">
	import { getProperties } from '$lib/stores/materialized-state.svelte.js';
	import { dispatchEvent } from '$lib/stores/materialized-state.svelte.js';
	import { setNorthOrientation } from '$lib/domain/property.js';
	import PropertyCreationForm from '$lib/ui/onboarding/PropertyCreationForm.svelte';
	import PropertyHeader from '$lib/ui/panels/PropertyHeader.svelte';
	import PropertyMap from '$lib/canvas/map/PropertyMap.svelte';
	import GridScaleSelector from '$lib/ui/shared/GridScaleSelector.svelte';
	import type { GridScale } from '$lib/types/canvas.js';

	let propertyMapRef: PropertyMap | undefined = $state(undefined);
	let northDegrees = $state('');

	function handleGridScaleChange(scale: GridScale) {
		propertyMapRef?.setGridScale(scale);
	}

	function handleDrawBoundary() {
		propertyMapRef?.startBoundaryDrawing();
	}

	async function handleSetNorth() {
		const properties = getProperties();
		if (properties.length === 0) return;
		const degrees = parseInt(northDegrees, 10);
		if (isNaN(degrees) || degrees < 0 || degrees > 359) return;
		await setNorthOrientation(dispatchEvent, properties[0].id, degrees);
		northDegrees = '';
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
		<div class="absolute top-2 right-2 z-10 flex items-center gap-2">
			<button
				class="rounded bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700"
				onclick={handleDrawBoundary}
			>
				Draw Boundary
			</button>
			<GridScaleSelector
				unit={property.dimensions?.unit ?? 'ft'}
				value={propertyMapRef?.getGridScale() ?? '1ft'}
				onchange={handleGridScaleChange}
			/>
		</div>
		<div class="absolute bottom-2 left-2 z-10 flex items-center gap-2">
			<label class="text-sm font-medium" for="north-orientation">North Orientation</label>
			<input
				id="north-orientation"
				type="number"
				min="0"
				max="359"
				placeholder="0-359"
				class="w-20 rounded border px-2 py-1 text-sm"
				bind:value={northDegrees}
			/>
			<button
				class="rounded bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700"
				onclick={handleSetNorth}
			>
				Set North
			</button>
		</div>
		<PropertyMap bind:this={propertyMapRef} {property} />
	</div>
{/if}
