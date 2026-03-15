import { describe, it, expect, beforeEach } from 'vitest';
import 'fake-indexeddb/auto';
import { render, screen } from '@testing-library/react';
import { App } from '../App';
import { useProjectStore } from '../store/projectStore';
import { useUIStore } from '../store/uiStore';

describe('App [BEAD-015]', () => {
  beforeEach(() => {
    useProjectStore.getState().reset();
    useUIStore.getState().reset();
  });

  it('should render toolbar, canvas, and zone panel', () => {
    render(<App />);
    expect(screen.getByTestId('toolbar')).toBeDefined();
    expect(screen.getByTestId('canvas-area')).toBeDefined();
    expect(screen.getByTestId('zone-panel')).toBeDefined();
  });

  it('should render the app container', () => {
    render(<App />);
    expect(screen.getByTestId('app')).toBeDefined();
  });
});
