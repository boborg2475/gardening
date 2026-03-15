import { describe, it, expect } from 'vitest';
import { computeGridLines } from './gridRenderer';

describe('gridRenderer [R6]', () => {
  describe('computeGridLines [R6.1, R6.2]', () => {
    it('returns grid lines covering the visible area', () => {
      // Canvas 200x200, pan=0, zoom=20 (20px per foot)
      // Visible world: 0..10 feet in both axes
      const lines = computeGridLines(200, 200, { x: 0, y: 0 }, 20);
      // Should have vertical and horizontal lines at each foot
      expect(lines.verticals.length).toBeGreaterThanOrEqual(10);
      expect(lines.horizontals.length).toBeGreaterThanOrEqual(10);
    });

    it('produces fewer major lines at low zoom', () => {
      // zoom=2 means 2px per foot, so we should see major lines (every 10 feet)
      const lines = computeGridLines(200, 200, { x: 0, y: 0 }, 2);
      const majorV = lines.verticals.filter((l) => l.isMajor);
      expect(majorV.length).toBeGreaterThan(0);
    });

    it('accounts for pan offset', () => {
      // Pan offset shifts visible world
      const lines = computeGridLines(200, 200, { x: -100, y: -100 }, 20);
      // Visible world starts at (100/20)=5 feet
      const minWorldX = Math.min(...lines.verticals.map((l) => l.worldPos));
      expect(minWorldX).toBeGreaterThanOrEqual(4);
    });
  });
});
