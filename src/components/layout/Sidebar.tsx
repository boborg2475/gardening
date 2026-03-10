import { useSyncExternalStore } from 'react';
import type { StoreApi } from 'zustand';
import type { UIState } from '../../store/uiStore';
import type { PanelType } from '../../types/ui';
import styles from './Sidebar.module.css';

interface PanelDef {
  key: PanelType;
  label: string;
  icon: string;
}

const panels: PanelDef[] = [
  { key: 'project', label: 'Project', icon: '📋' },
  { key: 'zones', label: 'Zones', icon: '🌿' },
  { key: 'features', label: 'Features', icon: '🌳' },
  { key: 'plantings', label: 'Plantings', icon: '🌱' },
  { key: 'layers', label: 'Layers', icon: '◫' },
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

  if (!sidebarOpen) {
    return (
      <aside className={styles.sidebarCollapsed} data-testid="sidebar">
        <button
          className={styles.expandBtn}
          onClick={() => uiStore.getState().toggleSidebar()}
          title="Expand sidebar"
        >
          ▸
        </button>
        <nav className={styles.iconTabs}>
          {panels.map(({ key, label, icon }) => (
            <button
              key={key}
              className={`${styles.iconTab} ${activePanel === key ? styles.activeIconTab : ''}`}
              title={label}
              onClick={() => uiStore.getState().setActivePanel(key)}
            >
              {icon}
            </button>
          ))}
        </nav>
      </aside>
    );
  }

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
        {panels.map(({ key, label, icon }) => (
          <button
            key={key}
            className={`${styles.tab} ${activePanel === key ? styles.activeTab : ''}`}
            onClick={() => uiStore.getState().setActivePanel(key)}
          >
            <span className={styles.tabIcon}>{icon}</span>
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
