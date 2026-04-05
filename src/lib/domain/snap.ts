import type { Point } from '../types/geometry.js';
import type { GridScale } from '../types/canvas.js';
import { BASE_PIXELS_PER_FOOT, BASE_PIXELS_PER_METER } from '../types/canvas.js';

export type SnapScale = GridScale | 'freehand';

export type SnapTarget = {
	type: 'grid' | 'corner' | 'edge' | 'none';
	snappedPoint: Point;
	originalPoint: Point;
	distance: number;
};

export type SnapConfig = {
	gridEnabled: boolean;
	gridScale: SnapScale;
	assistEnabled: boolean;
	snapRadius: number;
};

export type SnapContext = {
	existingPoints: Point[];
	edges: Array<{ p1: Point; p2: Point }>;
};

export function getGridSpacingForScale(scale: SnapScale, zoom: number = 1): number {
	let base: number;
	switch (scale) {
		case '1ft':
			base = BASE_PIXELS_PER_FOOT;
			break;
		case '6in':
			base = BASE_PIXELS_PER_FOOT / 2;
			break;
		case '1in':
			base = BASE_PIXELS_PER_FOOT / 12;
			break;
		case '1m':
			base = BASE_PIXELS_PER_METER;
			break;
		case '10cm':
			base = BASE_PIXELS_PER_METER / 10;
			break;
		case '1cm':
			base = BASE_PIXELS_PER_METER / 100;
			break;
		case 'freehand':
			return 0;
	}
	return base * zoom;
}

function distance(a: Point, b: Point): number {
	const dx = a.x - b.x;
	const dy = a.y - b.y;
	return Math.sqrt(dx * dx + dy * dy);
}

export function snapToGrid(point: Point, gridSpacing: number): SnapTarget {
	if (gridSpacing === 0) {
		return {
			type: 'none',
			snappedPoint: point,
			originalPoint: point,
			distance: 0
		};
	}

	const snappedPoint: Point = {
		x: Math.round(point.x / gridSpacing) * gridSpacing,
		y: Math.round(point.y / gridSpacing) * gridSpacing
	};

	return {
		type: 'grid',
		snappedPoint,
		originalPoint: point,
		distance: distance(point, snappedPoint)
	};
}

export function snapToCorner(
	point: Point,
	existingPoints: Point[],
	snapRadius: number
): SnapTarget | undefined {
	if (existingPoints.length === 0) return undefined;

	let nearest: Point | undefined;
	let nearestDist = Infinity;

	for (const p of existingPoints) {
		const d = distance(point, p);
		if (d <= snapRadius && d < nearestDist) {
			nearestDist = d;
			nearest = p;
		}
	}

	if (!nearest) return undefined;

	return {
		type: 'corner',
		snappedPoint: nearest,
		originalPoint: point,
		distance: nearestDist
	};
}

export function snapToEdge(
	point: Point,
	edges: Array<{ p1: Point; p2: Point }>,
	snapRadius: number
): SnapTarget | undefined {
	if (edges.length === 0) return undefined;

	let bestPoint: Point | undefined;
	let bestDist = Infinity;

	for (const edge of edges) {
		const dx = edge.p2.x - edge.p1.x;
		const dy = edge.p2.y - edge.p1.y;
		const lenSq = dx * dx + dy * dy;

		if (lenSq === 0) continue;

		// Project point onto line, clamped to segment
		let t = ((point.x - edge.p1.x) * dx + (point.y - edge.p1.y) * dy) / lenSq;
		t = Math.max(0, Math.min(1, t));

		const projected: Point = {
			x: edge.p1.x + t * dx,
			y: edge.p1.y + t * dy
		};

		// If projection is at endpoints (t=0 or t=1), the perpendicular projection
		// falls outside the segment
		if (t <= 0 || t >= 1) continue;

		const d = distance(point, projected);
		if (d <= snapRadius && d < bestDist) {
			bestDist = d;
			bestPoint = projected;
		}
	}

	if (!bestPoint) return undefined;

	return {
		type: 'edge',
		snappedPoint: bestPoint,
		originalPoint: point,
		distance: bestDist
	};
}

export function resolveSnap(point: Point, config: SnapConfig, context: SnapContext): SnapTarget {
	// Try corner snap (highest priority)
	if (config.assistEnabled) {
		const corner = snapToCorner(point, context.existingPoints, config.snapRadius);
		if (corner) return corner;

		const edge = snapToEdge(point, context.edges, config.snapRadius);
		if (edge) return edge;
	}

	// Try grid snap
	if (config.gridEnabled) {
		const gridSpacing = getGridSpacingForScale(config.gridScale);
		const gridResult = snapToGrid(point, gridSpacing);
		return gridResult;
	}

	// Nothing enabled
	return {
		type: 'none',
		snappedPoint: point,
		originalPoint: point,
		distance: 0
	};
}
