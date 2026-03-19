import { useProjectStore } from '../store/projectStore';
import { useUiStore } from '../store/uiStore';
import type { SunExposure, SoilType } from '../types/garden';
import styles from './ZonePanel.module.css';

export function ZonePanel() {
  const selectedShapeId = useUiStore((s) => s.selectedShapeId);
  const sidePanelOpen = useUiStore((s) => s.sidePanelOpen);
  const project = useProjectStore((s) => s.project);
  const updateZone = useProjectStore((s) => s.updateZone);
  const deleteShape = useProjectStore((s) => s.deleteShape);
  const selectShape = useUiStore((s) => s.selectShape);

  if (!sidePanelOpen || !selectedShapeId) return null;

  const zone = project.zones.find((z) => z.id === selectedShapeId);

  if (!zone) {
    // Selected shape is property or house
    const isProperty = project.property?.id === selectedShapeId;
    const isHouse = project.house?.id === selectedShapeId;
    if (!isProperty && !isHouse) return null;

    return (
      <div className={styles.panel}>
        <div className={styles.header}>
          <h3>{isProperty ? 'Property Boundary' : 'House Outline'}</h3>
          <button
            className={styles.deleteBtn}
            onClick={() => {
              deleteShape(selectedShapeId);
              selectShape(null);
            }}
          >
            Delete
          </button>
        </div>
        <p className={styles.info}>
          {isProperty ? 'Property boundary outline' : 'House footprint outline'}
        </p>
      </div>
    );
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h3>Zone Details</h3>
        <button
          className={styles.deleteBtn}
          onClick={() => {
            deleteShape(zone.id);
            selectShape(null);
          }}
        >
          Delete
        </button>
      </div>

      <label className={styles.field}>
        <span>Name</span>
        <input
          type="text"
          value={zone.name}
          onChange={(e) => updateZone(zone.id, { name: e.target.value })}
        />
      </label>

      <label className={styles.field}>
        <span>Color</span>
        <input
          type="color"
          value={zone.color}
          onChange={(e) => updateZone(zone.id, { color: e.target.value })}
        />
      </label>

      <label className={styles.field}>
        <span>Sun Exposure</span>
        <select
          value={zone.sunExposure}
          onChange={(e) => updateZone(zone.id, { sunExposure: e.target.value as SunExposure })}
        >
          <option value="full">Full Sun</option>
          <option value="partial">Partial Shade</option>
          <option value="shade">Full Shade</option>
        </select>
      </label>

      <label className={styles.field}>
        <span>Soil Type</span>
        <select
          value={zone.soilType}
          onChange={(e) => updateZone(zone.id, { soilType: e.target.value as SoilType })}
        >
          <option value="clay">Clay</option>
          <option value="sandy">Sandy</option>
          <option value="loam">Loam</option>
          <option value="silt">Silt</option>
          <option value="peat">Peat</option>
          <option value="chalk">Chalk</option>
        </select>
      </label>

      <label className={styles.field}>
        <span>Notes</span>
        <textarea
          value={zone.notes}
          onChange={(e) => updateZone(zone.id, { notes: e.target.value })}
          rows={3}
        />
      </label>
    </div>
  );
}
