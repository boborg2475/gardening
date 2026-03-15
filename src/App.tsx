import { useEffect } from 'react';
import { Toolbar } from './components/Toolbar';
import { CanvasView } from './components/CanvasView';
import { ZonePanel } from './components/ZonePanel';
import { useProjectStore } from './store/projectStore';
import { useUIStore } from './store/uiStore';
import { projectRepo } from './persistence/projectRepo';
import styles from './App.module.css';

// Debounce helper
function debounce<T extends (...args: never[]) => void>(fn: T, ms: number): T {
  let timer: ReturnType<typeof setTimeout>;
  return ((...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  }) as T;
}

export default function App() {
  // Load last project on startup
  useEffect(() => {
    projectRepo.loadLast().then((project) => {
      if (project) {
        useProjectStore.getState().setProject(project);
      }
    });
  }, []);

  // Auto-save on project changes (debounced 1s)
  useEffect(() => {
    const save = debounce(() => {
      const project = useProjectStore.getState().project;
      projectRepo.save(project);
    }, 1000);

    const unsub = useProjectStore.subscribe(save);
    return unsub;
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        useProjectStore.temporal.getState().undo();
      }
      // Redo
      if (e.key === 'z' && (e.ctrlKey || e.metaKey) && e.shiftKey) {
        e.preventDefault();
        useProjectStore.temporal.getState().redo();
      }
      // Delete selected shape
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const selectedId = useUIStore.getState().selectedShapeId;
        if (selectedId) {
          // Don't delete if user is typing in an input
          const active = document.activeElement;
          if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return;
          useProjectStore.getState().removeShape(selectedId);
          useUIStore.getState().selectShape(null);
        }
      }
      // Escape - deselect / cancel
      if (e.key === 'Escape') {
        useUIStore.getState().selectShape(null);
        useUIStore.getState().setTool('select');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={styles.app}>
      <Toolbar />
      <div className={styles.main}>
        <CanvasView />
        <ZonePanel />
      </div>
    </div>
  );
}
