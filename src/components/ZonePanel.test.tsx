import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ZonePanel } from './ZonePanel';
import { useUIStore } from '../store/uiStore';
import { useProjectStore } from '../store/projectStore';
import type { Shape } from '../types/garden';

describe('ZonePanel [CP-001]', () => {
  beforeEach(() => {
    useUIStore.setState(useUIStore.getInitialState());
    useProjectStore.setState(useProjectStore.getInitialState());
  });

  it('should show placeholder when nothing is selected', () => {
    render(<ZonePanel />);
    expect(screen.getByText('Select a shape to edit its properties.')).toBeTruthy();
  });

  it('should show shape details when a zone is selected', () => {
    const shape: Shape = {
      id: 's1',
      type: 'zone',
      points: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }],
      name: 'My Garden',
      color: '#ff9800',
      sunExposure: 'full',
    };
    useProjectStore.getState().addShape(shape);
    useUIStore.getState().setSelectedShapeId('s1');

    render(<ZonePanel />);
    const nameInput = screen.getByDisplayValue('My Garden');
    expect(nameInput).toBeTruthy();
  });

  it('should update shape name on input change', () => {
    const shape: Shape = {
      id: 's1',
      type: 'zone',
      points: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }],
      name: 'Old Name',
      color: '#ff9800',
    };
    useProjectStore.getState().addShape(shape);
    useUIStore.getState().setSelectedShapeId('s1');

    render(<ZonePanel />);
    const nameInput = screen.getByDisplayValue('Old Name');
    fireEvent.change(nameInput, { target: { value: 'New Name' } });
    expect(useProjectStore.getState().project.shapes[0].name).toBe('New Name');
  });

  it('should delete shape when delete button is clicked', () => {
    const shape: Shape = {
      id: 's1',
      type: 'zone',
      points: [],
      name: 'Test',
      color: '#ff9800',
    };
    useProjectStore.getState().addShape(shape);
    useUIStore.getState().setSelectedShapeId('s1');

    render(<ZonePanel />);
    fireEvent.click(screen.getByText('Delete Shape'));
    expect(useProjectStore.getState().project.shapes).toHaveLength(0);
    expect(useUIStore.getState().selectedShapeId).toBeNull();
  });
});
