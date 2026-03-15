import { useUIStore } from '../store/uiStore';
import { useProjectStore } from '../store/projectStore';
import type { SunExposure, SoilType } from '../types/garden';
import styles from '../App.module.css';

export function ZonePanel() {
  const selectedId = useUIStore((s) => s.selectedId);
  const zones = useProjectStore((s) => s.project.zones);
  const updateZone = useProjectStore((s) => s.updateZone);

  const zone = zones.find((z) => z.id === selectedId);

  if (!zone) {
    return (
      <div className={styles.sidePanel} data-testid="zone-panel">
        <div className={styles.panelHeader}>Zone Details</div>
        <div className={styles.emptyPanel}>
          Select a zone to view its details
        </div>
      </div>
    );
  }

  return (
    <div className={styles.sidePanel} data-testid="zone-panel">
      <div className={styles.panelHeader}>Zone Details</div>
      <div className={styles.panelBody}>
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Name</label>
          <input
            className={styles.fieldInput}
            value={zone.name}
            onChange={(e) => updateZone(zone.id, { name: e.target.value })}
            data-testid="zone-name-input"
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Color</label>
          <input
            type="color"
            className={styles.colorInput}
            value={zone.color}
            onChange={(e) => updateZone(zone.id, { color: e.target.value })}
            data-testid="zone-color-input"
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Sun Exposure</label>
          <select
            className={styles.fieldSelect}
            value={zone.sunExposure}
            onChange={(e) =>
              updateZone(zone.id, { sunExposure: e.target.value as SunExposure })
            }
            data-testid="zone-sun-select"
          >
            <option value="full">Full Sun</option>
            <option value="partial">Partial Sun</option>
            <option value="shade">Shade</option>
          </select>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Soil Type</label>
          <select
            className={styles.fieldSelect}
            value={zone.soilType}
            onChange={(e) =>
              updateZone(zone.id, { soilType: e.target.value as SoilType })
            }
            data-testid="zone-soil-select"
          >
            <option value="clay">Clay</option>
            <option value="sandy">Sandy</option>
            <option value="loam">Loam</option>
            <option value="silt">Silt</option>
            <option value="peat">Peat</option>
            <option value="chalk">Chalk</option>
          </select>
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel}>Notes</label>
          <textarea
            className={styles.fieldTextarea}
            value={zone.notes}
            onChange={(e) => updateZone(zone.id, { notes: e.target.value })}
            data-testid="zone-notes-input"
          />
        </div>
      </div>
    </div>
  );
}
