import { useRef, useEffect, useCallback } from 'react';
import { CanvasEngine } from '../canvas/CanvasEngine';
import { renderGrid } from '../canvas/renderers/gridRenderer';
import { renderPropertyBoundary, renderHouseOutline, renderZone, renderPolygonPreview } from '../canvas/renderers/shapeRenderer';
import { renderSelection } from '../canvas/renderers/selectionRenderer';
import { RectangleTool } from '../canvas/tools/RectangleTool';
import { PolygonTool } from '../canvas/tools/PolygonTool';
import { SelectTool } from '../canvas/tools/SelectTool';
import { useProjectStore } from '../store/projectStore';
import { useUIStore } from '../store/uiStore';
import { nanoid } from 'nanoid';
import styles from '../App.module.css';

export function CanvasView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<CanvasEngine | null>(null);
  const rectToolRef = useRef<RectangleTool | null>(null);
  const polyToolRef = useRef<PolygonTool | null>(null);
  const selectToolRef = useRef<SelectTool | null>(null);
  const isPanningRef = useRef(false);
  const lastPanPosRef = useRef<{ x: number; y: number } | null>(null);

  const activeTool = useUIStore((s) => s.activeTool);
  const selectedId = useUIStore((s) => s.selectedId);
  const panX = useUIStore((s) => s.panX);
  const panY = useUIStore((s) => s.panY);
  const zoom = useUIStore((s) => s.zoom);

  // Initialize engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new CanvasEngine();
    engineRef.current = engine;

    // Resize canvas
    const resizeCanvas = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    engine.attach(canvas);

    return () => {
      engine.detach();
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // Sync pan/zoom from store to engine
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;
    engine.setPan(panX, panY);
    engine.setZoom(zoom);
  }, [panX, panY, zoom]);

  // Setup tools
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    const addZone = useProjectStore.getState().addZone;
    const setPropertyBoundary = useProjectStore.getState().setPropertyBoundary;
    const setHouseOutline = useProjectStore.getState().setHouseOutline;

    rectToolRef.current = new RectangleTool(engine, (points) => {
      addZone({
        id: nanoid(),
        name: `Zone ${useProjectStore.getState().project.zones.length + 1}`,
        points,
        color: '#4CAF50',
        sunExposure: 'full',
        soilType: 'loam',
        notes: '',
      });
    });

    polyToolRef.current = new PolygonTool(engine, (points) => {
      if (activeTool === 'zone-polygon') {
        addZone({
          id: nanoid(),
          name: `Zone ${useProjectStore.getState().project.zones.length + 1}`,
          points,
          color: '#2196F3',
          sunExposure: 'full',
          soilType: 'loam',
          notes: '',
        });
      } else if (activeTool === 'property-boundary') {
        setPropertyBoundary(points);
      } else if (activeTool === 'house-outline') {
        setHouseOutline(points);
      }
    });

    selectToolRef.current = new SelectTool(engine, {
      getZones: () => useProjectStore.getState().project.zones,
      getPropertyBoundary: () => useProjectStore.getState().project.propertyBoundary,
      getHouseOutline: () => useProjectStore.getState().project.houseOutline,
      onSelect: (id) => useUIStore.getState().select(id),
      onDeselect: () => useUIStore.getState().deselect(),
      onMove: (id, dx, dy) => useProjectStore.getState().moveZone(id, dx, dy),
      onDelete: (id) => {
        useProjectStore.getState().removeZone(id);
        useUIStore.getState().deselect();
      },
    });
  }, [activeTool]);

  // Setup render callbacks
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    engine.clearRenderCallbacks();

    engine.onRender((ctx, eng) => {
      const canvas = eng.getCanvas();
      if (!canvas) return;

      // Grid
      renderGrid(ctx, eng, canvas.width, canvas.height);

      // Project data
      const project = useProjectStore.getState().project;
      const currentSelectedId = useUIStore.getState().selectedId;

      // Property boundary
      if (project.propertyBoundary) {
        renderPropertyBoundary(ctx, eng, project.propertyBoundary);
      }

      // House outline
      if (project.houseOutline) {
        renderHouseOutline(ctx, eng, project.houseOutline);
      }

      // Zones
      for (const zone of project.zones) {
        renderZone(ctx, eng, zone);
      }

      // Selection highlight
      if (currentSelectedId) {
        const selectedZone = project.zones.find((z) => z.id === currentSelectedId);
        if (selectedZone) {
          renderSelection(ctx, eng, selectedZone.points);
        }
      }

      // Tool previews
      const currentTool = useUIStore.getState().activeTool;
      if (currentTool === 'zone-rectangle' && rectToolRef.current) {
        const preview = rectToolRef.current.getPreviewPoints();
        if (preview.length > 0) {
          renderPolygonPreview(ctx, eng, preview, '#4CAF50');
        }
      }

      if (
        (currentTool === 'zone-polygon' || currentTool === 'property-boundary' || currentTool === 'house-outline') &&
        polyToolRef.current
      ) {
        const verts = polyToolRef.current.getVertices();
        const mousePos = polyToolRef.current.getMousePos();
        const allPoints = mousePos ? [...verts, mousePos] : verts;
        if (allPoints.length > 0) {
          const color =
            currentTool === 'property-boundary'
              ? '#333333'
              : currentTool === 'house-outline'
                ? '#555555'
                : '#2196F3';
          renderPolygonPreview(ctx, eng, allPoints, color);
        }
      }
    });
  }, [activeTool, selectedId]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;

      // Middle mouse button or space+left click for panning
      if (e.button === 1) {
        isPanningRef.current = true;
        lastPanPosRef.current = { x: e.clientX, y: e.clientY };
        return;
      }

      if (activeTool === 'select') {
        selectToolRef.current?.onMouseDown(sx, sy);
      } else if (activeTool === 'zone-rectangle') {
        rectToolRef.current?.onMouseDown(sx, sy);
      }
    },
    [activeTool]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      // Panning
      if (isPanningRef.current && lastPanPosRef.current) {
        const dx = e.clientX - lastPanPosRef.current.x;
        const dy = e.clientY - lastPanPosRef.current.y;
        const store = useUIStore.getState();
        store.setPan(store.panX + dx, store.panY + dy);
        lastPanPosRef.current = { x: e.clientX, y: e.clientY };
        return;
      }

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;

      if (activeTool === 'select') {
        selectToolRef.current?.onMouseMove(sx, sy);
      } else if (activeTool === 'zone-rectangle') {
        rectToolRef.current?.onMouseMove(sx, sy);
      } else if (
        activeTool === 'zone-polygon' ||
        activeTool === 'property-boundary' ||
        activeTool === 'house-outline'
      ) {
        polyToolRef.current?.onMouseMove(sx, sy);
      }
    },
    [activeTool]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (isPanningRef.current) {
        isPanningRef.current = false;
        lastPanPosRef.current = null;
        return;
      }

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const sx = e.clientX - rect.left;
      const sy = e.clientY - rect.top;

      if (activeTool === 'select') {
        selectToolRef.current?.onMouseUp(sx, sy);
      } else if (activeTool === 'zone-rectangle') {
        rectToolRef.current?.onMouseUp(sx, sy);
      }
    },
    [activeTool]
  );

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (
        activeTool === 'zone-polygon' ||
        activeTool === 'property-boundary' ||
        activeTool === 'house-outline'
      ) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const sx = e.clientX - rect.left;
        const sy = e.clientY - rect.top;
        polyToolRef.current?.onClick(sx, sy);
      }
    },
    [activeTool]
  );

  const handleWheel = useCallback((e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const store = useUIStore.getState();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    store.setZoom(store.zoom * delta);
  }, []);

  return (
    <div className={styles.canvasArea} data-testid="canvas-area">
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        data-testid="canvas"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={handleClick}
        onWheel={handleWheel}
        onContextMenu={(e) => e.preventDefault()}
      />
    </div>
  );
}
