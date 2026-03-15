import { useEffect, useRef, useCallback } from 'react';
import { CanvasEngine } from '../canvas/CanvasEngine';
import { createGridRenderer } from '../canvas/renderers/gridRenderer';
import { createShapeRenderer } from '../canvas/renderers/shapeRenderer';
import { createSelectionRenderer } from '../canvas/renderers/selectionRenderer';
import { SelectTool } from '../canvas/tools/SelectTool';
import { RectangleTool } from '../canvas/tools/RectangleTool';
import { PolygonTool } from '../canvas/tools/PolygonTool';
import { useUIStore } from '../store/uiStore';
import type { Tool } from '../canvas/tools/Tool';
import type { ToolType } from '../types/garden';
import styles from '../App.module.css';

function createToolForType(toolType: ToolType): Tool {
  switch (toolType) {
    case 'select':
      return new SelectTool();
    case 'rectangle':
      return new RectangleTool();
    case 'polygon_zone':
      return new PolygonTool('polygon_zone');
    case 'property_boundary':
      return new PolygonTool('property_boundary');
    case 'house_outline':
      return new PolygonTool('house_outline');
  }
}

export function CanvasView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<CanvasEngine | null>(null);
  const toolRef = useRef<Tool>(new SelectTool());
  const isPanning = useRef(false);
  const lastPanPos = useRef({ x: 0, y: 0 });

  // Sync tool with store
  const activeTool = useUIStore((s) => s.activeTool);
  useEffect(() => {
    toolRef.current = createToolForType(activeTool);
  }, [activeTool]);

  // Add tool preview renderer
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    engine.addRenderer('toolPreview', {
      render(ctx, eng) {
        toolRef.current.renderPreview?.(ctx, eng);
      },
    });
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const engine = engineRef.current;
    if (!engine) return;

    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const screenPos = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    // Middle mouse or ctrl+left for panning
    if (e.button === 1 || (e.button === 0 && e.ctrlKey)) {
      isPanning.current = true;
      lastPanPos.current = { x: e.clientX, y: e.clientY };
      return;
    }

    if (e.button === 0) {
      const worldPos = engine.screenToWorld(screenPos);
      toolRef.current.onMouseDown?.(worldPos, engine);
    }
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    const engine = engineRef.current;
    if (!engine) return;

    if (isPanning.current) {
      const dx = e.clientX - lastPanPos.current.x;
      const dy = e.clientY - lastPanPos.current.y;
      const pan = engine.getPan();
      engine.setPan({ x: pan.x + dx, y: pan.y + dy });
      useUIStore.getState().setPan(engine.getPan());
      lastPanPos.current = { x: e.clientX, y: e.clientY };
      return;
    }

    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const screenPos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const worldPos = engine.screenToWorld(screenPos);
    toolRef.current.onMouseMove?.(worldPos, engine);
  }, []);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    const engine = engineRef.current;
    if (!engine) return;

    if (isPanning.current) {
      isPanning.current = false;
      return;
    }

    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const screenPos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const worldPos = engine.screenToWorld(screenPos);
    toolRef.current.onMouseUp?.(worldPos, engine);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const engine = engineRef.current;
    if (!engine) return;

    const rect = (e.target as HTMLCanvasElement).getBoundingClientRect();
    const screenPos = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const worldBefore = engine.screenToWorld(screenPos);

    const factor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = engine.getZoom() * factor;
    engine.setZoom(newZoom);

    // Adjust pan to keep cursor at same world position
    const actualZoom = engine.getZoom();
    const newPanX = screenPos.x - worldBefore.x * actualZoom;
    const newPanY = screenPos.y - worldBefore.y * actualZoom;
    engine.setPan({ x: newPanX, y: newPanY });

    useUIStore.getState().setZoom(engine.getZoom());
    useUIStore.getState().setPan(engine.getPan());
  }, []);

  // Initialize engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new CanvasEngine();
    engineRef.current = engine;

    // Set initial pan to center the canvas
    const pan = useUIStore.getState().panOffset;
    engine.setPan(pan);
    engine.setZoom(useUIStore.getState().zoomLevel);

    engine.addRenderer('grid', createGridRenderer());
    engine.addRenderer('shapes', createShapeRenderer());
    engine.addRenderer('selection', createSelectionRenderer());
    engine.addRenderer('toolPreview', {
      render(ctx, eng) {
        toolRef.current.renderPreview?.(ctx, eng);
      },
    });

    // Resize handler
    const resize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    engine.attach(canvas);

    return () => {
      engine.detach();
      observer.disconnect();
    };
  }, []);

  // Keyboard handler
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      toolRef.current.onKeyDown?.(e);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className={styles.canvasArea}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
      />
    </div>
  );
}
