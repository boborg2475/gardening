import { useUiStore } from '../store/uiStore';
import type { Tool } from '../types/garden';
import styles from './Toolbar.module.css';

const tools: { id: Tool; label: string; icon: string }[] = [
  { id: 'select', label: 'Select', icon: '⊹' },
  { id: 'draw-property', label: 'Property', icon: '▢' },
  { id: 'draw-house', label: 'House', icon: '⌂' },
  { id: 'draw-zone-rect', label: 'Zone Rect', icon: '▭' },
  { id: 'draw-zone-poly', label: 'Zone Poly', icon: '⬠' },
];

export function Toolbar() {
  const activeTool = useUiStore((s) => s.activeTool);
  const setTool = useUiStore((s) => s.setTool);

  return (
    <div className={styles.toolbar}>
      <h2 className={styles.title}>Tools</h2>
      <div className={styles.buttons}>
        {tools.map((t) => (
          <button
            key={t.id}
            className={`${styles.button} ${activeTool === t.id ? styles.active : ''}`}
            onClick={() => setTool(t.id)}
            title={t.label}
          >
            <span className={styles.icon}>{t.icon}</span>
            <span className={styles.label}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
