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
function getGridSpacing(gridScale: GridScale, zoom: number): number {
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

	const spacing = getGridSpacing(gridScale, zoom);
	const majorInterval = getMajorInterval(gridScale);
	const lines: GridLineConfig[] = [];

	// Calculate the offset so grid lines shift with pan
	const offsetX = panOffset.x % spacing;
	const offsetY = panOffset.y % spacing;

	// Determine the index offset for major line calculation
	const startIndexX = -Math.ceil((panOffset.x - offsetX) / spacing);
	const startIndexY = -Math.ceil((panOffset.y - offsetY) / spacing);

	// Vertical lines
	const numVertical = Math.ceil(canvasWidth / spacing) + 2;
	for (let i = 0; i < numVertical; i++) {
		const x = offsetX + i * spacing;
		const index = startIndexX + i;
		const isMajor = index % majorInterval === 0;
		lines.push({
			points: [x, 0, x, canvasHeight],
			stroke: isMajor ? '#999' : '#ddd',
			strokeWidth: isMajor ? 1.5 : 0.5,
			isMajor
		});
	}

	// Horizontal lines
	const numHorizontal = Math.ceil(canvasHeight / spacing) + 2;
	for (let i = 0; i < numHorizontal; i++) {
		const y = offsetY + i * spacing;
		const index = startIndexY + i;
		const isMajor = index % majorInterval === 0;
		lines.push({
			points: [0, y, canvasWidth, y],
			stroke: isMajor ? '#999' : '#ddd',
			strokeWidth: isMajor ? 1.5 : 0.5,
			isMajor
		});
	}

	return lines;
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
