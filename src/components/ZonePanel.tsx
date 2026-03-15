import { useProjectStore } from '../store/projectStore';
import { useUIStore } from '../store/uiStore';
import { isZone } from '../types/garden';
import type { SunExposure } from '../types/garden';
import styles from './ZonePanel.module.css';

export function ZonePanel() {
  const selectedId = useUIStore((s) => s.selectedShapeId);
  const shapes = useProjectStore((s) => s.project.shapes);
  const updateShape = useProjectStore((s) => s.updateShape);
  const removeShape = useProjectStore((s) => s.removeShape);
  const selectShape = useUIStore((s) => s.selectShape);

  const shape = shapes.find((s) => s.id === selectedId);

  if (!shape) {
    return (
      <div className={styles.panel}>
        <p className={styles.empty}>No selection</p>
        <p className={styles.empty}>Click a shape to select it, or use a drawing tool to create one.</p>
      </div>
    );
  }

  const zone = isZone(shape) ? shape : null;

  const handleDelete = () => {
    removeShape(shape.id);
    selectShape(null);
  };

  return (
    <div className={styles.panel}>
      <p className={styles.shapeType}>{shape.type}</p>
      <h3 className={styles.heading}>Properties</h3>

      <div className={styles.field}>
        <label className={styles.label}>Name</label>
        <input
          className={styles.input}
          type="text"
          value={shape.name}
          onChange={(e) => updateShape(shape.id, { name: e.target.value })}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Color</label>
        <div className={styles.colorRow}>
          <input
            className={styles.colorInput}
            type="color"
            value={shape.color}
            onChange={(e) => updateShape(shape.id, { color: e.target.value })}
          />
          <span>{shape.color}</span>
        </div>
      </div>

      {zone && (
        <>
          <div className={styles.field}>
            <label className={styles.label}>Sun Exposure</label>
            <select
              className={styles.select}
              value={zone.sunExposure}
              onChange={(e) =>
                updateShape(shape.id, { sunExposure: e.target.value as SunExposure })
              }
            >
              <option value="full">Full Sun</option>
              <option value="partial">Partial Shade</option>
              <option value="shade">Full Shade</option>
            </select>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Soil Type</label>
            <input
              className={styles.input}
              type="text"
              value={zone.soilType}
              onChange={(e) => updateShape(shape.id, { soilType: e.target.value })}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Notes</label>
            <textarea
              className={styles.textarea}
              value={zone.notes}
              onChange={(e) => updateShape(shape.id, { notes: e.target.value })}
            />
          </div>
        </>
      )}

      <button className={styles.deleteButton} onClick={handleDelete}>
        Delete Shape
      </button>
    </div>
  );
}
