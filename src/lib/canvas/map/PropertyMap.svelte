<script lang="ts">
	import { onMount } from 'svelte';
	import { Stage, Layer, Line } from 'svelte-konva';
	import type { Property } from '../../types/entities.js';
	import {
		createNavigationContext,
		getDefaultGridScale
	} from '../../stores/navigation-context.svelte.js';
	import { calculateGridLines } from './grid-renderer.js';
	import {
		calculateWheelZoom,
		calculatePinchZoom,
		getDistanceBetweenPoints,
		getMidpoint
	} from '../navigation/pan-zoom-utils.js';
	import { setupTestHooks } from '../test-hooks.js';
	import type { GridScale } from '../../types/canvas.js';

	let { property }: { property: Property } = $props();

	const navigationContext = createNavigationContext();

	// Set default grid scale based on property unit
	$effect(() => {
		const unit = property.dimensions?.unit ?? 'ft';
		navigationContext.setGridScale(getDefaultGridScale(unit));
	});

	let containerEl: HTMLDivElement | undefined = $state(undefined);
	let containerWidth = $state(800);
	let containerHeight = $state(600);
	let stageNode: unknown = $state(undefined);
	let lastPinchDistance = 0;

	const stageWidth = $derived(containerWidth);
	const stageHeight = $derived(containerHeight);
	const stageScaleX = $derived(navigationContext.zoomLevel);
	const stageScaleY = $derived(navigationContext.zoomLevel);
	const stageX = $derived(navigationContext.panOffset.x);
	const stageY = $derived(navigationContext.panOffset.y);

	const gridLines = $derived(
		calculateGridLines({
			canvasWidth: containerWidth,
			canvasHeight: containerHeight,
			gridScale: navigationContext.gridScale,
			zoom: navigationContext.zoomLevel,
			panOffset: navigationContext.panOffset
		})
	);

	// Set up test hooks immediately with a proxy that reads current state
	setupTestHooks({
		stage: {
			width: () => containerWidth,
			height: () => containerHeight
		},
		navigationContext,
		mode: 'development'
	});

	function handleDragEnd(e: unknown) {
		// svelte-konva passes the Konva event object
		const evt = e as { target?: { x(): number; y(): number } };
		const target = evt?.target;
		if (target && typeof target.x === 'function') {
			navigationContext.setPanOffset({
				x: target.x(),
				y: target.y()
			});
		}
	}

	function handleWheel(e: WheelEvent) {
		e.preventDefault();
		if (!containerEl) return;

		const rect = containerEl.getBoundingClientRect();
		const pointer = {
			x: e.clientX - rect.left,
			y: e.clientY - rect.top
		};

		const result = calculateWheelZoom({
			deltaY: e.deltaY,
			currentZoom: navigationContext.zoomLevel,
			cursorPosition: pointer,
			stagePosition: { x: navigationContext.panOffset.x, y: navigationContext.panOffset.y }
		});

		navigationContext.setZoomLevel(result.newZoom);
		navigationContext.setPanOffset(result.newPosition);
	}

	function handleTouchMove(e: TouchEvent) {
		if (e.touches.length !== 2) return;
		e.preventDefault();

		const t1 = { x: e.touches[0].clientX, y: e.touches[0].clientY };
		const t2 = { x: e.touches[1].clientX, y: e.touches[1].clientY };
		const currentDistance = getDistanceBetweenPoints(t1, t2);
		const midpoint = getMidpoint(t1, t2);

		if (lastPinchDistance === 0) {
			lastPinchDistance = currentDistance;
			return;
		}

		const result = calculatePinchZoom({
			previousDistance: lastPinchDistance,
			currentDistance,
			midpoint,
			currentZoom: navigationContext.zoomLevel,
			stagePosition: {
				x: navigationContext.panOffset.x,
				y: navigationContext.panOffset.y
			}
		});

		navigationContext.setZoomLevel(result.newZoom);
		navigationContext.setPanOffset(result.newPosition);
		lastPinchDistance = currentDistance;
	}

	function handleTouchEnd() {
		lastPinchDistance = 0;
	}

	export function getGridScale(): GridScale {
		return navigationContext.gridScale;
	}

	export function setGridScale(scale: GridScale) {
		navigationContext.setGridScale(scale);
	}

	export function getNavigationContext() {
		return navigationContext;
	}

	onMount(() => {
		if (!containerEl) return;

		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				containerWidth = entry.contentRect.width;
				containerHeight = entry.contentRect.height;
			}
		});

		observer.observe(containerEl);

		return () => observer.disconnect();
	});
</script>

<div
	bind:this={containerEl}
	data-testid="property-map"
	class="relative h-full w-full"
	role="application"
	aria-label="Property map canvas"
	onwheel={handleWheel}
	ontouchmove={handleTouchMove}
	ontouchend={handleTouchEnd}
>
	<Stage
		width={stageWidth}
		height={stageHeight}
		scaleX={stageScaleX}
		scaleY={stageScaleY}
		x={stageX}
		y={stageY}
		draggable
		bind:node={stageNode}
		ondragend={handleDragEnd}
	>
		<Layer>
			{#each gridLines as line (line.points.join(',') + line.isMajor)}
				<Line
					config={{
						points: line.points,
						stroke: line.stroke,
						strokeWidth: line.strokeWidth,
						listening: false
					}}
				/>
			{/each}
		</Layer>
	</Stage>
</div>
