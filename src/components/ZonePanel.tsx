import { useUIStore } from '../store/uiStore';
import { useProjectStore } from '../store/projectStore';
import type { SunExposure } from '../types/garden';
import styles from '../App.module.css';

export function ZonePanel() {
  const selectedShapeId = useUIStore((s) => s.selectedShapeId);
  const shapes = useProjectStore((s) => s.project.shapes);
  const updateShape = useProjectStore((s) => s.updateShape);
  const removeShape = useProjectStore((s) => s.removeShape);
  const setSelectedShapeId = useUIStore((s) => s.setSelectedShapeId);

  const shape = shapes.find((s) => s.id === selectedShapeId);

  if (!shape) {
    return (
      <div className={styles.sidePanel}>
        <h2>Properties</h2>
        <p className={styles.noSelection}>Select a shape to edit its properties.</p>
      </div>
    );
  }

  return (
    <div className={styles.sidePanel}>
      <h2>Properties</h2>

      <div className={styles.field}>
        <label>Name</label>
        <input
          value={shape.name}
          onChange={(e) => updateShape(shape.id, { name: e.target.value })}
        />
      </div>

      <div className={styles.field}>
        <label>Type</label>
        <input value={shape.type} readOnly />
      </div>

      <div className={styles.field}>
        <label>Color</label>
        <div className={styles.colorRow}>
          <input
            type="color"
            value={shape.color}
            className={styles.colorSwatch}
            onChange={(e) => updateShape(shape.id, { color: e.target.value })}
          />
          <span>{shape.color}</span>
        </div>
      </div>

      {shape.type === 'zone' && (
        <>
          <div className={styles.field}>
            <label>Sun Exposure</label>
            <select
              value={shape.sunExposure ?? ''}
              onChange={(e) =>
                updateShape(shape.id, {
                  sunExposure: (e.target.value || undefined) as SunExposure | undefined,
                })
              }
            >
              <option value="">--</option>
              <option value="full">Full Sun</option>
              <option value="partial">Partial Sun</option>
              <option value="shade">Shade</option>
            </select>
          </div>

          <div className={styles.field}>
            <label>Soil Type</label>
            <input
              value={shape.soilType ?? ''}
              onChange={(e) => updateShape(shape.id, { soilType: e.target.value || undefined })}
              placeholder="e.g., clay, loam, sandy"
            />
          </div>

          <div className={styles.field}>
            <label>Notes</label>
            <textarea
              value={shape.notes ?? ''}
              onChange={(e) => updateShape(shape.id, { notes: e.target.value || undefined })}
              rows={4}
              placeholder="Additional notes..."
            />
          </div>
        </>
      )}

      <div className={styles.field}>
        <button
          onClick={() => {
            removeShape(shape.id);
            setSelectedShapeId(null);
          }}
          style={{ background: '#f44336', color: '#fff', borderColor: '#d32f2f' }}
        >
          Delete Shape
        </button>
      </div>
    </div>
  );
}
