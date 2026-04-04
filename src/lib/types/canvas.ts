export type GridScale = '1ft' | '6in' | '1in' | '1m' | '10cm' | '1cm';

export type PanOffset = {
	readonly x: number;
	readonly y: number;
};

export const IMPERIAL_SCALES: GridScale[] = ['1ft', '6in', '1in'];
export const METRIC_SCALES: GridScale[] = ['1m', '10cm', '1cm'];

/** Base ratio: 1 foot = 30 pixels at zoom 1 */
export const BASE_PIXELS_PER_FOOT = 30;

/** 1 meter ≈ 3.28084 feet, so 1m = ~98.4 pixels */
export const BASE_PIXELS_PER_METER = 98.4252;
