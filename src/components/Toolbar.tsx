import { useUIStore } from '../store/uiStore';
import { useProjectStore } from '../store/projectStore';
import type { ToolType } from '../types/garden';
import styles from '../App.module.css';

const tools: { id: ToolType; label: string }[] = [
  { id: 'select', label: 'Select' },
  { id: 'property', label: 'Property' },
  { id: 'house', label: 'House' },
  { id: 'zoneRect', label: 'Zone (Rect)' },
  { id: 'zonePoly', label: 'Zone (Poly)' },
];

export function Toolbar() {
  const activeTool = useUIStore((s) => s.activeTool);
  const setActiveTool = useUIStore((s) => s.setActiveTool);

  const handleUndo = () => {
    useProjectStore.temporal.getState().undo();
  };

  const handleRedo = () => {
    useProjectStore.temporal.getState().redo();
  };

  return (
    <div className={styles.toolbar}>
      <h1>Garden Planner</h1>
      {tools.map((t) => (
        <button
          key={t.id}
          className={activeTool === t.id ? 'active' : ''}
          onClick={() => setActiveTool(t.id)}
        >
          {t.label}
        </button>
      ))}
      <div className={styles.undoGroup}>
        <button onClick={handleUndo} title="Undo (Ctrl+Z)">Undo</button>
        <button onClick={handleRedo} title="Redo (Ctrl+Shift+Z)">Redo</button>
      </div>
    </div>
  );
}
