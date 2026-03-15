import { useUIStore } from '../store/uiStore';
import { useProjectStore } from '../store/projectStore';
import type { Zone, SunExposure, SoilType } from '../types/garden';
import styles from '../App.module.css';

const SUN_OPTIONS: { value: SunExposure; label: string }[] = [
  { value: 'full', label: 'Full Sun' },
  { value: 'partial', label: 'Partial Sun' },
  { value: 'shade', label: 'Shade' },
];

const SOIL_OPTIONS: { value: SoilType; label: string }[] = [
  { value: 'loamy', label: 'Loamy' },
  { value: 'clay', label: 'Clay' },
  { value: 'sandy', label: 'Sandy' },
  { value: 'silty', label: 'Silty' },
  { value: 'peaty', label: 'Peaty' },
  { value: 'chalky', label: 'Chalky' },
];

export function ZonePanel() {
  const selectedId = useUIStore((s) => s.selectedShapeId);
  const shapes = useProjectStore((s) => s.project.shapes);
  const updateZoneMetadata = useProjectStore((s) => s.updateZoneMetadata);

  const selectedShape = shapes.find((s) => s.id === selectedId);

  if (!selectedShape) {
    return (
      <div className={styles.sidePanel}>
        <div className={styles.emptyPanel}>
          Select a shape to view its details.
        </div>
      </div>
    );
  }

  if (selectedShape.layer !== 'zone') {
    return (
      <div className={styles.sidePanel}>
        <div className={styles.panelSection}>
          <div className={styles.panelTitle}>
            {selectedShape.layer === 'property' ? 'Property Boundary' : 'House Outline'}
          </div>
          <div style={{ fontSize: 13, color: '#757575' }}>
            {selectedShape.vertices.length} vertices
          </div>
        </div>
      </div>
    );
  }

  const zone = selectedShape as Zone;
  const { metadata } = zone;

  return (
    <div className={styles.sidePanel}>
      <div className={styles.panelSection}>
        <div className={styles.panelTitle}>Zone Details</div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Name</label>
          <input
            className={styles.fieldInput}
            type="text"
            value={metadata.name}
            onChange={(e) => updateZoneMetadata(zone.id, { name: e.target.value })}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Color</label>
          <div className={styles.colorField}>
            <input
              className={styles.colorSwatch}
              type="color"
              value={metadata.color}
              onChange={(e) => updateZoneMetadata(zone.id, { color: e.target.value })}
            />
            <span style={{ fontSize: 12, color: '#9e9e9e' }}>{metadata.color}</span>
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Sun Exposure</label>
          <select
            className={styles.fieldSelect}
            value={metadata.sunExposure}
            onChange={(e) => updateZoneMetadata(zone.id, { sunExposure: e.target.value as SunExposure })}
          >
            {SUN_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Soil Type</label>
          <select
            className={styles.fieldSelect}
            value={metadata.soilType}
            onChange={(e) => updateZoneMetadata(zone.id, { soilType: e.target.value as SoilType })}
          >
            {SOIL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Notes</label>
          <textarea
            className={styles.fieldTextarea}
            value={metadata.notes}
            onChange={(e) => updateZoneMetadata(zone.id, { notes: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
