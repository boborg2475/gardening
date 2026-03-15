import { describe, it, expect, beforeEach } from 'vitest';
import { RectangleTool } from './RectangleTool';
import { CanvasEngine } from '../CanvasEngine';
import { useProjectStore } from '../../store/projectStore';
import { useUIStore } from '../../store/uiStore';

describe('RectangleTool [R9]', () => {
  let tool: RectangleTool;
  let engine: CanvasEngine;

  beforeEach(() => {
    useProjectStore.getState().clearProject();
    useUIStore.getState().setActiveTool('rectangle');
    tool = new RectangleTool();
    engine = new CanvasEngine();
  });

  it('creates a rectangle zone on mousedown then mouseup [R9.1]', () => {
    tool.onMouseDown({ x: 0, y: 0 }, engine);
    tool.onMouseMove({ x: 10, y: 5 }, engine);
    tool.onMouseUp({ x: 10, y: 5 }, engine);

    const zones = useProjectStore.getState().project.zones;
    expect(zones).toHaveLength(1);
    expect(zones[0].vertices).toHaveLength(4);
    // Check corners
    expect(zones[0].vertices).toContainEqual({ x: 0, y: 0 });
    expect(zones[0].vertices).toContainEqual({ x: 10, y: 5 });
  });

  it('sets tool back to select after placing [R9.4]', () => {
    tool.onMouseDown({ x: 0, y: 0 }, engine);
    tool.onMouseUp({ x: 10, y: 5 }, engine);

    expect(useUIStore.getState().activeTool).toBe('select');
  });

  it('does not create zone if start equals end', () => {
    tool.onMouseDown({ x: 5, y: 5 }, engine);
    tool.onMouseUp({ x: 5, y: 5 }, engine);

    expect(useProjectStore.getState().project.zones).toHaveLength(0);
  });
});
