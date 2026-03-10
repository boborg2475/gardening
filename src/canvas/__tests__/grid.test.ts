import { describe, it, expect } from 'vitest';
import { getAdaptiveSpacing, renderGrid } from '../renderers/grid';
import type { Viewport } from '../types';

describe('grid adaptive spacing [BEAM-CE-009]', () => {
  it('returns base spacing when zoom is high enough', () => {
    // At zoom=10, spacing=1: screen pixels = 10 >= 10, so no doubling
    expect(getAdaptiveSpacing(1, 10)).toBe(1);
  });

  it('doubles spacing when lines would be too close', () => {
    // At zoom=5, spacing=1: screen pixels = 5 < 10, so double to 2
    // At spacing=2: screen pixels = 10 >= 10, stop
    expect(getAdaptiveSpacing(1, 5)).toBe(2);
  });

  it('doubles multiple times for very low zoom', () => {
    // At zoom=1, spacing=1: 1 < 10 → 2, 2 < 10 → 4, 4 < 10 → 8, 8 < 10 → 16, 16 >= 10 → stop
    expect(getAdaptiveSpacing(1, 1)).toBe(16);
  });

  it('handles fractional zoom', () => {
    // At zoom=0.5, spacing=1: need spacing * 0.5 >= 10 → spacing >= 20
    expect(getAdaptiveSpacing(1, 0.5)).toBe(32);
  });

  it('returns base spacing when already large enough', () => {
    // At zoom=2, spacing=5: screen pixels = 10 >= 10
    expect(getAdaptiveSpacing(5, 2)).toBe(5);
  });
});

describe('renderGrid [BEAM-CE-009, BEAM-CE-010]', () => {
  it('calls canvas drawing methods for grid lines', () => {
    const ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      set strokeStyle(_: string) { /* noop */ },
      set lineWidth(_: number) { /* noop */ },
    } as unknown as CanvasRenderingContext2D;

    const viewport: Viewport = {
      panX: 0,
      panY: 0,
      zoom: 10,
      canvasWidth: 100,
      canvasHeight: 100,
    };

    expect(() =>
      renderGrid(ctx, viewport, { minorSpacing: 1, majorEvery: 5, units: 'imperial' })
    ).not.toThrow();

    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();
  });
});
