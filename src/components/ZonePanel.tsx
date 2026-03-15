import { useProjectStore } from '../store/projectStore';
import { useUIStore } from '../store/uiStore';
import type { SunExposure, SoilType } from '../types/garden';
import styles from '../App.module.css';

const sunOptions: SunExposure[] = ['full', 'partial', 'shade'];
const soilOptions: SoilType[] = ['clay', 'sandy', 'loam', 'silt', 'peat', 'chalk'];

export function ZonePanel() {
  const selectedZoneId = useUIStore((s) => s.selectedZoneId);
  const zones = useProjectStore((s) => s.project.zones);
  const updateZone = useProjectStore((s) => s.updateZone);

  const zone = zones.find((z) => z.id === selectedZoneId);

  if (!zone) {
    return (
      <div className={styles.sidePanel}>
        <div className={styles.panelTitle}>Zone Details</div>
        <div className={styles.noSelection}>Select a zone to edit its properties</div>
      </div>
    );
  }

  return (
    <div className={styles.sidePanel}>
      <div className={styles.panelTitle}>Zone Details</div>

      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>Name</label>
        <input
          className={styles.fieldInput}
          type="text"
          value={zone.name}
          onChange={(e) => updateZone(zone.id, { name: e.target.value })}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>Color</label>
        <input
          className={styles.colorInput}
          type="color"
          value={zone.color}
          onChange={(e) => updateZone(zone.id, { color: e.target.value })}
        />
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>Sun Exposure</label>
        <select
          className={styles.fieldSelect}
          value={zone.sunExposure}
          onChange={(e) => updateZone(zone.id, { sunExposure: e.target.value as SunExposure })}
        >
          {sunOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>Soil Type</label>
        <select
          className={styles.fieldSelect}
          value={zone.soilType}
          onChange={(e) => updateZone(zone.id, { soilType: e.target.value as SoilType })}
        >
          {soilOptions.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>Notes</label>
        <textarea
          className={styles.fieldTextarea}
          value={zone.notes}
          onChange={(e) => updateZone(zone.id, { notes: e.target.value })}
        />
      </div>
    </div>
  );
}
