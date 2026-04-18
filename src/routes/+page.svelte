<script lang="ts">
	import { getProperties } from '$lib/stores/materialized-state.svelte.js';
	import { dispatchEvent } from '$lib/stores/materialized-state.svelte.js';
	import { setNorthOrientation } from '$lib/domain/property.js';
	import PropertyCreationForm from '$lib/ui/onboarding/PropertyCreationForm.svelte';
	import PropertyHeader from '$lib/ui/panels/PropertyHeader.svelte';
	import PropertyMap from '$lib/canvas/map/PropertyMap.svelte';
	import GridScaleSelector from '$lib/ui/shared/GridScaleSelector.svelte';
	import ControlPanel from '$lib/ui/shared/ControlPanel.svelte';
	import { PenTool, Compass } from 'lucide-svelte';
	import type { GridScale } from '$lib/types/canvas.js';

	let propertyMapRef: PropertyMap | undefined = $state(undefined);
	let northDegrees = $state('');
	let isDrawing = $state(false);

	function handleGridScaleChange(scale: GridScale) {
		propertyMapRef?.setGridScale(scale);
	}

	function handleDrawBoundary() {
		propertyMapRef?.startBoundaryDrawing();
		isDrawing = true;
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
	<main class="flex min-h-screen items-center justify-center bg-background">
		<PropertyCreationForm />
	</main>
{:else}
	{@const property = getProperties()[0]}
	<div class="flex h-screen flex-col">
		<PropertyHeader {property} />
		<div class="relative min-h-0 flex-1">
			<div class="absolute top-3 right-3 z-10">
				<ControlPanel>
					<button
						class="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring/50 focus:ring-offset-1 {isDrawing
							? 'bg-primary-hover text-primary-foreground ring-2 ring-primary'
							: 'bg-primary text-primary-foreground hover:bg-primary-hover'}"
						onclick={handleDrawBoundary}
					>
						<PenTool size={14} />
						{isDrawing ? 'Drawing...' : 'Draw Boundary'}
					</button>
					<GridScaleSelector
						unit={property.dimensions?.unit ?? 'ft'}
						value={propertyMapRef?.getGridScale() ?? '1ft'}
						onchange={handleGridScaleChange}
					/>
				</ControlPanel>
			</div>
			<div class="absolute bottom-4 left-3 z-10">
				<ControlPanel>
					<Compass size={16} class="text-muted" />
					<label class="text-sm font-medium text-foreground" for="north-orientation"
						>North Orientation</label
					>
					<input
						id="north-orientation"
						type="number"
						min="0"
						max="359"
						placeholder="0-359"
						class="w-20 rounded-md border border-border bg-input px-2 py-1 text-sm text-foreground placeholder-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
						bind:value={northDegrees}
					/>
					<button
						class="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent/50 focus:ring-offset-1"
						onclick={handleSetNorth}
					>
						Set North
					</button>
				</ControlPanel>
			</div>
			<PropertyMap bind:this={propertyMapRef} {property} />
		</div>
	</div>
{/if}
