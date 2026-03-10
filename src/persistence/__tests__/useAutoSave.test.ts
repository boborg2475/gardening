import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAutoSave } from '../useAutoSave';
import { createProjectStore } from '../../store/projectStore';
import * as repoModule from '../projectRepo';

vi.mock('../projectRepo', () => ({
  projectRepo: {
    saveProject: vi.fn().mockResolvedValue(undefined),
    setLastProjectId: vi.fn().mockResolvedValue(undefined),
    loadProject: vi.fn().mockResolvedValue(null),
    getLastProjectId: vi.fn().mockResolvedValue(null),
  },
}));

describe('useAutoSave [LLD-03, BEAM-SP-010, BEAM-SP-011]', () => {
  let store: ReturnType<typeof createProjectStore>;

  beforeEach(() => {
    vi.useFakeTimers();
    store = createProjectStore();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not save immediately on store change', () => {
    renderHook(() => useAutoSave(store));
    act(() => {
      store.getState().setPropertyBoundary([{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 0 }]);
    });
    expect(repoModule.projectRepo.saveProject).not.toHaveBeenCalled();
  });

  it('saves after 1000ms debounce [BEAM-SP-010]', () => {
    renderHook(() => useAutoSave(store));
    act(() => {
      store.getState().setPropertyBoundary([{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 0 }]);
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(repoModule.projectRepo.saveProject).toHaveBeenCalledTimes(1);
    expect(repoModule.projectRepo.setLastProjectId).toHaveBeenCalledTimes(1);
  });

  it('debounces rapid changes to single save [BEAM-SP-011]', () => {
    renderHook(() => useAutoSave(store));
    act(() => {
      store.getState().setPropertyBoundary([{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 0 }]);
    });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    act(() => {
      store.getState().setHouseOutline([{ x: 10, y: 10 }, { x: 20, y: 10 }, { x: 20, y: 20 }]);
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(repoModule.projectRepo.saveProject).toHaveBeenCalledTimes(1);
  });

  it('flushes pending save on unmount', () => {
    const { unmount } = renderHook(() => useAutoSave(store));
    act(() => {
      store.getState().setPropertyBoundary([{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 0 }]);
    });
    unmount();
    expect(repoModule.projectRepo.saveProject).toHaveBeenCalledTimes(1);
  });
});
