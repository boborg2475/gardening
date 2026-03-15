import { useUIStore } from '../store/uiStore';
import type { ToolType } from '../types/garden';
import styles from '../App.module.css';

const tools: Array<{ type: ToolType; label: string; shortLabel: string }> = [
  { type: 'select', label: 'Select', shortLabel: 'Sel' },
  { type: 'rectangle', label: 'Rect Zone', shortLabel: 'Rect' },
  { type: 'polygon_zone', label: 'Poly Zone', shortLabel: 'Poly' },
  { type: 'property_boundary', label: 'Property', shortLabel: 'Prop' },
  { type: 'house_outline', label: 'House', shortLabel: 'Hse' },
];

export function Toolbar() {
  const activeTool = useUIStore((s) => s.activeTool);
  const setActiveTool = useUIStore((s) => s.setActiveTool);

  return (
    <div className={styles.toolbar} role="toolbar" aria-label="Drawing tools">
      {tools.map((t) => (
        <button
          key={t.type}
          className={`${styles.toolButton} ${activeTool === t.type ? styles.toolButtonActive : ''}`}
          onClick={() => setActiveTool(t.type)}
          title={t.label}
          aria-pressed={activeTool === t.type}
        >
          {t.shortLabel}
        </button>
      ))}
    </div>
  );
}
