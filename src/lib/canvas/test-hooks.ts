import type { NavigationContext } from '../stores/navigation-context.svelte.js';

export interface StageState {
	width: number;
	height: number;
	gridScale: string;
}

export interface TestHooksAPI {
	getStageState(): StageState;
	getZoomLevel(): number;
	getPanOffset(): { x: number; y: number };
}

export interface SetupTestHooksParams {
	stage: { width(): number; height(): number };
	navigationContext: NavigationContext;
	mode: string;
}

export function setupTestHooks(params: SetupTestHooksParams): void {
	const { stage, navigationContext, mode } = params;

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
		}
	};

	(globalThis as Record<string, unknown>).__propertyMap = hooks;
}
