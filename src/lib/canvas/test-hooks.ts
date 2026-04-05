import type { NavigationContext } from '../stores/navigation-context.svelte.js';
import type { DrawingStore } from '../stores/drawing-store.svelte.js';
import type { PrecisionToolsStore } from '../stores/precision-tools-store.svelte.js';
import type { Property } from '../types/entities.js';
import type { Point } from '../types/geometry.js';
import { setLogLevel, getLogLevel } from '../utils/logger.js';

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
		confirmationPoints: { x: number; y: number }[] | undefined;
		confirmationSegments: unknown[] | undefined;
	};
	finalizeDrawing(): Promise<void>;
	getProperties(): Property[];
	setPrecisionTools(config: {
		snapToGrid?: boolean;
		snapScale?: string;
		twoStageConfirm?: boolean;
		snapAssist?: boolean;
		loupe?: boolean;
	}): void;
	confirmPolygon(): void;
	cancelConfirmation(): void;
	adjustConfirmationPoint(index: number, point: Point): void;
	finalizeAsBoundary(): Promise<void>;
	getBoundaryState(): { rendered: boolean; points: { x: number; y: number }[] };
	getNorthIndicatorState(): { visible: boolean; degrees: number | undefined };
}

export interface SetupTestHooksParams {
	stage: { width(): number; height(): number };
	navigationContext: NavigationContext;
	mode: string;
	drawingStore?: DrawingStore;
	getProperties?: () => Property[];
	precisionToolsStore?: PrecisionToolsStore;
}

export function setupTestHooks(params: SetupTestHooksParams): void {
	const {
		stage,
		navigationContext,
		mode,
		drawingStore,
		getProperties: getPropertiesFn,
		precisionToolsStore
	} = params;

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
				return {
					mode: 'idle',
					points: [],
					previewPosition: undefined,
					pointCount: 0,
					confirmationPoints: undefined,
					confirmationSegments: undefined
				};
			}
			return {
				mode: drawingStore.mode,
				points: drawingStore.points,
				previewPosition: drawingStore.previewPosition,
				pointCount: drawingStore.points.length,
				confirmationPoints: drawingStore.confirmationPoints,
				confirmationSegments: drawingStore.confirmationSegments
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
		},
		setPrecisionTools(config) {
			if (!precisionToolsStore) return;
			if (config.snapToGrid !== undefined) precisionToolsStore.setSnapToGrid(config.snapToGrid);
			if (config.snapScale !== undefined)
				precisionToolsStore.setSnapScale(
					config.snapScale as Parameters<typeof precisionToolsStore.setSnapScale>[0]
				);
			if (config.twoStageConfirm !== undefined)
				precisionToolsStore.setTwoStageConfirm(config.twoStageConfirm);
			if (config.snapAssist !== undefined) precisionToolsStore.setSnapAssist(config.snapAssist);
			if (config.loupe !== undefined) precisionToolsStore.setLoupe(config.loupe);
		},
		confirmPolygon() {
			drawingStore?.confirmPolygon();
		},
		cancelConfirmation() {
			drawingStore?.cancelConfirmation();
		},
		adjustConfirmationPoint(index, point) {
			drawingStore?.adjustConfirmationPoint(index, point);
		},
		async finalizeAsBoundary() {
			if (!drawingStore || !getPropertiesFn) return;
			const properties = getPropertiesFn();
			if (properties.length > 0) {
				await drawingStore.finalizeAsBoundary(properties[0].id);
			}
		},
		getBoundaryState() {
			const properties = getPropertiesFn ? getPropertiesFn() : [];
			const property = properties[0];
			if (!property || !property.geometry) {
				return { rendered: false, points: [] };
			}
			return { rendered: true, points: property.geometry.points };
		},
		getNorthIndicatorState() {
			const properties = getPropertiesFn ? getPropertiesFn() : [];
			const property = properties[0];
			return {
				visible: property?.northOrientation !== undefined,
				degrees: property?.northOrientation
			};
		}
	};

	(globalThis as Record<string, unknown>).__propertyMap = hooks;
	(globalThis as Record<string, unknown>).__setLogLevel = setLogLevel;
	(globalThis as Record<string, unknown>).__getLogLevel = getLogLevel;
}
