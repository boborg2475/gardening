import type { Point } from '../../types/garden';
import type { CanvasEngine } from '../CanvasEngine';

export interface Tool {
  onMouseDown?(worldPos: Point, engine: CanvasEngine): void;
  onMouseMove?(worldPos: Point, engine: CanvasEngine): void;
  onMouseUp?(worldPos: Point, engine: CanvasEngine): void;
  onKeyDown?(e: KeyboardEvent): void;
  /** Render tool preview (e.g., in-progress rectangle/polygon) */
  renderPreview?(ctx: CanvasRenderingContext2D, engine: CanvasEngine): void;
}
