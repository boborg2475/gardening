import { useEffect } from 'react';
import { Toolbar } from './components/Toolbar';
import { CanvasView } from './components/CanvasView';
import { ZonePanel } from './components/ZonePanel';
import { useProjectStore } from './store/projectStore';
import { projectRepo } from './persistence/projectRepo';
import styles from './App.module.css';

// Debounce utility
function debounce<T extends (...args: never[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}

export function App() {
  // Auto-save [R13.1]
  useEffect(() => {
    const save = debounce(() => {
      const { project } = useProjectStore.getState();
      projectRepo.saveProject(project);
    }, 1000);

    const unsub = useProjectStore.subscribe(save);
    return () => unsub();
  }, []);

  // Load last project on startup [R13.2]
  useEffect(() => {
    projectRepo.getLastProject().then((project) => {
      if (project) {
        useProjectStore.getState().loadProject(project);
      }
    });
  }, []);

  // Undo/Redo keyboard shortcuts [R14]
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        useProjectStore.temporal.getState().undo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        useProjectStore.temporal.getState().redo();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className={styles.app}>
      <Toolbar />
      <CanvasView />
      <ZonePanel />
    </div>
  );
}
