import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toolbar } from './Toolbar';
import { useUIStore } from '../store/uiStore';

describe('Toolbar [BEAD-013]', () => {
  beforeEach(() => {
    useUIStore.getState().reset();
  });

  it('should render all tool buttons', () => {
    render(<Toolbar />);
    expect(screen.getByTestId('tool-select')).toBeDefined();
    expect(screen.getByTestId('tool-property-boundary')).toBeDefined();
    expect(screen.getByTestId('tool-house-outline')).toBeDefined();
    expect(screen.getByTestId('tool-zone-rectangle')).toBeDefined();
    expect(screen.getByTestId('tool-zone-polygon')).toBeDefined();
  });

  it('should switch active tool on click', () => {
    render(<Toolbar />);
    fireEvent.click(screen.getByTestId('tool-zone-rectangle'));
    expect(useUIStore.getState().activeTool).toBe('zone-rectangle');
  });

  it('should highlight the active tool', () => {
    render(<Toolbar />);
    const selectBtn = screen.getByTestId('tool-select');
    expect(selectBtn.className).toContain('toolButtonActive');
  });
});
