import type { GridScale, PanOffset } from '../../types/canvas.js';
import { BASE_PIXELS_PER_FOOT, BASE_PIXELS_PER_METER } from '../../types/canvas.js';

export interface GridLineConfig {
	points: [number, number, number, number];
	stroke: string;
	strokeWidth: number;
	isMajor: boolean;
}

export interface GridLineParams {
	canvasWidth: number;
	canvasHeight: number;
	gridScale: GridScale;
	zoom: number;
	panOffset: PanOffset;
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

export function calculateGridLines(params: GridLineParams): GridLineConfig[] {
	const { canvasWidth, canvasHeight, gridScale, zoom, panOffset } = params;

	if (canvasWidth <= 0 || canvasHeight <= 0) {
		return [];
	}

	// Base spacing in canvas-space pixels (without zoom — Stage transform handles zoom)
	const baseSpacing = getBaseGridSpacing(gridScale);
	const majorInterval = getMajorInterval(gridScale);
	const lines: GridLineConfig[] = [];

	// Convert viewport bounds to canvas space
	const viewLeft = -panOffset.x / zoom;
	const viewTop = -panOffset.y / zoom;
	const viewRight = viewLeft + canvasWidth / zoom;
	const viewBottom = viewTop + canvasHeight / zoom;

	// Find first grid line index visible in viewport
	const startCol = Math.floor(viewLeft / baseSpacing) - 1;
	const endCol = Math.ceil(viewRight / baseSpacing) + 1;
	const startRow = Math.floor(viewTop / baseSpacing) - 1;
	const endRow = Math.ceil(viewBottom / baseSpacing) + 1;

	// Vertical lines
	for (let col = startCol; col <= endCol; col++) {
		const x = col * baseSpacing;
		const isMajor = col % majorInterval === 0;
		lines.push({
			points: [x, viewTop - baseSpacing, x, viewBottom + baseSpacing],
			stroke: isMajor ? '#888' : '#ccc',
			strokeWidth: isMajor ? 1.5 : 0.75,
			isMajor
		});
	}

	// Horizontal lines
	for (let row = startRow; row <= endRow; row++) {
		const y = row * baseSpacing;
		const isMajor = row % majorInterval === 0;
		lines.push({
			points: [viewLeft - baseSpacing, y, viewRight + baseSpacing, y],
			stroke: isMajor ? '#888' : '#ccc',
			strokeWidth: isMajor ? 1.5 : 0.75,
			isMajor
		});
	}

	return lines;
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
