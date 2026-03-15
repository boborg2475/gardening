import { useUIStore } from '../store/uiStore';
import type { ToolType } from '../types/garden';
import styles from '../App.module.css';

interface ToolDef {
  id: ToolType;
  icon: string;
  label: string;
}

const tools: ToolDef[] = [
  { id: 'select', icon: '\u2B9F', label: 'Select' },
  { id: 'property-boundary', icon: '\u25A1', label: 'Property' },
  { id: 'house-outline', icon: '\u2302', label: 'House' },
  { id: 'zone-rectangle', icon: '\u25AD', label: 'Rect' },
  { id: 'zone-polygon', icon: '\u2B23', label: 'Polygon' },
];

export function Toolbar() {
  const activeTool = useUIStore((s) => s.activeTool);
  const setTool = useUIStore((s) => s.setTool);

  return (
    <div className={styles.toolbar} data-testid="toolbar">
      {tools.map((tool) => (
        <button
          key={tool.id}
          className={`${styles.toolButton} ${activeTool === tool.id ? styles.toolButtonActive : ''}`}
          onClick={() => setTool(tool.id)}
          title={tool.label}
          data-testid={`tool-${tool.id}`}
        >
          <span className={styles.toolIcon}>{tool.icon}</span>
          <span>{tool.label}</span>
        </button>
      ))}
    </div>
  );
}
