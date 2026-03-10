import { useSyncExternalStore } from 'react';
import type { StoreApi } from 'zustand';
import type { UIState } from '../../store/uiStore';
import type { PanelType } from '../../types/ui';
import styles from './Sidebar.module.css';

const panels: { key: PanelType; label: string }[] = [
  { key: 'project', label: 'Project' },
  { key: 'zones', label: 'Zones' },
  { key: 'features', label: 'Features' },
  { key: 'plantings', label: 'Plantings' },
  { key: 'layers', label: 'Layers' },
];

interface SidebarProps {
  uiStore: StoreApi<UIState>;
}

export function Sidebar({ uiStore }: SidebarProps) {
  const sidebarOpen = useSyncExternalStore(
    uiStore.subscribe,
    () => uiStore.getState().sidebarOpen,
  );
  const activePanel = useSyncExternalStore(
    uiStore.subscribe,
    () => uiStore.getState().activePanel,
  );

  if (!sidebarOpen) return null;

  return (
    <aside className={styles.sidebar} data-testid="sidebar">
      <div className={styles.header}>
        <span className={styles.title}>Garden Planner</span>
        <button
          className={styles.collapseBtn}
          onClick={() => uiStore.getState().toggleSidebar()}
          title="Collapse sidebar"
        >
          ◂
        </button>
      </div>
      <nav className={styles.tabs}>
        {panels.map(({ key, label }) => (
          <button
            key={key}
            className={`${styles.tab} ${activePanel === key ? styles.activeTab : ''}`}
            onClick={() => uiStore.getState().setActivePanel(key)}
          >
            {label}
          </button>
        ))}
      </nav>
      <div className={styles.panelContent}>
        <p className={styles.placeholder}>{activePanel} panel</p>
      </div>
    </aside>
  );
}
