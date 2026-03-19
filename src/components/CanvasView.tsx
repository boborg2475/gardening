import { useRef, useEffect } from 'react';
import { CanvasEngine } from '../canvas/CanvasEngine';
import { useProjectStore } from '../store/projectStore';
import { useUiStore } from '../store/uiStore';
import { createSelectTool } from '../canvas/tools/SelectTool';
import { createPolygonTool } from '../canvas/tools/PolygonTool';
import { createRectangleTool } from '../canvas/tools/RectangleTool';
import styles from './CanvasView.module.css';

export function CanvasView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<CanvasEngine | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const project = useProjectStore((s) => s.project);
  const setProperty = useProjectStore((s) => s.setProperty);
  const setHouse = useProjectStore((s) => s.setHouse);
  const addZone = useProjectStore((s) => s.addZone);
  const moveShape = useProjectStore((s) => s.moveShape);
  const deleteShape = useProjectStore((s) => s.deleteShape);

  const activeTool = useUiStore((s) => s.activeTool);
  const selectedShapeId = useUiStore((s) => s.selectedShapeId);
  const selectShape = useUiStore((s) => s.selectShape);
  const view = useUiStore((s) => s.view);
  const setView = useUiStore((s) => s.setView);

  // Init engine
  useEffect(() => {
    if (!canvasRef.current) return;
    const engine = new CanvasEngine(canvasRef.current);
    engineRef.current = engine;
    engine.resize();

    engine.onViewChange = () => {
      const v = (engine as any).view;
      setView(v);
    };

    const onResize = () => engine.resize();
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      engine.destroy();
      engineRef.current = null;
    };
  }, [setView]);

  // Sync project to engine
  useEffect(() => {
    engineRef.current?.setProject(project);
  }, [project]);

  // Sync view to engine
  useEffect(() => {
    engineRef.current?.setView(view);
  }, [view]);

  // Sync selection
  useEffect(() => {
    engineRef.current?.setSelectedId(selectedShapeId);
  }, [selectedShapeId]);

  // Sync tool handler
  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) return;

    const ZONE_COLORS = ['#4a7c4a', '#7c4a4a', '#4a4a7c', '#7c7c4a', '#4a7c7c', '#7c4a7c'];
    let colorIdx = 0;

    switch (activeTool) {
      case 'select':
        engine.setToolHandler(
          createSelectTool(engine, {
            onSelect: selectShape,
            onMove: moveShape,
          }),
        );
        break;
      case 'draw-property':
        engine.setToolHandler(
          createPolygonTool((vertices) => {
            setProperty(vertices);
          }),
        );
        break;
      case 'draw-house':
        engine.setToolHandler(
          createPolygonTool((vertices) => {
            setHouse(vertices);
          }),
        );
        break;
      case 'draw-zone-rect':
        engine.setToolHandler(
          createRectangleTool((vertices) => {
            addZone({
              name: `Zone ${project.zones.length + 1}`,
              color: ZONE_COLORS[colorIdx++ % ZONE_COLORS.length],
              vertices,
              sunExposure: 'full',
              soilType: 'loam',
              notes: '',
            });
          }),
        );
        break;
      case 'draw-zone-poly':
        engine.setToolHandler(
          createPolygonTool((vertices) => {
            addZone({
              name: `Zone ${project.zones.length + 1}`,
              color: ZONE_COLORS[colorIdx++ % ZONE_COLORS.length],
              vertices,
              sunExposure: 'full',
              soilType: 'loam',
              notes: '',
            });
          }),
        );
        break;
    }
  }, [activeTool, selectShape, moveShape, setProperty, setHouse, addZone, project.zones.length]);

  // Keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedShapeId && document.activeElement === document.body) {
          e.preventDefault();
          deleteShape(selectedShapeId);
          selectShape(null);
        }
      }
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        useProjectStore.temporal.getState().undo();
      }
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey) {
        e.preventDefault();
        useProjectStore.temporal.getState().redo();
      }
      if (e.key === 'Escape') {
        selectShape(null);
        useUiStore.getState().setTool('select');
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedShapeId, deleteShape, selectShape]);

  return (
    <div ref={containerRef} className={styles.container}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
