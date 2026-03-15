import { useRef, useEffect, useCallback } from 'react';
import { CanvasEngine } from '../canvas/CanvasEngine';
import { renderGrid } from '../canvas/renderers/gridRenderer';
import { renderShapes } from '../canvas/renderers/shapeRenderer';
import { renderSelection } from '../canvas/renderers/selectionRenderer';
import { createSelectTool } from '../canvas/tools/SelectTool';
import { createPolygonTool } from '../canvas/tools/PolygonTool';
import { createRectangleTool } from '../canvas/tools/RectangleTool';
import { useProjectStore } from '../store/projectStore';
import { useUIStore } from '../store/uiStore';
import { nanoid } from 'nanoid';
import type { Point, Shape } from '../types/garden';
import type { Tool } from '../canvas/tools/types';

const SHAPE_DEFAULTS: Record<string, { color: string; name: string }> = {
  property: { color: '#4CAF50', name: 'Property' },
  house: { color: '#795548', name: 'House' },
  zonePoly: { color: '#FF9800', name: 'Zone' },
  zoneRect: { color: '#FF9800', name: 'Zone' },
};

export function CanvasView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<CanvasEngine>(new CanvasEngine());
  const toolRef = useRef<Tool | null>(null);
  const isPanningRef = useRef(false);
  const lastPanPosRef = useRef<Point>({ x: 0, y: 0 });

  const activeTool = useUIStore((s) => s.activeTool);

  // Build the active tool
  useEffect(() => {
    const engine = engineRef.current;

    const addShape = (shape: Shape) => {
      useProjectStore.getState().addShape(shape);
      useUIStore.getState().setSelectedShapeId(shape.id);
      useUIStore.getState().setActiveTool('select');
    };

    if (activeTool === 'select') {
      toolRef.current = createSelectTool(
        () => useProjectStore.getState().project.shapes,
        () => useUIStore.getState().selectedShapeId,
        (id) => useUIStore.getState().setSelectedShapeId(id),
        (id, dx, dy) => {
          const shape = useProjectStore.getState().project.shapes.find((s) => s.id === id);
          if (shape) {
            useProjectStore.getState().updateShape(id, {
              points: shape.points.map((p) => ({ x: p.x + dx, y: p.y + dy })),
            });
          }
        },
        (id) => useProjectStore.getState().removeShape(id)
      );
    } else if (activeTool === 'property' || activeTool === 'house' || activeTool === 'zonePoly') {
      const shapeType = activeTool === 'zonePoly' ? 'zone' : activeTool;
      const defaults = SHAPE_DEFAULTS[activeTool] ?? SHAPE_DEFAULTS.zonePoly;
      toolRef.current = createPolygonTool(
        shapeType,
        defaults.color,
        defaults.name,
        (points, type, color, name) => {
          addShape({
            id: nanoid(),
            type,
            points,
            name,
            color,
          });
        },
        (p) => engine.worldToScreen(p)
      );
    } else if (activeTool === 'zoneRect') {
      toolRef.current = createRectangleTool((points) => {
        addShape({
          id: nanoid(),
          type: 'zone',
          points,
          name: `Zone ${nanoid(4)}`,
          color: '#FF9800',
        });
      });
    }
  }, [activeTool]);

  // Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = engineRef.current;
    engine.attach(canvas);

    const render = () => {
      engine.zoom = useUIStore.getState().zoom;
      engine.panOffset = useUIStore.getState().panOffset;
      engine.clear();

      renderGrid(engine);

      const shapes = useProjectStore.getState().project.shapes;
      renderShapes(engine, shapes);

      // Preview
      const previewPoints = toolRef.current?.getPreviewPoints?.() ?? [];
      if (previewPoints.length >= 2) {
        const ctx = engine.ctx;
        if (ctx) {
          const screenPoints = previewPoints.map((p) => engine.worldToScreen(p));
          ctx.beginPath();
          ctx.setLineDash([4, 4]);
          ctx.moveTo(screenPoints[0].x, screenPoints[0].y);
          for (let i = 1; i < screenPoints.length; i++) {
            ctx.lineTo(screenPoints[i].x, screenPoints[i].y);
          }
          ctx.closePath();
          ctx.strokeStyle = '#2196F3';
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.setLineDash([]);
        }
      }

      const selId = useUIStore.getState().selectedShapeId;
      const selShape = shapes.find((s) => s.id === selId);
      renderSelection(engine, selShape);
    };

    engine.startRenderLoop(render);

    const handleResize = () => engine.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      engine.detach();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Pointer events
  const getWorldPoint = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>): Point => {
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      const screenPoint = { x: e.clientX - rect.left, y: e.clientY - rect.top };
      return engineRef.current.screenToWorld(screenPoint);
    },
    []
  );

  const getScreenPoint = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>): Point => {
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    },
    []
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      // Middle mouse or space+click for pan
      if (e.button === 1) {
        isPanningRef.current = true;
        lastPanPosRef.current = { x: e.clientX, y: e.clientY };
        return;
      }
      toolRef.current?.onPointerDown?.({
        worldPoint: getWorldPoint(e),
        screenPoint: getScreenPoint(e),
        shiftKey: e.shiftKey,
      });
    },
    [getWorldPoint, getScreenPoint]
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (isPanningRef.current) {
        const dx = e.clientX - lastPanPosRef.current.x;
        const dy = e.clientY - lastPanPosRef.current.y;
        const current = useUIStore.getState().panOffset;
        const zoom = useUIStore.getState().zoom;
        useUIStore.getState().setPanOffset({
          x: current.x + dx / zoom,
          y: current.y + dy / zoom,
        });
        lastPanPosRef.current = { x: e.clientX, y: e.clientY };
        return;
      }
      toolRef.current?.onPointerMove?.({
        worldPoint: getWorldPoint(e),
        screenPoint: getScreenPoint(e),
        shiftKey: e.shiftKey,
      });
    },
    [getWorldPoint, getScreenPoint]
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (isPanningRef.current) {
        isPanningRef.current = false;
        return;
      }
      toolRef.current?.onPointerUp?.({
        worldPoint: getWorldPoint(e),
        screenPoint: getScreenPoint(e),
        shiftKey: e.shiftKey,
      });
    },
    [getWorldPoint, getScreenPoint]
  );

  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const currentZoom = useUIStore.getState().zoom;
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.min(Math.max(currentZoom * delta, 0.1), 50);
    useUIStore.getState().setZoom(newZoom);
  }, []);

  // Keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo/Redo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        useProjectStore.temporal.getState().undo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        useProjectStore.temporal.getState().redo();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        useProjectStore.temporal.getState().redo();
        return;
      }

      // Escape deselects and resets tool
      if (e.key === 'Escape') {
        useUIStore.getState().setSelectedShapeId(null);
      }

      toolRef.current?.onKeyDown?.(e);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
    />
  );
}
