<script lang="ts">
	import { onMount } from 'svelte';
	import { Stage, Layer, Line, Circle } from 'svelte-konva';
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
	import { createDrawingStore } from '../../stores/drawing-store.svelte.js';
	import { createPrecisionToolsStore } from '../../stores/precision-tools-store.svelte.js';
	import { screenToCanvas, getHitRadius, BASE_HIT_RADIUS_PX } from '../drawing/coordinate-utils.js';
	import { isNearFirstPoint } from '../../domain/polygon-drawing.js';
	import { getProperties } from '../../stores/materialized-state.svelte.js';

	let { property }: { property: Property } = $props();

	const navigationContext = createNavigationContext();
	const drawingStore = createDrawingStore();
	const precisionToolsStore = createPrecisionToolsStore();

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

	// Flatten drawing points for Line config
	const drawingLinePoints = $derived(drawingStore.points.flatMap((p) => [p.x, p.y]));

	// Preview line from last point to cursor
	const previewLinePoints = $derived(
		drawingStore.points.length > 0 && drawingStore.previewPosition
			? [
					drawingStore.points[drawingStore.points.length - 1].x,
					drawingStore.points[drawingStore.points.length - 1].y,
					drawingStore.previewPosition.x,
					drawingStore.previewPosition.y
				]
			: []
	);

	// Completed polygon points (closed)
	const completedPolygonPoints = $derived(
		drawingStore.mode === 'complete' ? drawingStore.points.flatMap((p) => [p.x, p.y]) : []
	);

	const isDraggableOrConfirming = $derived(!drawingStore.isActive && !drawingStore.isConfirming);

	// Set up test hooks immediately with a proxy that reads current state
	setupTestHooks({
		stage: {
			width: () => containerWidth,
			height: () => containerHeight
		},
		navigationContext,
		mode: 'development',
		drawingStore,
		getProperties,
		precisionToolsStore
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

	function handleCanvasClick(e: MouseEvent) {
		if (!drawingStore.isActive || !containerEl) return;

		const rect = containerEl.getBoundingClientRect();
		const screenPoint = {
			x: e.clientX - rect.left,
			y: e.clientY - rect.top
		};
		const canvasPoint = screenToCanvas(
			screenPoint,
			{ x: navigationContext.panOffset.x, y: navigationContext.panOffset.y },
			navigationContext.zoomLevel
		);

		const hitRadius = getHitRadius(BASE_HIT_RADIUS_PX, navigationContext.zoomLevel);
		if (
			isNearFirstPoint(
				{ mode: drawingStore.mode, points: drawingStore.points },
				canvasPoint,
				hitRadius
			)
		) {
			drawingStore.close();
			if (precisionToolsStore.twoStageConfirmEnabled) {
				drawingStore.enterConfirmation();
			}
			return;
		}

		drawingStore.placePoint(canvasPoint);
	}

	function handleCanvasMouseMove(e: MouseEvent) {
		if (!drawingStore.isActive || !containerEl) return;

		const rect = containerEl.getBoundingClientRect();
		const screenPoint = {
			x: e.clientX - rect.left,
			y: e.clientY - rect.top
		};
		const canvasPoint = screenToCanvas(
			screenPoint,
			{ x: navigationContext.panOffset.x, y: navigationContext.panOffset.y },
			navigationContext.zoomLevel
		);

		drawingStore.updatePreview(canvasPoint);
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

	export function startBoundaryDrawing() {
		drawingStore.start();
	}

	export function getDrawingMode() {
		return drawingStore.mode;
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
	onclick={handleCanvasClick}
	onmousemove={handleCanvasMouseMove}
>
	<Stage
		width={stageWidth}
		height={stageHeight}
		scaleX={stageScaleX}
		scaleY={stageScaleY}
		x={stageX}
		y={stageY}
		draggable={isDraggableOrConfirming}
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
		<Layer>
			{#if drawingStore.mode === 'complete' && completedPolygonPoints.length > 0}
				<Line
					config={{
						points: completedPolygonPoints,
						stroke: '#2563eb',
						strokeWidth: 2,
						fill: 'rgba(37, 99, 235, 0.2)',
						closed: true,
						listening: false
					}}
				/>
			{/if}
			{#if drawingStore.isActive && drawingLinePoints.length >= 4}
				<Line
					config={{
						points: drawingLinePoints,
						stroke: '#2563eb',
						strokeWidth: 2,
						listening: false
					}}
				/>
			{/if}
			{#if drawingStore.isActive && previewLinePoints.length === 4}
				<Line
					config={{
						points: previewLinePoints,
						stroke: '#93c5fd',
						strokeWidth: 1,
						dash: [6, 3],
						listening: false
					}}
				/>
			{/if}
			{#each drawingStore.isActive ? drawingStore.points : [] as point, i (i)}
				<Circle
					config={{
						x: point.x,
						y: point.y,
						radius: 6 / navigationContext.zoomLevel,
						fill: i === 0 ? '#22c55e' : '#2563eb',
						stroke: '#ffffff',
						strokeWidth: 2 / navigationContext.zoomLevel,
						listening: false
					}}
				/>
			{/each}
		</Layer>
	</Stage>
</div>
