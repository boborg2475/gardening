import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toolbar } from './Toolbar';
import { useUIStore } from '../store/uiStore';

describe('Toolbar [CP-001]', () => {
  beforeEach(() => {
    useUIStore.setState(useUIStore.getInitialState());
  });

  it('should render all tool buttons', () => {
    render(<Toolbar />);
    expect(screen.getByText('Select')).toBeTruthy();
    expect(screen.getByText('Property')).toBeTruthy();
    expect(screen.getByText('House')).toBeTruthy();
    expect(screen.getByText('Zone (Rect)')).toBeTruthy();
    expect(screen.getByText('Zone (Poly)')).toBeTruthy();
  });

  it('should render undo/redo buttons', () => {
    render(<Toolbar />);
    expect(screen.getByText('Undo')).toBeTruthy();
    expect(screen.getByText('Redo')).toBeTruthy();
  });

  it('should switch active tool on click', () => {
    render(<Toolbar />);
    fireEvent.click(screen.getByText('Property'));
    expect(useUIStore.getState().activeTool).toBe('property');
  });

  it('should highlight the active tool button', () => {
    render(<Toolbar />);
    const selectBtn = screen.getByText('Select');
    expect(selectBtn.className).toContain('active');
  });
});
