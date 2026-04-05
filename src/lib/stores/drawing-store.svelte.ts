import type { Point } from '../types/geometry.js';
import type { AppEvent } from '../types/events.js';
import { dispatchEvent } from './materialized-state.svelte.js';
import {
	startDrawing,
	addPoint,
	updatePreview as domainUpdatePreview,
	closePolygon,
	cancelDrawing,
	commitPolygon,
	INITIAL_DRAWING_STATE,
	type DrawingState,
	type DrawingMode
} from '../domain/polygon-drawing.js';

export interface DrawingStore {
	readonly mode: DrawingMode;
	readonly points: Point[];
	readonly previewPosition: Point | undefined;
	readonly isActive: boolean;
	start(): void;
	placePoint(point: Point): void;
	updatePreview(position: Point): void;
	close(): void;
	cancel(): void;
	finalize(entityId: string, entityType: string): Promise<AppEvent>;
}

export function createDrawingStore(): DrawingStore {
	let drawingState = $state<DrawingState>({ ...INITIAL_DRAWING_STATE });

	return {
		get mode() {
			return drawingState.mode;
		},
		get points() {
			return drawingState.points;
		},
		get previewPosition() {
			return drawingState.previewPosition;
		},
		get isActive() {
			return drawingState.mode === 'placing';
		},
		start() {
			drawingState = startDrawing();
		},
		placePoint(point: Point) {
			drawingState = addPoint(drawingState, point);
		},
		updatePreview(position: Point) {
			drawingState = domainUpdatePreview(drawingState, position);
		},
		close() {
			drawingState = closePolygon(drawingState);
		},
		cancel() {
			drawingState = cancelDrawing();
		},
		async finalize(entityId: string, entityType: string): Promise<AppEvent> {
			const event = await commitPolygon(dispatchEvent, entityId, drawingState.points, entityType);
			drawingState = { ...INITIAL_DRAWING_STATE };
			return event;
		}
	};
}
