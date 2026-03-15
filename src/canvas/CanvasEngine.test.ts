import { describe, it, expect } from 'vitest';
import { CanvasEngine } from './CanvasEngine';

describe('CanvasEngine [BEAD-005]', () => {
  it('should convert world coordinates to screen coordinates', () => {
    const engine = new CanvasEngine();
    // Default: pan(0,0), zoom(1), with 20px per foot
    const screen = engine.worldToScreen(10, 5);
    expect(screen.x).toBe(200); // 10 * 20
    expect(screen.y).toBe(100); // 5 * 20
  });

  it('should convert screen coordinates to world coordinates', () => {
    const engine = new CanvasEngine();
    const world = engine.screenToWorld(200, 100);
    expect(world.x).toBeCloseTo(10);
    expect(world.y).toBeCloseTo(5);
  });

  it('should apply pan offset in world-to-screen', () => {
    const engine = new CanvasEngine();
    engine.setPan(50, 30);
    const screen = engine.worldToScreen(10, 5);
    // (10 * 20) + 50 = 250, (5 * 20) + 30 = 130
    expect(screen.x).toBe(250);
    expect(screen.y).toBe(130);
  });

  it('should apply zoom in world-to-screen', () => {
    const engine = new CanvasEngine();
    engine.setZoom(2);
    const screen = engine.worldToScreen(10, 5);
    // 10 * 20 * 2 = 400, 5 * 20 * 2 = 200
    expect(screen.x).toBe(400);
    expect(screen.y).toBe(200);
  });

  it('should round-trip world->screen->world', () => {
    const engine = new CanvasEngine();
    engine.setPan(100, -50);
    engine.setZoom(1.5);
    const screen = engine.worldToScreen(15, 25);
    const world = engine.screenToWorld(screen.x, screen.y);
    expect(world.x).toBeCloseTo(15);
    expect(world.y).toBeCloseTo(25);
  });

  it('should have a configurable pixels-per-foot scale', () => {
    const engine = new CanvasEngine(40); // 40 px per foot
    const screen = engine.worldToScreen(10, 5);
    expect(screen.x).toBe(400);
    expect(screen.y).toBe(200);
  });
});
