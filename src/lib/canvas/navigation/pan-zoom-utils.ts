import { MIN_ZOOM, MAX_ZOOM } from '../../stores/navigation-context.svelte.js';

export interface Point {
	x: number;
	y: number;
}

export interface WheelZoomParams {
	deltaY: number;
	currentZoom: number;
	cursorPosition: Point;
	stagePosition: Point;
}

export interface WheelZoomResult {
	newZoom: number;
	newPosition: Point;
}

export interface PinchZoomParams {
	previousDistance: number;
	currentDistance: number;
	midpoint: Point;
	currentZoom: number;
	stagePosition: Point;
}

export interface PinchZoomResult {
	newZoom: number;
	newPosition: Point;
}

export interface PanOffsetParams {
	dragStart: Point;
	dragEnd: Point;
	currentOffset: Point;
}

const ZOOM_SCALE_FACTOR = 1.05;

export function clampZoom(zoom: number): number {
	return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
}

export function getDistanceBetweenPoints(p1: Point, p2: Point): number {
	const dx = p2.x - p1.x;
	const dy = p2.y - p1.y;
	return Math.sqrt(dx * dx + dy * dy);
}

export function getMidpoint(p1: Point, p2: Point): Point {
	return {
		x: (p1.x + p2.x) / 2,
		y: (p1.y + p2.y) / 2
	};
}

export function calculateWheelZoom(params: WheelZoomParams): WheelZoomResult {
	const { deltaY, currentZoom, cursorPosition, stagePosition } = params;

	// Negative deltaY = scroll up = zoom in
	const direction = deltaY < 0 ? 1 : -1;
	const newZoom = clampZoom(currentZoom * Math.pow(ZOOM_SCALE_FACTOR, direction * 3));

	// Adjust position to keep cursor point stable
	const mousePointTo = {
		x: (cursorPosition.x - stagePosition.x) / currentZoom,
		y: (cursorPosition.y - stagePosition.y) / currentZoom
	};

	const newPosition = {
		x: cursorPosition.x - mousePointTo.x * newZoom,
		y: cursorPosition.y - mousePointTo.y * newZoom
	};

	return { newZoom, newPosition };
}

export function calculatePinchZoom(params: PinchZoomParams): PinchZoomResult {
	const { previousDistance, currentDistance, midpoint, currentZoom, stagePosition } = params;

	const scale = currentDistance / previousDistance;
	const newZoom = clampZoom(currentZoom * scale);

	// Adjust position to keep midpoint stable
	const pointTo = {
		x: (midpoint.x - stagePosition.x) / currentZoom,
		y: (midpoint.y - stagePosition.y) / currentZoom
	};

	const newPosition = {
		x: midpoint.x - pointTo.x * newZoom,
		y: midpoint.y - pointTo.y * newZoom
	};

	return { newZoom, newPosition };
}

export function calculatePanOffset(params: PanOffsetParams): Point {
	const { dragStart, dragEnd, currentOffset } = params;
	return {
		x: currentOffset.x + (dragEnd.x - dragStart.x),
		y: currentOffset.y + (dragEnd.y - dragStart.y)
	};
}
