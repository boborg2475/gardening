import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ZonePanel } from './ZonePanel';
import { useProjectStore } from '../store/projectStore';
import { useUIStore } from '../store/uiStore';
import type { Zone } from '../types/garden';

describe('ZonePanel [BMAD-zone-panel]', () => {
  beforeEach(() => {
    useProjectStore.getState().resetProject();
    useUIStore.getState().reset();
  });

  it('should show "No selection" when nothing is selected', () => {
    render(<ZonePanel />);
    expect(screen.getByText(/no selection/i)).toBeInTheDocument();
  });

  it('should display zone details when a zone is selected', () => {
    const zone: Zone = {
      id: 'zone-1',
      type: 'zone',
      points: [
        { x: 0, y: 0 },
        { x: 5, y: 0 },
        { x: 5, y: 5 },
        { x: 0, y: 5 },
      ],
      name: 'Veggie Bed',
      color: '#4CAF50',
      sunExposure: 'full',
      soilType: 'loam',
      notes: 'Test notes',
    };

    useProjectStore.getState().addShape(zone);
    useUIStore.getState().selectShape('zone-1');

    render(<ZonePanel />);
    expect(screen.getByDisplayValue('Veggie Bed')).toBeInTheDocument();
    expect(screen.getByDisplayValue('loam')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test notes')).toBeInTheDocument();
  });

  it('should update zone name on input change', () => {
    const zone: Zone = {
      id: 'zone-2',
      type: 'zone',
      points: [{ x: 0, y: 0 }, { x: 5, y: 0 }, { x: 5, y: 5 }, { x: 0, y: 5 }],
      name: 'Old Name',
      color: '#4CAF50',
      sunExposure: 'full',
      soilType: '',
      notes: '',
    };

    useProjectStore.getState().addShape(zone);
    useUIStore.getState().selectShape('zone-2');

    render(<ZonePanel />);
    const nameInput = screen.getByDisplayValue('Old Name');
    fireEvent.change(nameInput, { target: { value: 'New Name' } });

    const updated = useProjectStore.getState().project.shapes[0];
    expect(updated.name).toBe('New Name');
  });
});
