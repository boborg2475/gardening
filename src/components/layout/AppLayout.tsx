import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { createProjectStore } from '../../store/projectStore';
import { createUIStore } from '../../store/uiStore';
import { Toolbar } from './Toolbar';
import { Sidebar } from './Sidebar';
import { CanvasContainer } from './CanvasContainer';
import styles from './AppLayout.module.css';

function getIsMobileSnapshot() {
  return window.matchMedia('(max-width: 767px)').matches;
}

export function AppLayout() {
  const projectStore = useMemo(() => createProjectStore(), []);
  const uiStore = useMemo(() => createUIStore(), []);

  const isMobile = useSyncExternalStore(
    (cb) => {
      const mql = window.matchMedia('(max-width: 767px)');
      mql.addEventListener('change', cb);
      return () => mql.removeEventListener('change', cb);
    },
    getIsMobileSnapshot,
  );

  useEffect(() => {
    uiStore.getState().setIsMobile(isMobile);
  }, [isMobile, uiStore]);

  return (
    <div className={styles.appLayout}>
      {!isMobile && <Sidebar uiStore={uiStore} />}
      <div className={styles.mainArea}>
        <Toolbar uiStore={uiStore} />
        <CanvasContainer projectStore={projectStore} uiStore={uiStore} />
      </div>
    </div>
  );
}
