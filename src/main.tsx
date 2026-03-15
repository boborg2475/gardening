import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { projectRepo } from './persistence/projectRepo';
import { useProjectStore } from './store/projectStore';
import './index.css';

// Auto-save: subscribe to project store changes, debounced
let saveTimeout: ReturnType<typeof setTimeout> | null = null;

useProjectStore.subscribe((state) => {
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    projectRepo.save(state.project).catch(console.error);
  }, 1000);
});

// Load last project on startup
async function init() {
  try {
    const latest = await projectRepo.loadLatest();
    if (latest) {
      useProjectStore.getState().setProject(latest);
    }
  } catch (err) {
    console.error('Failed to load project:', err);
  }

  const root = document.getElementById('root');
  if (!root) throw new Error('Root element not found');

  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}

init();
