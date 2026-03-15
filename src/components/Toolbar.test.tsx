import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toolbar } from './Toolbar';
import { useUIStore } from '../store/uiStore';

describe('Toolbar [R12.2]', () => {
  beforeEach(() => {
    useUIStore.getState().setActiveTool('select');
  });

  it('renders tool buttons', () => {
    render(<Toolbar />);
    expect(screen.getByTitle('Select')).toBeTruthy();
    expect(screen.getByTitle('Rect Zone')).toBeTruthy();
    expect(screen.getByTitle('Poly Zone')).toBeTruthy();
    expect(screen.getByTitle('Property')).toBeTruthy();
    expect(screen.getByTitle('House')).toBeTruthy();
  });

  it('highlights the active tool', () => {
    render(<Toolbar />);
    const selectBtn = screen.getByTitle('Select');
    expect(selectBtn.getAttribute('aria-pressed')).toBe('true');

    const rectBtn = screen.getByTitle('Rect Zone');
    expect(rectBtn.getAttribute('aria-pressed')).toBe('false');
  });

  it('changes active tool on click', () => {
    render(<Toolbar />);
    fireEvent.click(screen.getByTitle('Rect Zone'));
    expect(useUIStore.getState().activeTool).toBe('rectangle');
  });
});
