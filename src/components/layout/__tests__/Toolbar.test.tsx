import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toolbar } from '../Toolbar';
import { createUIStore } from '../../../store/uiStore';
import type { StoreApi } from 'zustand';
import type { UIState } from '../../../store/uiStore';

describe('Toolbar [LLD-12]', () => {
  let uiStore: StoreApi<UIState>;

  beforeEach(() => {
    uiStore = createUIStore();
  });

  it('renders tool buttons', () => {
    render(<Toolbar uiStore={uiStore} />);
    expect(screen.getByTitle('Select')).toBeTruthy();
    expect(screen.getByTitle('Draw Property')).toBeTruthy();
    expect(screen.getByTitle('Draw House')).toBeTruthy();
    expect(screen.getByTitle('Draw Zone')).toBeTruthy();
  });

  it('sets active tool on button click', () => {
    render(<Toolbar uiStore={uiStore} />);
    fireEvent.click(screen.getByTitle('Draw Zone'));
    expect(uiStore.getState().activeTool).toBe('draw-zone');
  });

  it('highlights the active tool button', () => {
    render(<Toolbar uiStore={uiStore} />);
    const selectBtn = screen.getByTitle('Select');
    expect(selectBtn.getAttribute('aria-pressed')).toBe('true');

    fireEvent.click(screen.getByTitle('Draw Zone'));
    expect(screen.getByTitle('Draw Zone').getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByTitle('Select').getAttribute('aria-pressed')).toBe('false');
  });
});
