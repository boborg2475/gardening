import type { Point } from '../../types/geometry.js';

export const BASE_HIT_RADIUS_PX = 15;

export function screenToCanvas(screenPoint: Point, stagePosition: Point, scale: number): Point {
	return {
		x: (screenPoint.x - stagePosition.x) / scale,
		y: (screenPoint.y - stagePosition.y) / scale
	};
}

export function canvasToScreen(canvasPoint: Point, stagePosition: Point, scale: number): Point {
	return {
		x: canvasPoint.x * scale + stagePosition.x,
		y: canvasPoint.y * scale + stagePosition.y
	};
}

export function getHitRadius(baseRadiusPx: number, scale: number): number {
	return baseRadiusPx / scale;
}
