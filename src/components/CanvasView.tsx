import { useRef, useEffect, useCallback } from 'react';
import { CanvasEngine } from '../canvas/CanvasEngine';
import { renderGrid } from '../canvas/renderers/gridRenderer';
import { renderShapes, renderInProgressPolygon } from '../canvas/renderers/shapeRenderer';
import { renderSelection } from '../canvas/renderers/selectionRenderer';
import { PolygonTool } from '../canvas/tools/PolygonTool';
import { RectangleTool } from '../canvas/tools/RectangleTool';
import { SelectTool } from '../canvas/tools/SelectTool';
import { useProjectStore } from '../store/projectStore';
import { useUIStore } from '../store/uiStore';
import { nanoid } from 'nanoid';
import type { Point, ShapeLayer, Zone } from '../types/garden';
import styles from '../App.module.css';

function getCanvasPos(canvas: HTMLCanvasElement, e: React.MouseEvent | MouseEvent): Point {
  const rect = canvas.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

export function CanvasView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<CanvasEngine | null>(null);
  const polygonToolRef = useRef<PolygonTool | null>(null);
  const rectangleToolRef = useRef<RectangleTool | null>(null);
  const selectToolRef = useRef<SelectTool | null>(null);
  const isPanningRef = useRef(false);
  const lastPanPosRef = useRef<Point>({ x: 0, y: 0 });

  const activeTool = useUIStore((s) => s.activeTool);
  const panOffset = useUIStore((s) => s.panOffset);
  const zoom = useUIStore((s) => s.zoom);

  // Initialize engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new CanvasEngine(canvas);
    engineRef.current = engine;

    engine.resize();
    // Center the origin slightly
    const initialPan = { x: canvas.getBoundingClientRect().width / 3, y: canvas.getBoundingClientRect().height / 3 };
    engine.setTransform({ panOffset: initialPan });
    useUIStore.getState().setPanOffset(initialPan);

    engine.start();

    const handleResize = () => engine.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      engine.stop();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Set up render callbacks
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    engine.clearRenderCallbacks();

    engine.onRender((ctx, transform) => {
      // Grid
      if (useUIStore.getState().showGrid) {
        renderGrid(ctx, transform, engine.width, engine.height);
      }

      // Shapes
      const shapes = useProjectStore.getState().project.shapes;
      renderShapes(ctx, transform, shapes);

      // Selection
      const selId = useUIStore.getState().selectedShapeId;
      const selShape = shapes.find((s) => s.id === selId);
      renderSelection(ctx, transform, selShape);

      // In-progress polygon
      const polyTool = polygonToolRef.current;
      if (polyTool && polyTool.state.vertices.length > 0) {
        renderInProgressPolygon(ctx, transform, polyTool.state.vertices, polyTool.state.cursorWorldPos);
      }

      // In-progress rectangle
      const rectTool = rectangleToolRef.current;
      if (rectTool) {
        const preview = rectTool.getPreviewVertices();
        if (preview) {
          renderInProgressPolygon(ctx, transform, preview, null);
        }
      }
    });
  }, []);

  // Sync transform from UI store to engine
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.setTransform({ panOffset, zoom });
  }, [panOffset, zoom]);

  // Create tools based on active tool
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    polygonToolRef.current = null;
    rectangleToolRef.current = null;
    selectToolRef.current = null;

    const screenToWorld = (p: Point) => engine.screenToWorld(p);
    const worldToScreen = (p: Point) => engine.worldToScreen(p);

    if (activeTool === 'polygon-property' || activeTool === 'polygon-house' || activeTool === 'polygon-zone') {
      const layerMap: Record<string, ShapeLayer> = {
        'polygon-property': 'property',
        'polygon-house': 'house',
        'polygon-zone': 'zone',
      };
      const layer = layerMap[activeTool];

      polygonToolRef.current = new PolygonTool(layer, {
        onComplete: (vertices, shapeLayer) => {
          if (shapeLayer === 'zone') {
            const zone: Zone = {
              id: nanoid(),
              layer: 'zone',
              vertices,
              metadata: {
                name: `Zone ${useProjectStore.getState().project.shapes.filter(s => s.layer === 'zone').length + 1}`,
                color: '#4CAF50',
                sunExposure: 'full',
                soilType: 'loamy',
                notes: '',
              },
            };
            useProjectStore.getState().addShape(zone);
          } else {
            useProjectStore.getState().addShape({
              id: nanoid(),
              layer: shapeLayer,
              vertices,
            });
          }
        },
        screenToWorld,
        worldToScreen,
      });
    } else if (activeTool === 'rectangle-zone') {
      rectangleToolRef.current = new RectangleTool({
        onComplete: (vertices) => {
          const zone: Zone = {
            id: nanoid(),
            layer: 'zone',
            vertices,
            metadata: {
              name: `Zone ${useProjectStore.getState().project.shapes.filter(s => s.layer === 'zone').length + 1}`,
              color: '#4CAF50',
              sunExposure: 'full',
              soilType: 'loamy',
              notes: '',
            },
          };
          useProjectStore.getState().addShape(zone);
        },
        screenToWorld,
      });
    } else if (activeTool === 'select') {
      selectToolRef.current = new SelectTool({
        getShapes: () => useProjectStore.getState().project.shapes,
        getTransform: () => engine.transform,
        screenToWorld,
        onSelect: (id) => useUIStore.getState().setSelectedShapeId(id),
        onMove: (id, dx, dy) => useProjectStore.getState().moveShape(id, dx, dy),
        onDelete: (id) => useProjectStore.getState().removeShape(id),
      });
    }
  }, [activeTool]);

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const pos = getCanvasPos(canvas, e);

    // Middle mouse button = pan
    if (e.button === 1) {
      e.preventDefault();
      isPanningRef.current = true;
      lastPanPosRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    if (e.button !== 0) return;

    if (activeTool === 'select' && selectToolRef.current) {
      selectToolRef.current.handleMouseDown(pos.x, pos.y);
    } else if (activeTool === 'rectangle-zone' && rectangleToolRef.current) {
      rectangleToolRef.current.handleMouseDown(pos.x, pos.y);
    } else if (polygonToolRef.current) {
      polygonToolRef.current.handleClick(pos.x, pos.y);
    }
  }, [activeTool]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Handle panning
    if (isPanningRef.current) {
      const dx = e.clientX - lastPanPosRef.current.x;
      const dy = e.clientY - lastPanPosRef.current.y;
      lastPanPosRef.current = { x: e.clientX, y: e.clientY };
      const current = useUIStore.getState().panOffset;
      useUIStore.getState().setPanOffset({ x: current.x + dx, y: current.y + dy });
      return;
    }

    const pos = getCanvasPos(canvas, e);

    if (activeTool === 'select' && selectToolRef.current) {
      selectToolRef.current.handleMouseMove(pos.x, pos.y);
    } else if (activeTool === 'rectangle-zone' && rectangleToolRef.current) {
      rectangleToolRef.current.handleMouseMove(pos.x, pos.y);
    } else if (polygonToolRef.current) {
      polygonToolRef.current.handleMouseMove(pos.x, pos.y);
    }
  }, [activeTool]);

  const handleMouseUp = useCallback(() => {
    if (isPanningRef.current) {
      isPanningRef.current = false;
      return;
    }

    if (activeTool === 'select' && selectToolRef.current) {
      selectToolRef.current.handleMouseUp();
    } else if (activeTool === 'rectangle-zone' && rectangleToolRef.current) {
      rectangleToolRef.current.handleMouseUp();
    }
  }, [activeTool]);

  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const engine = engineRef.current;
    if (!canvas || !engine) return;

    const pos = getCanvasPos(canvas, e.nativeEvent);
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const currentZoom = useUIStore.getState().zoom;
    const newZoom = Math.max(CanvasEngine.MIN_ZOOM, Math.min(CanvasEngine.MAX_ZOOM, currentZoom * zoomFactor));

    // Zoom toward cursor
    const currentPan = useUIStore.getState().panOffset;
    const scale = CanvasEngine.BASE_SCALE;
    const wx = (pos.x - currentPan.x) / (scale * currentZoom);
    const wy = (pos.y - currentPan.y) / (scale * currentZoom);

    const newPanX = pos.x - wx * scale * newZoom;
    const newPanY = pos.y - wy * scale * newZoom;

    useUIStore.getState().setZoom(newZoom);
    useUIStore.getState().setPanOffset({ x: newPanX, y: newPanY });
  }, []);

  // Keyboard handler
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

      // Select tool shortcuts
      if (selectToolRef.current && activeTool === 'select') {
        selectToolRef.current.handleKeyDown(e.key, useUIStore.getState().selectedShapeId);
      }

      // Escape to cancel polygon drawing
      if (e.key === 'Escape') {
        if (polygonToolRef.current) {
          polygonToolRef.current.reset();
        }
        if (rectangleToolRef.current) {
          rectangleToolRef.current.reset();
        }
        useUIStore.getState().setSelectedShapeId(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTool]);

  return (
    <div className={styles.canvasArea}>
      <canvas
        ref={canvasRef}
        style={{ width: '100%', height: '100%', display: 'block' }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
}
