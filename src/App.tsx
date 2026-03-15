import { Toolbar } from './components/Toolbar';
import { CanvasView } from './components/CanvasView';
import { ZonePanel } from './components/ZonePanel';
import styles from './App.module.css';

export function App() {
  return (
    <div className={styles.app}>
      <Toolbar />
      <CanvasView />
      <ZonePanel />
    </div>
  );
}
