import { useEffect, useCallback } from 'react';
import { Toolbar } from './components/Toolbar';
import { CanvasView } from './components/CanvasView';
import { ZonePanel } from './components/ZonePanel';
import { useProjectStore } from './store/projectStore';
import { useUIStore } from './store/uiStore';
import { projectRepo } from './persistence/projectRepo';
import styles from './App.module.css';

export function App() {
  // Load project on mount
  useEffect(() => {
    projectRepo.loadLatest().then((project) => {
      if (project) {
        useProjectStore.getState().loadProject(project);
      }
    });
  }, []);

  // Auto-save debounced
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const unsub = useProjectStore.subscribe((state) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        projectRepo.save(state.project);
      }, 1000);
    });

    return () => {
      unsub();
      clearTimeout(timeoutId);
    };
  }, []);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Undo: Ctrl+Z (no Shift)
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      useProjectStore.temporal.getState().undo();
      return;
    }

    // Redo: Ctrl+Shift+Z
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
      e.preventDefault();
      useProjectStore.temporal.getState().redo();
      return;
    }

    // Redo: Ctrl+Y
    if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
      e.preventDefault();
      useProjectStore.temporal.getState().redo();
      return;
    }

    // Delete selected
    if (e.key === 'Delete' || e.key === 'Backspace') {
      const selectedId = useUIStore.getState().selectedId;
      if (selectedId && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        useProjectStore.getState().removeZone(selectedId);
        useUIStore.getState().deselect();
      }
      return;
    }

    // Escape: deselect / cancel tool
    if (e.key === 'Escape') {
      useUIStore.getState().deselect();
      useUIStore.getState().setTool('select');
      return;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className={styles.app} data-testid="app">
      <Toolbar />
      <CanvasView />
      <ZonePanel />
    </div>
  );
}
