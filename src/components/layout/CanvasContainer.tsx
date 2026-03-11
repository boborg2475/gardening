import { useEffect, useRef } from 'react';
import type { StoreApi } from 'zustand';
import type { ProjectState } from '../../store/projectStore';
import type { UIState } from '../../store/uiStore';
import { CanvasEngine } from '../../canvas/CanvasEngine';
import { useAutoSave } from '../../persistence/useAutoSave';
import styles from './CanvasContainer.module.css';

interface CanvasContainerProps {
  projectStore: StoreApi<ProjectState>;
  uiStore: StoreApi<UIState>;
}

export function CanvasContainer({ projectStore, uiStore }: CanvasContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useAutoSave(projectStore);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const engine = new CanvasEngine(container, projectStore, uiStore);
    engine.mount();

    return () => {
      engine.unmount();
    };
  }, [projectStore, uiStore]);

  return <div ref={containerRef} className={styles.container} data-testid="canvas-container" />;
}
