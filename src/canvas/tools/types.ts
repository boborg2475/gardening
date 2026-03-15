import type { Point } from '../../types/garden';

export type ToolEvent = {
  worldPoint: Point;
  screenPoint: Point;
  shiftKey: boolean;
};

export type Tool = {
  onPointerDown?: (e: ToolEvent) => void;
  onPointerMove?: (e: ToolEvent) => void;
  onPointerUp?: (e: ToolEvent) => void;
  onKeyDown?: (e: KeyboardEvent) => void;
  /** Get in-progress points for preview rendering */
  getPreviewPoints?: () => Point[];
  reset?: () => void;
};
