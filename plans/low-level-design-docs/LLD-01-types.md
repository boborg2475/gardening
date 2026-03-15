# LLD-01: Domain Types

## Types (`src/types/garden.ts`)

### Point
```typescript
{ x: number; y: number }  // world coordinates in feet
```

### ShapeType
```typescript
'property' | 'house' | 'zone'
```

### SunExposure
```typescript
'full' | 'partial' | 'shade'
```

### ToolType
```typescript
'select' | 'property' | 'house' | 'zoneRect' | 'zonePoly'
```

### Shape
```typescript
{
  id: string;           // nanoid
  type: ShapeType;
  points: Point[];      // vertices in world coords
  name: string;
  color: string;        // hex color
  sunExposure?: SunExposure;
  soilType?: string;
  notes?: string;
}
```

### Project
```typescript
{
  id: string;
  name: string;
  shapes: Shape[];
  createdAt: number;
  updatedAt: number;
}
```

### ProjectState (store shape)
```typescript
{
  project: Project;
  // actions
  addShape(shape: Shape): void;
  updateShape(id: string, updates: Partial<Shape>): void;
  removeShape(id: string): void;
  loadProject(project: Project): void;
  setProjectName(name: string): void;
}
```

### UIState (store shape)
```typescript
{
  activeTool: ToolType;
  selectedShapeId: string | null;
  panOffset: Point;
  zoom: number;
  // actions
  setActiveTool(tool: ToolType): void;
  setSelectedShapeId(id: string | null): void;
  setPanOffset(offset: Point): void;
  setZoom(zoom: number): void;
}
```
