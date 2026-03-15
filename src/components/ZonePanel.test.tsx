import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ZonePanel } from './ZonePanel';
import { useProjectStore } from '../store/projectStore';
import { useUIStore } from '../store/uiStore';
import type { Point } from '../types/garden';

const squareVertices: Point[] = [
  { x: 0, y: 0 }, { x: 10, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 },
];

describe('ZonePanel [R12.4, R12.5]', () => {
  beforeEach(() => {
    useProjectStore.getState().clearProject();
    useUIStore.getState().setSelectedZoneId(null);
  });

  it('shows placeholder when no zone is selected', () => {
    render(<ZonePanel />);
    expect(screen.getByText('Select a zone to edit its properties')).toBeTruthy();
  });

  it('shows zone fields when a zone is selected', () => {
    useProjectStore.getState().addZone({
      name: 'My Bed', color: '#22c55e', sunExposure: 'full', soilType: 'loam',
      notes: 'Some notes', vertices: squareVertices,
    });
    const zoneId = useProjectStore.getState().project.zones[0].id;
    useUIStore.getState().setSelectedZoneId(zoneId);

    render(<ZonePanel />);
    const nameInput = screen.getByDisplayValue('My Bed');
    expect(nameInput).toBeTruthy();
  });

  it('updates zone name on input change [R12.5]', () => {
    useProjectStore.getState().addZone({
      name: 'Old Name', color: '#22c55e', sunExposure: 'full', soilType: 'loam',
      notes: '', vertices: squareVertices,
    });
    const zoneId = useProjectStore.getState().project.zones[0].id;
    useUIStore.getState().setSelectedZoneId(zoneId);

    render(<ZonePanel />);
    const nameInput = screen.getByDisplayValue('Old Name');
    fireEvent.change(nameInput, { target: { value: 'New Name' } });

    expect(useProjectStore.getState().project.zones[0].name).toBe('New Name');
  });
});
