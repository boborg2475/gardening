import { useSyncExternalStore } from 'react';
import type { StoreApi } from 'zustand';
import type { UIState } from '../../store/uiStore';
import type { ToolType } from '../../types/ui';
import styles from './Toolbar.module.css';

interface ToolDef {
  tool: ToolType;
  label: string;
  icon: string;
}

const tools: ToolDef[] = [
  { tool: 'select', label: 'Select', icon: '↖' },
  { tool: 'draw-property', label: 'Draw Property', icon: '⬡' },
  { tool: 'draw-house', label: 'Draw House', icon: '⌂' },
  { tool: 'draw-zone', label: 'Draw Zone', icon: '▢' },
  { tool: 'place-feature', label: 'Place Feature', icon: '🌳' },
  { tool: 'measure', label: 'Measure', icon: '📏' },
];

interface ToolbarProps {
  uiStore: StoreApi<UIState>;
}

export function Toolbar({ uiStore }: ToolbarProps) {
  const activeTool = useSyncExternalStore(
    uiStore.subscribe,
    () => uiStore.getState().activeTool,
  );

  return (
    <div className={styles.toolbar} data-testid="toolbar">
      {tools.map(({ tool, label, icon }) => (
        <button
          key={tool}
          className={`${styles.toolButton} ${activeTool === tool ? styles.active : ''}`}
          title={label}
          aria-pressed={activeTool === tool}
          onClick={() => uiStore.getState().setTool(tool)}
        >
          <span className={styles.icon}>{icon}</span>
        </button>
      ))}
    </div>
  );
}
