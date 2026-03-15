import { useEffect } from 'react';
import { Toolbar } from './components/Toolbar';
import { CanvasView } from './components/CanvasView';
import { ZonePanel } from './components/ZonePanel';
import { useProjectStore } from './store/projectStore';
import { projectRepo } from './persistence/projectRepo';
import styles from './App.module.css';

export function App() {
  // Load last project on mount
  useEffect(() => {
    projectRepo.loadLastProject().then((project) => {
      if (project) {
        useProjectStore.getState().loadProject(project);
      }
    });
  }, []);

  // Auto-save on project changes (debounced 1s)
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    const unsub = useProjectStore.subscribe((state) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        projectRepo.saveProject(state.project);
      }, 1000);
    });
    return () => {
      unsub();
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className={styles.layout}>
      <Toolbar />
      <div className={styles.main}>
        <div className={styles.canvasArea}>
          <CanvasView />
        </div>
        <ZonePanel />
      </div>
    </div>
  );
}
