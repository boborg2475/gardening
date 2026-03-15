import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from '../App';

describe('App [R12.1]', () => {
  it('renders toolbar, canvas area, and zone panel', () => {
    render(<App />);
    // Toolbar renders tool buttons
    expect(screen.getByTitle('Select')).toBeTruthy();
    // Zone panel renders
    expect(screen.getByText('Zone Details')).toBeTruthy();
    // Canvas element exists
    expect(document.querySelector('canvas')).toBeTruthy();
  });
});
