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
	toggleSegmentCurve as domainToggleSegmentCurve,
	updateCurveControl as domainUpdateCurveControl,
	enterConfirmation as domainEnterConfirmation,
	adjustConfirmationPoint as domainAdjustConfirmationPoint,
	confirmPolygon as domainConfirmPolygon,
	cancelConfirmation as domainCancelConfirmation,
	INITIAL_DRAWING_STATE,
	type DrawingState,
	type DrawingMode,
	type SegmentMeta
} from '../domain/polygon-drawing.js';
import { commitPropertyBoundary } from '../domain/property.js';
import { createLogger } from '../utils/logger.js';

const log = createLogger('drawing');

export interface DrawingStore {
	readonly mode: DrawingMode;
	readonly points: Point[];
	readonly segments: SegmentMeta[];
	readonly previewPosition: Point | undefined;
	readonly isActive: boolean;
	readonly isConfirming: boolean;
	readonly confirmationPoints: Point[] | undefined;
	readonly confirmationSegments: SegmentMeta[] | undefined;
	start(): void;
	placePoint(point: Point): void;
	updatePreview(position: Point): void;
	close(): void;
	cancel(): void;
	finalize(entityId: string, entityType: string): Promise<AppEvent>;
	finalizeAsBoundary(propertyId: string): Promise<AppEvent>;
	toggleSegmentCurve(segmentIndex: number): void;
	updateCurveControl(segmentIndex: number, controlPoint: Point): void;
	enterConfirmation(): void;
	adjustConfirmationPoint(pointIndex: number, newPosition: Point): void;
	confirmPolygon(): void;
	cancelConfirmation(): void;
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
		get segments() {
			return drawingState.segments;
		},
		get previewPosition() {
			return drawingState.previewPosition;
		},
		get isActive() {
			return drawingState.mode === 'placing';
		},
		get isConfirming() {
			return drawingState.mode === 'confirming';
		},
		get confirmationPoints() {
			return drawingState.confirmationPoints;
		},
		get confirmationSegments() {
			return drawingState.confirmationSegments;
		},
		start() {
			log.info('start drawing');
			drawingState = startDrawing();
		},
		placePoint(point: Point) {
			log.debug('placePoint', point, '— total:', drawingState.points.length + 1);
			drawingState = addPoint(drawingState, point);
		},
		updatePreview(position: Point) {
			drawingState = domainUpdatePreview(drawingState, position);
		},
		close() {
			log.info('close polygon —', drawingState.points.length, 'points');
			drawingState = closePolygon(drawingState);
		},
		cancel() {
			log.info('cancel drawing');
			drawingState = cancelDrawing();
		},
		async finalize(entityId: string, entityType: string): Promise<AppEvent> {
			const event = await commitPolygon(dispatchEvent, entityId, drawingState.points, entityType);
			drawingState = { ...INITIAL_DRAWING_STATE };
			return event;
		},
		async finalizeAsBoundary(propertyId: string): Promise<AppEvent> {
			const event = await commitPropertyBoundary(dispatchEvent, propertyId, drawingState.points);
			drawingState = { ...INITIAL_DRAWING_STATE };
			return event;
		},
		toggleSegmentCurve(segmentIndex: number) {
			drawingState = domainToggleSegmentCurve(drawingState, segmentIndex);
		},
		updateCurveControl(segmentIndex: number, controlPoint: Point) {
			drawingState = domainUpdateCurveControl(drawingState, segmentIndex, controlPoint);
		},
		enterConfirmation() {
			drawingState = domainEnterConfirmation(drawingState);
		},
		adjustConfirmationPoint(pointIndex: number, newPosition: Point) {
			drawingState = domainAdjustConfirmationPoint(drawingState, pointIndex, newPosition);
		},
		confirmPolygon() {
			drawingState = domainConfirmPolygon(drawingState);
		},
		cancelConfirmation() {
			drawingState = domainCancelConfirmation(drawingState);
		}
	};
}
