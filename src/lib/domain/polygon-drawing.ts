import type { Point } from '../types/geometry.js';
import type { AppEvent } from '../types/events.js';

export type SegmentMeta =
	| { type: 'line'; controlPoint?: undefined }
	| { type: 'curve'; controlPoint: Point };

export type DrawingMode = 'idle' | 'placing' | 'complete' | 'confirming';

export interface DrawingState {
	mode: DrawingMode;
	points: Point[];
	segments: SegmentMeta[];
	previewPosition?: Point;
	confirmationPoints?: Point[];
	confirmationSegments?: SegmentMeta[];
}

export const INITIAL_DRAWING_STATE: DrawingState = {
	mode: 'idle',
	points: [],
	segments: [],
	previewPosition: undefined
};

export type DispatchEventFn = (eventData: Omit<AppEvent, 'id' | 'timestamp'>) => Promise<AppEvent>;

export function startDrawing(): DrawingState {
	return {
		mode: 'placing',
		points: [],
		segments: [],
		previewPosition: undefined
	};
}

export function addPoint(state: DrawingState, point: Point): DrawingState {
	if (state.mode !== 'placing') {
		return state;
	}
	const newPoints = [...state.points, point];
	const newSegments: SegmentMeta[] =
		newPoints.length > 1 ? [...state.segments, { type: 'line' }] : [...state.segments];
	return {
		...state,
		points: newPoints,
		segments: newSegments
	};
}

export function updatePreview(state: DrawingState, position: Point): DrawingState {
	if (state.mode !== 'placing') {
		return state;
	}
	return {
		...state,
		previewPosition: position
	};
}

export function isNearFirstPoint(state: DrawingState, position: Point, hitRadius: number): boolean {
	if (state.points.length < 3) {
		return false;
	}
	const first = state.points[0];
	const dx = position.x - first.x;
	const dy = position.y - first.y;
	return Math.sqrt(dx * dx + dy * dy) <= hitRadius;
}

export function closePolygon(state: DrawingState): DrawingState {
	if (state.points.length < 3) {
		return state;
	}
	return {
		mode: 'complete',
		points: [...state.points],
		segments: [...state.segments],
		previewPosition: undefined
	};
}

export function cancelDrawing(): DrawingState {
	return {
		mode: 'idle',
		points: [],
		segments: [],
		previewPosition: undefined
	};
}

export function getDefaultControlPoint(p1: Point, p2: Point): Point {
	return {
		x: (p1.x + p2.x) / 2,
		y: (p1.y + p2.y) / 2
	};
}

export function toggleSegmentCurve(state: DrawingState, segmentIndex: number): DrawingState {
	if (segmentIndex < 0 || segmentIndex >= state.segments.length) return state;
	const newSegments = state.segments.map((seg, i) => {
		if (i !== segmentIndex) return seg;
		if (seg.type === 'line') {
			const p1 = state.points[i];
			const p2 = state.points[i + 1];
			return { type: 'curve' as const, controlPoint: getDefaultControlPoint(p1, p2) };
		}
		return { type: 'line' as const } as SegmentMeta;
	});
	return {
		...state,
		segments: newSegments
	};
}

export function updateCurveControl(
	state: DrawingState,
	segmentIndex: number,
	controlPoint: Point
): DrawingState {
	if (segmentIndex < 0 || segmentIndex >= state.segments.length) return state;
	const seg = state.segments[segmentIndex];
	if (seg.type !== 'curve') return state;

	const newSegments = state.segments.map((s, i) => {
		if (i !== segmentIndex) return s;
		return { type: 'curve' as const, controlPoint };
	});
	return {
		...state,
		segments: newSegments
	};
}

export function enterConfirmation(state: DrawingState): DrawingState {
	if (state.mode !== 'complete') return state;
	return {
		...state,
		mode: 'confirming',
		confirmationPoints: state.points.map((p) => ({ ...p })),
		confirmationSegments: state.segments.map((s) => ({ ...s }))
	};
}

export function adjustConfirmationPoint(
	state: DrawingState,
	pointIndex: number,
	newPosition: Point
): DrawingState {
	if (state.mode !== 'confirming' || !state.confirmationPoints) return state;
	if (pointIndex < 0 || pointIndex >= state.confirmationPoints.length) return state;
	const newConfPoints = state.confirmationPoints.map((p, i) =>
		i === pointIndex ? { ...newPosition } : p
	);
	return {
		...state,
		confirmationPoints: newConfPoints
	};
}

export function confirmPolygon(state: DrawingState): DrawingState {
	if (state.mode !== 'confirming') return state;
	return {
		...state,
		mode: 'complete',
		points: state.confirmationPoints ? [...state.confirmationPoints] : [...state.points],
		segments: state.confirmationSegments ? [...state.confirmationSegments] : [...state.segments],
		confirmationPoints: undefined,
		confirmationSegments: undefined
	};
}

export function cancelConfirmation(state: DrawingState): DrawingState {
	if (state.mode !== 'confirming') return state;
	return {
		...state,
		mode: 'complete',
		confirmationPoints: undefined,
		confirmationSegments: undefined
	};
}

export async function commitPolygon(
	dispatch: DispatchEventFn,
	entityId: string,
	points: Point[],
	entityType: string = 'property'
): Promise<AppEvent> {
	return dispatch({
		type: 'PolygonDrawn',
		entityId,
		entityType,
		payload: { points }
	});
}
