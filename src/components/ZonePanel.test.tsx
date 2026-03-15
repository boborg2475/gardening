import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ZonePanel } from './ZonePanel';
import { useProjectStore } from '../store/projectStore';
import { useUIStore } from '../store/uiStore';

describe('ZonePanel [BEAD-014]', () => {
  beforeEach(() => {
    useProjectStore.getState().reset();
    useUIStore.getState().reset();
  });

  it('should show empty message when no zone selected', () => {
    render(<ZonePanel />);
    expect(screen.getByText('Select a zone to view its details')).toBeDefined();
  });

  it('should display zone details when selected', () => {
    useProjectStore.getState().addZone({
      id: 'z1',
      name: 'Test Zone',
      points: [{ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }],
      color: '#FF0000',
      sunExposure: 'full',
      soilType: 'loam',
      notes: 'Some notes',
    });
    useUIStore.getState().select('z1');

    render(<ZonePanel />);
    const nameInput = screen.getByTestId('zone-name-input') as HTMLInputElement;
    expect(nameInput.value).toBe('Test Zone');
  });

  it('should update zone name on input change', () => {
    useProjectStore.getState().addZone({
      id: 'z1',
      name: 'Old Name',
      points: [{ x: 0, y: 0 }],
      color: '#FF0000',
      sunExposure: 'full',
      soilType: 'loam',
      notes: '',
    });
    useUIStore.getState().select('z1');

    render(<ZonePanel />);
    const nameInput = screen.getByTestId('zone-name-input');
    fireEvent.change(nameInput, { target: { value: 'New Name' } });

    expect(useProjectStore.getState().project.zones[0].name).toBe('New Name');
  });

  it('should update sun exposure on select change', () => {
    useProjectStore.getState().addZone({
      id: 'z1',
      name: 'Zone',
      points: [{ x: 0, y: 0 }],
      color: '#FF0000',
      sunExposure: 'full',
      soilType: 'loam',
      notes: '',
    });
    useUIStore.getState().select('z1');

    render(<ZonePanel />);
    const sunSelect = screen.getByTestId('zone-sun-select');
    fireEvent.change(sunSelect, { target: { value: 'shade' } });

    expect(useProjectStore.getState().project.zones[0].sunExposure).toBe('shade');
  });
});
