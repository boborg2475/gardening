import { useEffect, useRef } from 'react';
import type { StoreApi } from 'zustand';
import type { ProjectState } from '../store/projectStore';
import { projectRepo } from './projectRepo';

export function useAutoSave(store: StoreApi<ProjectState>): void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const state = store.getState();
        projectRepo.saveProject(state);
        projectRepo.setLastProjectId(state.id);
        timerRef.current = null;
      }, 1000);
    });

    return () => {
      unsubscribe();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
        const state = store.getState();
        projectRepo.saveProject(state);
        projectRepo.setLastProjectId(state.id);
      }
    };
  }, [store]);
}
