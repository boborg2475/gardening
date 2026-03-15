import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toolbar } from './Toolbar';
import { useUIStore } from '../store/uiStore';

describe('Toolbar [BMAD-app-layout]', () => {
  beforeEach(() => {
    useUIStore.getState().reset();
  });

  it('should render tool buttons', () => {
    render(<Toolbar />);
    expect(screen.getByRole('button', { name: /select/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /rectangle/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /property/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /house/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /zone polygon/i })).toBeInTheDocument();
  });

  it('should highlight the active tool', () => {
    render(<Toolbar />);
    const selectBtn = screen.getByRole('button', { name: /select/i });
    expect(selectBtn.className).toMatch(/active/);
  });

  it('should change the active tool on click', () => {
    render(<Toolbar />);
    const rectBtn = screen.getByRole('button', { name: /rectangle/i });
    fireEvent.click(rectBtn);
    expect(useUIStore.getState().activeTool).toBe('rectangle');
  });
});
