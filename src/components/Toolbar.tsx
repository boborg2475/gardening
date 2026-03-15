import { useUIStore } from '../store/uiStore';
import type { ToolType } from '../types/garden';
import styles from './Toolbar.module.css';

interface ToolDef {
  type: ToolType;
  label: string;
}

const tools: ToolDef[] = [
  { type: 'select', label: 'Select' },
  { type: 'rectangle', label: 'Rectangle' },
  { type: 'polygon-property', label: 'Property' },
  { type: 'polygon-house', label: 'House' },
  { type: 'polygon-zone', label: 'Zone Polygon' },
];

export function Toolbar() {
  const activeTool = useUIStore((s) => s.activeTool);
  const setTool = useUIStore((s) => s.setTool);

  return (
    <div className={styles.toolbar} role="toolbar" aria-label="Drawing tools">
      {tools.map((tool) => (
        <button
          key={tool.type}
          className={`${styles.toolButton} ${activeTool === tool.type ? styles.active : ''}`}
          onClick={() => setTool(tool.type)}
          aria-pressed={activeTool === tool.type}
        >
          {tool.label}
        </button>
      ))}
    </div>
  );
}
