import type { SnapScale } from '../domain/snap.js';

export interface PrecisionToolsStore {
	readonly snapToGridEnabled: boolean;
	readonly snapScale: SnapScale;
	readonly snapAssistEnabled: boolean;
	readonly loupeEnabled: boolean;
	readonly twoStageConfirmEnabled: boolean;
	setSnapToGrid(enabled: boolean): void;
	setSnapScale(scale: SnapScale): void;
	setSnapAssist(enabled: boolean): void;
	setLoupe(enabled: boolean): void;
	setTwoStageConfirm(enabled: boolean): void;
}

export function createPrecisionToolsStore(): PrecisionToolsStore {
	let snapToGridEnabled = $state(false);
	let snapScale = $state<SnapScale>('1ft');
	let snapAssistEnabled = $state(false);
	let loupeEnabled = $state(false);
	let twoStageConfirmEnabled = $state(false);

	return {
		get snapToGridEnabled() {
			return snapToGridEnabled;
		},
		get snapScale() {
			return snapScale;
		},
		get snapAssistEnabled() {
			return snapAssistEnabled;
		},
		get loupeEnabled() {
			return loupeEnabled;
		},
		get twoStageConfirmEnabled() {
			return twoStageConfirmEnabled;
		},
		setSnapToGrid(enabled: boolean) {
			snapToGridEnabled = enabled;
		},
		setSnapScale(scale: SnapScale) {
			snapScale = scale;
		},
		setSnapAssist(enabled: boolean) {
			snapAssistEnabled = enabled;
		},
		setLoupe(enabled: boolean) {
			loupeEnabled = enabled;
		},
		setTwoStageConfirm(enabled: boolean) {
			twoStageConfirmEnabled = enabled;
		}
	};
}
