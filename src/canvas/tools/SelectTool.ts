import type { Point } from '../../types/garden';
import type { CanvasEngine } from '../CanvasEngine';
import type { Tool } from './Tool';
import { useProjectStore } from '../../store/projectStore';
import { useUIStore } from '../../store/uiStore';
import { pointInPolygon, translateVertices } from '../geometry';

export class SelectTool implements Tool {
  private dragStart: Point | null = null;
  private isDragging = false;

  onMouseDown(worldPos: Point, _engine: CanvasEngine): void {
    this.dragStart = worldPos;
    this.isDragging = false;
  }

  onMouseMove(worldPos: Point, _engine: CanvasEngine): void {
    if (!this.dragStart) return;

    const dx = worldPos.x - this.dragStart.x;
    const dy = worldPos.y - this.dragStart.y;

    if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
      this.isDragging = true;
    }
  }

  onMouseUp(worldPos: Point, _engine: CanvasEngine): void {
    if (!this.dragStart) return;

    const selectedId = useUIStore.getState().selectedZoneId;

    if (this.isDragging && selectedId) {
      // Move the selected zone
      const dx = worldPos.x - this.dragStart.x;
      const dy = worldPos.y - this.dragStart.y;
      const zone = useProjectStore.getState().project.zones.find((z) => z.id === selectedId);
      if (zone) {
        const newVertices = translateVertices(zone.vertices, dx, dy);
        useProjectStore.getState().updateZone(selectedId, { vertices: newVertices });
      }
    } else {
      // Click — try to select
      this.handleClick(worldPos);
    }

    this.dragStart = null;
    this.isDragging = false;
  }

  onKeyDown(e: KeyboardEvent): void {
    const selectedId = useUIStore.getState().selectedZoneId;

    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (selectedId) {
        useProjectStore.getState().removeZone(selectedId);
        useUIStore.getState().setSelectedZoneId(null);
      }
    }

    if (e.key === 'Escape') {
      useUIStore.getState().setSelectedZoneId(null);
    }
  }

  private handleClick(worldPos: Point): void {
    const { project } = useProjectStore.getState();

    // Check zones in reverse order (top-most first)
    for (let i = project.zones.length - 1; i >= 0; i--) {
      if (pointInPolygon(worldPos, project.zones[i].vertices)) {
        useUIStore.getState().setSelectedZoneId(project.zones[i].id);
        return;
      }
    }

    // No hit — deselect
    useUIStore.getState().setSelectedZoneId(null);
  }
}
