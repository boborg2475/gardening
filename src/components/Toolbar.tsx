import { useUIStore } from '../store/uiStore';
import type { ToolType } from '../types/garden';
import styles from '../App.module.css';

interface ToolDef {
  type: ToolType;
  icon: string;
  label: string;
}

const tools: ToolDef[] = [
  { type: 'select', icon: '⊹', label: 'Select' },
  { type: 'polygon-property', icon: '▱', label: 'Property' },
  { type: 'polygon-house', icon: '⌂', label: 'House' },
  { type: 'rectangle-zone', icon: '▭', label: 'Rect Zone' },
  { type: 'polygon-zone', icon: '⬠', label: 'Poly Zone' },
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
          <span className={styles.toolIcon}>{t.icon}</span>
          <span className={styles.toolLabel}>{t.label}</span>
        </button>
      ))}
    </div>
  );
}
