<script lang="ts">
	import { onMount } from 'svelte';
	import { Stage, Layer, Line, Circle } from 'svelte-konva';
	import type { Property } from '../../types/entities.js';
	import {
		createNavigationContext,
		getDefaultGridScale
	} from '../../stores/navigation-context.svelte.js';
	import { calculateGridLines, getPropertyBounds } from './grid-renderer.js';
	import {
		calculateWheelZoom,
		calculatePinchZoom,
		getDistanceBetweenPoints,
		getMidpoint,
		clampPanOffset
	} from '../navigation/pan-zoom-utils.js';
	import { setupTestHooks } from '../test-hooks.js';
	import type { GridScale } from '../../types/canvas.js';
	import { createDrawingStore } from '../../stores/drawing-store.svelte.js';
	import { createPrecisionToolsStore } from '../../stores/precision-tools-store.svelte.js';
	import { screenToCanvas, getHitRadius, BASE_HIT_RADIUS_PX } from '../drawing/coordinate-utils.js';
	import { isNearFirstPoint } from '../../domain/polygon-drawing.js';
	import { getProperties } from '../../stores/materialized-state.svelte.js';
	import { createLogger } from '../../utils/logger.js';
	import {
		CANVAS_BACKGROUND,
		DRAWING_STROKE,
		DRAWING_STROKE_WIDTH,
		DRAWING_PREVIEW_STROKE,
		DRAWING_PREVIEW_WIDTH,
		DRAWING_PREVIEW_DASH,
		DRAWING_POINT_FILL,
		DRAWING_POINT_FIRST_FILL,
		DRAWING_POINT_STROKE,
		DRAWING_POINT_STROKE_WIDTH,
		BOUNDARY_STROKE,
		BOUNDARY_STROKE_WIDTH,
		BOUNDARY_FILL
	} from '../canvas-theme.js';

	const log = createLogger('canvas');

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
	let isPanning = false;
	let panStart = { x: 0, y: 0 };
	let didPan = false;

	const stageWidth = $derived(containerWidth);
	const stageHeight = $derived(containerHeight);
	const stageScaleX = $derived(navigationContext.zoomLevel);
	const stageScaleY = $derived(navigationContext.zoomLevel);
	const stageX = $derived(navigationContext.panOffset.x);
	const stageY = $derived(navigationContext.panOffset.y);

	// Property bounds in canvas-space pixels
	const propertyBounds = $derived(
		property.dimensions ? getPropertyBounds(property.dimensions) : undefined
	);

	const gridLines = $derived(
		calculateGridLines({
			canvasWidth: containerWidth,
			canvasHeight: containerHeight,
			gridScale: navigationContext.gridScale,
			zoom: navigationContext.zoomLevel,
			panOffset: navigationContext.panOffset,
			propertyBounds
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

	function applyClampedPan(offset: { x: number; y: number }) {
		if (!propertyBounds) {
			navigationContext.setPanOffset(offset);
			return;
		}
		const clamped = clampPanOffset({
			panOffset: offset,
			zoom: navigationContext.zoomLevel,
			viewportWidth: containerWidth,
			viewportHeight: containerHeight,
			boundsLeft: propertyBounds.left,
			boundsTop: propertyBounds.top,
			boundsRight: propertyBounds.right,
			boundsBottom: propertyBounds.bottom
		});
		navigationContext.setPanOffset(clamped);
	}

	function handleMouseDown(e: MouseEvent) {
		if (drawingStore.isActive || drawingStore.isConfirming) return;
		isPanning = true;
		didPan = false;
		panStart = { x: e.clientX, y: e.clientY };
	}

	function handleMouseUp() {
		isPanning = false;
	}

	function handleCanvasClick(e: MouseEvent) {
		// Suppress click after a pan drag
		if (didPan) {
			didPan = false;
			return;
		}
		log.debug('click — mode:', drawingStore.mode, 'isActive:', drawingStore.isActive);
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
		if (!containerEl) return;

		// Handle panning
		if (isPanning) {
			const dx = e.clientX - panStart.x;
			const dy = e.clientY - panStart.y;
			if (dx !== 0 || dy !== 0) didPan = true;
			panStart = { x: e.clientX, y: e.clientY };
			applyClampedPan({
				x: navigationContext.panOffset.x + dx,
				y: navigationContext.panOffset.y + dy
			});
			return;
		}

		// Handle drawing preview
		if (!drawingStore.isActive) return;

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
		applyClampedPan(result.newPosition);
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
		applyClampedPan(result.newPosition);
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
		log.info('mounted, containerEl:', !!containerEl);
		if (!containerEl) return;

		const observer = new ResizeObserver((entries) => {
			for (const entry of entries) {
				containerWidth = entry.contentRect.width;
				containerHeight = entry.contentRect.height;
				log.debug('resize:', containerWidth, 'x', containerHeight);
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
	style="background-color: {CANVAS_BACKGROUND};"
	role="application"
	aria-label="Property map canvas"
	onwheel={handleWheel}
	ontouchmove={handleTouchMove}
	ontouchend={handleTouchEnd}
	onclick={handleCanvasClick}
	onmousedown={handleMouseDown}
	onmouseup={handleMouseUp}
	onmouseleave={handleMouseUp}
	onmousemove={handleCanvasMouseMove}
>
	<Stage
		width={stageWidth}
		height={stageHeight}
		scaleX={stageScaleX}
		scaleY={stageScaleY}
		x={stageX}
		y={stageY}
		bind:node={stageNode}
	>
		<Layer listening={false}>
			{#each gridLines as line (line.points.join(',') + line.isMajor)}
				<Line
					points={line.points}
					stroke={line.stroke}
					strokeWidth={line.strokeWidth / stageScaleX}
					listening={false}
				/>
			{/each}
		</Layer>
		<Layer>
			{#if drawingStore.mode === 'complete' && completedPolygonPoints.length > 0}
				<Line
					points={completedPolygonPoints}
					stroke={BOUNDARY_STROKE}
					strokeWidth={BOUNDARY_STROKE_WIDTH}
					fill={BOUNDARY_FILL}
					closed={true}
					listening={false}
				/>
			{/if}
			{#if drawingStore.isActive && drawingLinePoints.length >= 4}
				<Line
					points={drawingLinePoints}
					stroke={DRAWING_STROKE}
					strokeWidth={DRAWING_STROKE_WIDTH}
					listening={false}
				/>
			{/if}
			{#if drawingStore.isActive && previewLinePoints.length === 4}
				<Line
					points={previewLinePoints}
					stroke={DRAWING_PREVIEW_STROKE}
					strokeWidth={DRAWING_PREVIEW_WIDTH}
					dash={DRAWING_PREVIEW_DASH}
					listening={false}
				/>
			{/if}
			{#each drawingStore.isActive ? drawingStore.points : [] as point, i (i)}
				<Circle
					x={point.x}
					y={point.y}
					radius={6 / navigationContext.zoomLevel}
					fill={i === 0 ? DRAWING_POINT_FIRST_FILL : DRAWING_POINT_FILL}
					stroke={DRAWING_POINT_STROKE}
					strokeWidth={DRAWING_POINT_STROKE_WIDTH / navigationContext.zoomLevel}
					listening={false}
				/>
			{/each}
		</Layer>
	</Stage>
</div>
