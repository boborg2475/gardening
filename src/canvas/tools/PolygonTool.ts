import type { Point } from '../../types/garden';
import type { CanvasEngine } from '../CanvasEngine';
import type { Tool } from './Tool';
import { useProjectStore } from '../../store/projectStore';
import { useUIStore } from '../../store/uiStore';
import { distance } from '../geometry';

const CLOSE_THRESHOLD = 1; // world units (feet)

type PolygonMode = 'polygon_zone' | 'property_boundary' | 'house_outline';

export class PolygonTool implements Tool {
  private vertices: Point[] = [];
  private mousePos: Point | null = null;
  private mode: PolygonMode;

  constructor(mode: PolygonMode) {
    this.mode = mode;
  }

  getVertices(): Point[] {
    return [...this.vertices];
  }

  onMouseDown(worldPos: Point, _engine: CanvasEngine): void {
    // Check if clicking near first vertex to close
    if (this.vertices.length >= 3) {
      if (distance(worldPos, this.vertices[0]) < CLOSE_THRESHOLD) {
        this.closePolygon();
        return;
      }
    }

    this.vertices.push(worldPos);
  }

  onMouseMove(worldPos: Point, _engine: CanvasEngine): void {
    this.mousePos = worldPos;
  }

  onKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Escape') {
      this.vertices = [];
      this.mousePos = null;
    }
  }

  renderPreview(ctx: CanvasRenderingContext2D, engine: CanvasEngine): void {
    if (this.vertices.length === 0) return;

    ctx.strokeStyle = this.mode === 'polygon_zone' ? '#22c55e' : '#374151';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 3]);

    ctx.beginPath();
    const first = engine.worldToScreen(this.vertices[0]);
    ctx.moveTo(first.x, first.y);

    for (let i = 1; i < this.vertices.length; i++) {
      const p = engine.worldToScreen(this.vertices[i]);
      ctx.lineTo(p.x, p.y);
    }

    if (this.mousePos) {
      const mp = engine.worldToScreen(this.mousePos);
      ctx.lineTo(mp.x, mp.y);
    }

    ctx.stroke();
    ctx.setLineDash([]);

    // Draw vertex dots
    ctx.fillStyle = '#3b82f6';
    for (const v of this.vertices) {
      const sp = engine.worldToScreen(v);
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private closePolygon(): void {
    const store = useProjectStore.getState();

    switch (this.mode) {
      case 'polygon_zone':
        store.addZone({
          name: 'New Zone',
          color: '#22c55e',
          sunExposure: 'full',
          soilType: 'loam',
          notes: '',
          vertices: [...this.vertices],
        });
        break;
      case 'property_boundary':
        store.setPropertyBoundary([...this.vertices]);
        break;
      case 'house_outline':
        store.setHouseOutline([...this.vertices]);
        break;
    }

    this.vertices = [];
    this.mousePos = null;
    useUIStore.getState().setActiveTool('select');
  }
}
