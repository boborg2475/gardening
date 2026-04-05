import type { Point } from '../types/geometry.js';

export const LOUPE_RADIUS = 60;
export const LOUPE_OFFSET = 80;
export const LOUPE_MAGNIFICATION = 3;

export function calculateLoupePosition(
	touchPoint: Point,
	loupeRadius: number,
	offset: number
): Point {
	return {
		x: touchPoint.x,
		y: touchPoint.y - offset
	};
}

export function calculateLoupeViewport(
	touchPoint: Point,
	magnification: number,
	viewportSize: number
): { x: number; y: number; width: number; height: number } {
	const size = viewportSize / magnification;
	return {
		x: touchPoint.x - size / 2,
		y: touchPoint.y - size / 2,
		width: size,
		height: size
	};
}

export function clampLoupePosition(
	loupeCenter: Point,
	canvasWidth: number,
	canvasHeight: number,
	loupeRadius: number
): Point {
	return {
		x: Math.max(loupeRadius, Math.min(canvasWidth - loupeRadius, loupeCenter.x)),
		y: Math.max(loupeRadius, Math.min(canvasHeight - loupeRadius, loupeCenter.y))
	};
}
