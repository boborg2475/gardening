import { useRef, useEffect, useCallback } from 'react';
import { CanvasEngine } from '../canvas/CanvasEngine';
import { renderGrid } from '../canvas/renderers/gridRenderer';
import { renderShapes } from '../canvas/renderers/shapeRenderer';
import { renderSelection } from '../canvas/renderers/selectionRenderer';
import { findShapeAtPoint, calculateDragOffsets, applyDragOffsets } from '../canvas/tools/SelectTool';
import { createRectangleZone } from '../canvas/tools/RectangleTool';
import { createPolygonShape } from '../canvas/tools/PolygonTool';
import { useProjectStore } from '../store/projectStore';
import { useUIStore } from '../store/uiStore';
import type { Point, ShapeType } from '../types/garden';
import styles from './CanvasView.module.css';

const CLOSE_THRESHOLD = 10; // pixels for polygon close detection

export function CanvasView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<CanvasEngine | null>(null);

  // Interaction state refs (not React state to avoid re-renders during drag)
  const isPanningRef = useRef(false);
  const lastPointerRef = useRef<Point>({ x: 0, y: 0 });
  const isDraggingShapeRef = useRef(false);
  const dragOffsetsRef = useRef<Point[]>([]);
  const rectStartRef = useRef<Point | null>(null);
  const rectPreviewRef = useRef<Point | null>(null);
  const polygonVerticesRef = useRef<Point[]>([]);

  // Setup engine and render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new CanvasEngine(canvas);
    engineRef.current = engine;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        engine.resize(rect.width, rect.height);
      }
    };

    resize();
    window.addEventListener('resize', resize);

    // Setup renderers
    engine.addRenderer((ctx, eng) => {
      renderGrid(ctx, eng);
    });

    engine.addRenderer((ctx, eng) => {
      const shapes = useProjectStore.getState().project.shapes;
      renderShapes(ctx, eng, shapes);

      // Render rectangle preview
      if (rectStartRef.current && rectPreviewRef.current) {
        const start = rectStartRef.current;
        const end = rectPreviewRef.current;
        const points = [
          eng.worldToScreen(start.x, start.y),
          eng.worldToScreen(end.x, start.y),
          eng.worldToScreen(end.x, end.y),
          eng.worldToScreen(start.x, end.y),
        ];
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
        ctx.closePath();
        ctx.strokeStyle = '#2196F3';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = '#2196F3';
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // Render polygon preview
      const verts = polygonVerticesRef.current;
      if (verts.length > 0) {
        ctx.beginPath();
        const first = eng.worldToScreen(verts[0].x, verts[0].y);
        ctx.moveTo(first.x, first.y);
        for (let i = 1; i < verts.length; i++) {
          const p = eng.worldToScreen(verts[i].x, verts[i].y);
          ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = '#2196F3';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw vertices
        for (const v of verts) {
          const sv = eng.worldToScreen(v.x, v.y);
          ctx.beginPath();
          ctx.arc(sv.x, sv.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#fff';
          ctx.fill();
          ctx.strokeStyle = '#2196F3';
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
    });

    engine.addRenderer((ctx, eng) => {
      const selectedId = useUIStore.getState().selectedShapeId;
      const shapes = useProjectStore.getState().project.shapes;
      const selected = shapes.find((s) => s.id === selectedId);
      renderSelection(ctx, eng, selected);
    });

    // Set initial camera with offset so origin is visible
    engine.setCamera({ x: 200, y: 200 }, 20);

    engine.start();

    return () => {
      engine.stop();
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Sync camera from UI store
  useEffect(() => {
    return useUIStore.subscribe((state) => {
      if (engineRef.current) {
        engineRef.current.setCamera(state.pan, state.zoom);
      }
    });
  }, []);

  const getWorldPos = useCallback((e: React.MouseEvent) => {
    const engine = engineRef.current;
    if (!engine) return { x: 0, y: 0 };
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return engine.screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
  }, []);

  const getScreenPos = useCallback((e: React.MouseEvent): Point => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const tool = useUIStore.getState().activeTool;
    const worldPos = getWorldPos(e);
    const screenPos = getScreenPos(e);

    // Middle mouse or right mouse = pan
    if (e.button === 1 || e.button === 2) {
      isPanningRef.current = true;
      lastPointerRef.current = screenPos;
      useUIStore.getState().setIsPanning(true);
      return;
    }

    // Space+click panning handled elsewhere; for now just tool dispatch
    if (tool === 'select') {
      const shapes = useProjectStore.getState().project.shapes;
      const hit = findShapeAtPoint(worldPos, shapes);
      if (hit) {
        useUIStore.getState().selectShape(hit.id);
        isDraggingShapeRef.current = true;
        dragOffsetsRef.current = calculateDragOffsets(worldPos, hit);
      } else {
        useUIStore.getState().selectShape(null);
        // Start panning on empty area
        isPanningRef.current = true;
        lastPointerRef.current = screenPos;
        useUIStore.getState().setIsPanning(true);
      }
    } else if (tool === 'rectangle') {
      rectStartRef.current = worldPos;
      rectPreviewRef.current = worldPos;
    }
    // Polygon tools handle click in handleClick
  }, [getWorldPos, getScreenPos]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const screenPos = getScreenPos(e);
    const worldPos = getWorldPos(e);

    if (isPanningRef.current) {
      const dx = screenPos.x - lastPointerRef.current.x;
      const dy = screenPos.y - lastPointerRef.current.y;
      const camera = engineRef.current?.getCamera();
      if (camera) {
        const newPan = { x: camera.pan.x + dx, y: camera.pan.y + dy };
        useUIStore.getState().setPan(newPan);
      }
      lastPointerRef.current = screenPos;
      return;
    }

    if (isDraggingShapeRef.current) {
      const selectedId = useUIStore.getState().selectedShapeId;
      if (selectedId) {
        const newPoints = applyDragOffsets(worldPos, dragOffsetsRef.current);
        useProjectStore.getState().updateShape(selectedId, { points: newPoints });
      }
      return;
    }

    if (rectStartRef.current) {
      rectPreviewRef.current = worldPos;
    }
  }, [getWorldPos, getScreenPos]);

  const handleMouseUp = useCallback(() => {
    if (isPanningRef.current) {
      isPanningRef.current = false;
      useUIStore.getState().setIsPanning(false);
      return;
    }

    if (isDraggingShapeRef.current) {
      isDraggingShapeRef.current = false;
      dragOffsetsRef.current = [];
      return;
    }

    // Rectangle tool - commit
    if (rectStartRef.current && rectPreviewRef.current) {
      const start = rectStartRef.current;
      const end = rectPreviewRef.current;
      const dx = Math.abs(end.x - start.x);
      const dy = Math.abs(end.y - start.y);
      if (dx > 0.1 && dy > 0.1) {
        const zone = createRectangleZone(start, end);
        useProjectStore.getState().addShape(zone);
        useUIStore.getState().selectShape(zone.id);
        useUIStore.getState().setTool('select');
      }
      rectStartRef.current = null;
      rectPreviewRef.current = null;
    }
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const tool = useUIStore.getState().activeTool;
    if (!tool.startsWith('polygon-')) return;

    const worldPos = getWorldPos(e);
    const verts = polygonVerticesRef.current;

    // Check if closing the polygon
    if (verts.length >= 3) {
      const engine = engineRef.current;
      if (engine) {
        const firstScreen = engine.worldToScreen(verts[0].x, verts[0].y);
        const clickScreen = getScreenPos(e);
        const dx = clickScreen.x - firstScreen.x;
        const dy = clickScreen.y - firstScreen.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist <= CLOSE_THRESHOLD) {
          // Close polygon
          const shapeType = tool.replace('polygon-', '') as ShapeType;
          const shape = createPolygonShape(verts, shapeType);
          useProjectStore.getState().addShape(shape);
          useUIStore.getState().selectShape(shape.id);
          useUIStore.getState().setTool('select');
          polygonVerticesRef.current = [];
          return;
        }
      }
    }

    polygonVerticesRef.current = [...verts, worldPos];
  }, [getWorldPos, getScreenPos]);

  const handleDoubleClick = useCallback(() => {
    const tool = useUIStore.getState().activeTool;
    if (!tool.startsWith('polygon-')) return;

    const verts = polygonVerticesRef.current;
    if (verts.length < 3) return;

    const shapeType = tool.replace('polygon-', '') as ShapeType;
    const shape = createPolygonShape(verts, shapeType);
    useProjectStore.getState().addShape(shape);
    useUIStore.getState().selectShape(shape.id);
    useUIStore.getState().setTool('select');
    polygonVerticesRef.current = [];
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const engine = engineRef.current;
    if (!engine) return;

    const camera = engine.getCamera();
    const screenPos = getScreenPos(e as unknown as React.MouseEvent);
    const worldBefore = engine.screenToWorld(screenPos.x, screenPos.y);

    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newZoom = Math.min(100, Math.max(0.5, camera.zoom * zoomFactor));

    // Zoom towards cursor
    const newPanX = screenPos.x - worldBefore.x * newZoom;
    const newPanY = screenPos.y - worldBefore.y * newZoom;

    useUIStore.getState().setZoom(newZoom);
    useUIStore.getState().setPan({ x: newPanX, y: newPanY });
  }, [getScreenPos]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  return (
    <div className={styles.canvasContainer}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onWheel={handleWheel}
        onContextMenu={handleContextMenu}
      />
    </div>
  );
}
