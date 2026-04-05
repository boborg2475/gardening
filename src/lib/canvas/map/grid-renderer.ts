import type { GridScale, PanOffset } from '../../types/canvas.js';
import { BASE_PIXELS_PER_FOOT, BASE_PIXELS_PER_METER } from '../../types/canvas.js';

export interface GridLineConfig {
	points: [number, number, number, number];
	stroke: string;
	strokeWidth: number;
	isMajor: boolean;
}

/** Axis-aligned bounding box in canvas-space pixels (zoom=1). */
export interface CanvasBounds {
	left: number;
	top: number;
	right: number;
	bottom: number;
}

export interface GridLineParams {
	canvasWidth: number;
	canvasHeight: number;
	gridScale: GridScale;
	zoom: number;
	panOffset: PanOffset;
	/** When provided, the grid is limited to this region (with padding). */
	propertyBounds?: CanvasBounds;
}

export interface CanvasSize {
	width: number;
	height: number;
	unit: 'ft' | 'm';
}

/** Returns the pixel spacing for one grid unit at the given scale and zoom. */
export function getGridSpacing(gridScale: GridScale, zoom: number): number {
	switch (gridScale) {
		case '1ft':
			return BASE_PIXELS_PER_FOOT * zoom;
		case '6in':
			return (BASE_PIXELS_PER_FOOT / 2) * zoom;
		case '1in':
			return (BASE_PIXELS_PER_FOOT / 12) * zoom;
		case '1m':
			return BASE_PIXELS_PER_METER * zoom;
		case '10cm':
			return (BASE_PIXELS_PER_METER / 10) * zoom;
		case '1cm':
			return (BASE_PIXELS_PER_METER / 100) * zoom;
	}
}

/** How many minor lines make up a major line interval. */
function getMajorInterval(gridScale: GridScale): number {
	switch (gridScale) {
		case '1ft':
			return 10; // every 10 ft
		case '6in':
			return 2; // every 1 ft
		case '1in':
			return 12; // every 1 ft
		case '1m':
			return 10; // every 10 m
		case '10cm':
			return 10; // every 1 m
		case '1cm':
			return 10; // every 10 cm
	}
}

/** Padding around property bounds for grid lines (in grid units). */
const GRID_PADDING_UNITS = 2;

export function calculateGridLines(params: GridLineParams): GridLineConfig[] {
	const { canvasWidth, canvasHeight, gridScale, zoom, panOffset, propertyBounds } = params;

	if (canvasWidth <= 0 || canvasHeight <= 0) {
		return [];
	}

	const baseSpacing = getBaseGridSpacing(gridScale);
	const majorInterval = getMajorInterval(gridScale);
	const lines: GridLineConfig[] = [];

	// Convert viewport bounds to canvas space
	const viewLeft = -panOffset.x / zoom;
	const viewTop = -panOffset.y / zoom;
	const viewRight = viewLeft + canvasWidth / zoom;
	const viewBottom = viewTop + canvasHeight / zoom;

	// Determine grid extent — property bounds with padding, or viewport (legacy)
	const padding = baseSpacing * GRID_PADDING_UNITS;
	const gridLeft = propertyBounds ? propertyBounds.left - padding : viewLeft - baseSpacing;
	const gridTop = propertyBounds ? propertyBounds.top - padding : viewTop - baseSpacing;
	const gridRight = propertyBounds ? propertyBounds.right + padding : viewRight + baseSpacing;
	const gridBottom = propertyBounds ? propertyBounds.bottom + padding : viewBottom + baseSpacing;

	// Only draw lines that are within the visible viewport AND the grid extent
	const clippedLeft = Math.max(viewLeft - baseSpacing, gridLeft);
	const clippedTop = Math.max(viewTop - baseSpacing, gridTop);
	const clippedRight = Math.min(viewRight + baseSpacing, gridRight);
	const clippedBottom = Math.min(viewBottom + baseSpacing, gridBottom);

	if (clippedLeft >= clippedRight || clippedTop >= clippedBottom) {
		return [];
	}

	// Grid line indices within the bounded region
	const startCol = Math.floor(gridLeft / baseSpacing);
	const endCol = Math.ceil(gridRight / baseSpacing);
	const startRow = Math.floor(gridTop / baseSpacing);
	const endRow = Math.ceil(gridBottom / baseSpacing);

	// Vertical lines — only those visible in viewport
	for (let col = startCol; col <= endCol; col++) {
		const x = col * baseSpacing;
		if (x < clippedLeft || x > clippedRight) continue;
		const isMajor = col % majorInterval === 0;
		lines.push({
			points: [x, clippedTop, x, clippedBottom],
			stroke: isMajor ? '#888' : '#ccc',
			strokeWidth: isMajor ? 1.5 : 0.75,
			isMajor
		});
	}

	// Horizontal lines — only those visible in viewport
	for (let row = startRow; row <= endRow; row++) {
		const y = row * baseSpacing;
		if (y < clippedTop || y > clippedBottom) continue;
		const isMajor = row % majorInterval === 0;
		lines.push({
			points: [clippedLeft, y, clippedRight, y],
			stroke: isMajor ? '#888' : '#ccc',
			strokeWidth: isMajor ? 1.5 : 0.75,
			isMajor
		});
	}

	return lines;
}

/**
 * Compute property bounds in canvas-space pixels from dimensions.
 * Property is placed with top-left at origin (0, 0).
 */
export function getPropertyBounds(
	dimensions: { width: number; length: number; unit: 'ft' | 'm' }
): CanvasBounds {
	const pxPerUnit = dimensions.unit === 'm' ? BASE_PIXELS_PER_METER : BASE_PIXELS_PER_FOOT;
	return {
		left: 0,
		top: 0,
		right: dimensions.width * pxPerUnit,
		bottom: dimensions.length * pxPerUnit
	};
}

/** Returns the base pixel spacing for one grid unit at zoom=1. */
function getBaseGridSpacing(gridScale: GridScale): number {
	switch (gridScale) {
		case '1ft':
			return BASE_PIXELS_PER_FOOT;
		case '6in':
			return BASE_PIXELS_PER_FOOT / 2;
		case '1in':
			return BASE_PIXELS_PER_FOOT / 12;
		case '1m':
			return BASE_PIXELS_PER_METER;
		case '10cm':
			return BASE_PIXELS_PER_METER / 10;
		case '1cm':
			return BASE_PIXELS_PER_METER / 100;
	}
}

export function getPropertyCanvasSize(
	dimensions?: { width: number; length: number; unit: 'ft' | 'm' },
	defaultUnit?: 'ft' | 'm'
): CanvasSize {
	if (dimensions) {
		return {
			width: dimensions.width,
			height: dimensions.length,
			unit: dimensions.unit
		};
	}

	const unit = defaultUnit ?? 'ft';
	if (unit === 'm') {
		return { width: 30, height: 30, unit: 'm' };
	}
	return { width: 100, height: 100, unit: 'ft' };
}
