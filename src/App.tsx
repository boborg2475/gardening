import { useEffect, useRef } from 'react';
import { Toolbar } from './components/Toolbar';
import { CanvasView } from './components/CanvasView';
import { ZonePanel } from './components/ZonePanel';
import { useProjectStore } from './store/projectStore';
import { projectRepo } from './persistence/projectRepo';
import styles from './App.module.css';

export function App() {
  const project = useProjectStore((s) => s.project);
  const loadProject = useProjectStore((s) => s.loadProject);
  const loaded = useRef(false);

  // Load project on mount
  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    projectRepo.loadLatest().then((p) => {
      if (p) loadProject(p);
    });
  }, [loadProject]);

  // Auto-save with 1s debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      projectRepo.save(project);
    }, 1000);
    return () => clearTimeout(timer);
  }, [project]);

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>Garden Yard Planner</h1>
        <span className={styles.projectName}>{project.name}</span>
      </header>
      <div className={styles.workspace}>
        <Toolbar />
        <CanvasView />
        <ZonePanel />
      </div>
    </div>
  );
}
