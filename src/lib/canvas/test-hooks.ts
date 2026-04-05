import type { NavigationContext } from '../stores/navigation-context.svelte.js';
import type { DrawingStore } from '../stores/drawing-store.svelte.js';
import type { Property } from '../types/entities.js';

export interface StageState {
	width: number;
	height: number;
	gridScale: string;
}

export interface TestHooksAPI {
	getStageState(): StageState;
	getZoomLevel(): number;
	getPanOffset(): { x: number; y: number };
	startDrawing(): void;
	getDrawingState(): {
		mode: string;
		points: { x: number; y: number }[];
		previewPosition: { x: number; y: number } | undefined;
		pointCount: number;
	};
	finalizeDrawing(): Promise<void>;
	getProperties(): Property[];
}

export interface SetupTestHooksParams {
	stage: { width(): number; height(): number };
	navigationContext: NavigationContext;
	mode: string;
	drawingStore?: DrawingStore;
	getProperties?: () => Property[];
}

export function setupTestHooks(params: SetupTestHooksParams): void {
	const { stage, navigationContext, mode, drawingStore, getProperties: getPropertiesFn } = params;

	if (mode === 'production') {
		return;
	}

	const hooks: TestHooksAPI = {
		getStageState() {
			return {
				width: stage.width(),
				height: stage.height(),
				gridScale: navigationContext.gridScale
			};
		},
		getZoomLevel() {
			return navigationContext.zoomLevel;
		},
		getPanOffset() {
			return { x: navigationContext.panOffset.x, y: navigationContext.panOffset.y };
		},
		startDrawing() {
			drawingStore?.start();
		},
		getDrawingState() {
			if (!drawingStore) {
				return { mode: 'idle', points: [], previewPosition: undefined, pointCount: 0 };
			}
			return {
				mode: drawingStore.mode,
				points: drawingStore.points,
				previewPosition: drawingStore.previewPosition,
				pointCount: drawingStore.points.length
			};
		},
		async finalizeDrawing() {
			if (!drawingStore || !getPropertiesFn) return;
			const properties = getPropertiesFn();
			if (properties.length > 0) {
				await drawingStore.finalize(properties[0].id, 'property');
			}
		},
		getProperties() {
			return getPropertiesFn ? getPropertiesFn() : [];
		}
	};

	(globalThis as Record<string, unknown>).__propertyMap = hooks;
}
