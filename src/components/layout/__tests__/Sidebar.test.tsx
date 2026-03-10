import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from '../Sidebar';
import { createUIStore } from '../../../store/uiStore';
import type { StoreApi } from 'zustand';
import type { UIState } from '../../../store/uiStore';

describe('Sidebar [LLD-12]', () => {
  let uiStore: StoreApi<UIState>;

  beforeEach(() => {
    uiStore = createUIStore();
  });

  describe('expanded mode', () => {
    it('renders sidebar with full labels when open', () => {
      render(<Sidebar uiStore={uiStore} />);
      expect(screen.getByTestId('sidebar')).toBeTruthy();
      expect(screen.getByText('Project')).toBeTruthy();
      expect(screen.getByText('Zones')).toBeTruthy();
      expect(screen.getByText('Layers')).toBeTruthy();
    });

    it('shows the title text when expanded', () => {
      render(<Sidebar uiStore={uiStore} />);
      expect(screen.getByText('Garden Planner')).toBeTruthy();
    });

    it('collapses when collapse button is clicked', () => {
      render(<Sidebar uiStore={uiStore} />);
      fireEvent.click(screen.getByTitle('Collapse sidebar'));
      expect(uiStore.getState().sidebarOpen).toBe(false);
    });
  });

  describe('collapsed mode', () => {
    beforeEach(() => {
      uiStore.getState().toggleSidebar(); // close it
    });

    it('still renders the sidebar element when collapsed', () => {
      render(<Sidebar uiStore={uiStore} />);
      expect(screen.getByTestId('sidebar')).toBeTruthy();
    });

    it('shows icons instead of full labels when collapsed', () => {
      render(<Sidebar uiStore={uiStore} />);
      // Should not show full label text
      expect(screen.queryByText('Project')).toBeFalsy();
      expect(screen.queryByText('Zones')).toBeFalsy();
    });

    it('shows an expand button when collapsed', () => {
      render(<Sidebar uiStore={uiStore} />);
      expect(screen.getByTitle('Expand sidebar')).toBeTruthy();
    });

    it('expands when expand button is clicked', () => {
      render(<Sidebar uiStore={uiStore} />);
      fireEvent.click(screen.getByTitle('Expand sidebar'));
      expect(uiStore.getState().sidebarOpen).toBe(true);
    });

    it('sets active panel when icon button is clicked without expanding', () => {
      render(<Sidebar uiStore={uiStore} />);
      const zoneBtn = screen.getByTitle('Zones');
      fireEvent.click(zoneBtn);
      expect(uiStore.getState().activePanel).toBe('zones');
      expect(uiStore.getState().sidebarOpen).toBe(false);
    });
  });
});
