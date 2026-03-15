import type { CanvasEngine, Renderer } from '../CanvasEngine';
import { useProjectStore } from '../../store/projectStore';
import { useUIStore } from '../../store/uiStore';

export function createSelectionRenderer(): Renderer {
  return {
    render(ctx: CanvasRenderingContext2D, engine: CanvasEngine) {
      const { selectedZoneId, layerVisibility } = useUIStore.getState();
      if (!layerVisibility.selection || !selectedZoneId) return;

      const { project } = useProjectStore.getState();
      const zone = project.zones.find((z) => z.id === selectedZoneId);
      if (!zone || zone.vertices.length < 2) return;

      // Draw highlight border
      ctx.beginPath();
      const first = engine.worldToScreen(zone.vertices[0]);
      ctx.moveTo(first.x, first.y);
      for (let i = 1; i < zone.vertices.length; i++) {
        const p = engine.worldToScreen(zone.vertices[i]);
        ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw vertex handles
      const handleSize = 5;
      ctx.fillStyle = '#3b82f6';
      for (const v of zone.vertices) {
        const sp = engine.worldToScreen(v);
        ctx.fillRect(
          sp.x - handleSize,
          sp.y - handleSize,
          handleSize * 2,
          handleSize * 2
        );
      }
    },
  };
}
