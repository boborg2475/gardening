import type { Point } from '../types/geometry.js';
import type { AppEvent } from '../types/events.js';

export type DrawingMode = 'idle' | 'placing' | 'complete';

export interface DrawingState {
	mode: DrawingMode;
	points: Point[];
	previewPosition?: Point;
}

export const INITIAL_DRAWING_STATE: DrawingState = {
	mode: 'idle',
	points: [],
	previewPosition: undefined
};

export type DispatchEventFn = (eventData: Omit<AppEvent, 'id' | 'timestamp'>) => Promise<AppEvent>;

export function startDrawing(): DrawingState {
	return {
		mode: 'placing',
		points: [],
		previewPosition: undefined
	};
}

export function addPoint(state: DrawingState, point: Point): DrawingState {
	if (state.mode !== 'placing') {
		return state;
	}
	return {
		...state,
		points: [...state.points, point]
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
		previewPosition: undefined
	};
}

export function cancelDrawing(): DrawingState {
	return {
		mode: 'idle',
		points: [],
		previewPosition: undefined
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
