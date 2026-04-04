import type { GridScale, PanOffset } from '../types/canvas.js';

export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 10;

const DEFAULT_ZOOM = 1;
const DEFAULT_PAN: PanOffset = { x: 0, y: 0 };
const DEFAULT_GRID_SCALE: GridScale = '1ft';

export function getDefaultGridScale(unit: 'ft' | 'm'): GridScale {
	return unit === 'm' ? '1m' : '1ft';
}

export interface NavigationContext {
	readonly zoomLevel: number;
	readonly panOffset: PanOffset;
	readonly gridScale: GridScale;
	setZoomLevel(zoom: number): void;
	setPanOffset(offset: PanOffset): void;
	setGridScale(scale: GridScale): void;
	resetView(): void;
}

export function createNavigationContext(): NavigationContext {
	let zoomLevel = $state(DEFAULT_ZOOM);
	let panOffset = $state<PanOffset>({ ...DEFAULT_PAN });
	let gridScale = $state<GridScale>(DEFAULT_GRID_SCALE);

	return {
		get zoomLevel() {
			return zoomLevel;
		},
		get panOffset() {
			return panOffset;
		},
		get gridScale() {
			return gridScale;
		},
		setZoomLevel(zoom: number) {
			zoomLevel = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
		},
		setPanOffset(offset: PanOffset) {
			panOffset = { x: offset.x, y: offset.y };
		},
		setGridScale(scale: GridScale) {
			gridScale = scale;
		},
		resetView() {
			zoomLevel = DEFAULT_ZOOM;
			panOffset = { ...DEFAULT_PAN };
			gridScale = DEFAULT_GRID_SCALE;
		}
	};
}
