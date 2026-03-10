# 07 - Plant Database & Planting Tracker

## 1. Plant Data Model

Each plant in the database is represented by a `Plant` record. The database is static and ships with the app; users do not add or edit plants.

```
Plant {
  id: string                // stable slug, e.g. "tomato-cherry"
  commonName: string        // e.g. "Cherry Tomato"
  scientificName: string    // e.g. "Solanum lycopersicum var. cerasiforme"
  category: 'vegetable' | 'fruit' | 'herb' | 'flower' | 'perennial' | 'annual' | 'vine' | 'ground-cover'
  hardinessZoneMin: number  // USDA hardiness zone lower bound (1-13)
  hardinessZoneMax: number  // USDA hardiness zone upper bound (1-13)
  sunRequirement: 'full-sun' | 'partial-sun' | 'shade'
  waterNeeds: 'low' | 'moderate' | 'high'
  spacingInches: number     // recommended minimum spacing between plants
  matureSizeFeet: {
    width: number           // canopy/spread at maturity
    height: number          // height at maturity
  }
  daysToMaturity: number | null   // null for plants where this is not applicable (e.g. perennial shrubs)
  description: string       // 1-2 sentence description
}
```

### Field notes

- `id` is a kebab-case slug derived from the common name, disambiguated with a qualifier when needed (e.g. `tomato-roma`, `tomato-cherry`).
- `hardinessZoneMin` and `hardinessZoneMax` define the USDA zone range in which the plant is reliably hardy. Display as "Zones 5-9".
- `sunRequirement` is a simplified three-tier classification. "Partial-sun" covers both partial sun and partial shade.
- `spacingInches` is the recommended center-to-center distance for planting. Used in future spacing validation and layout suggestions.
- `daysToMaturity` is null for perennials, ornamentals, and other plants where the concept does not meaningfully apply.

---

## 2. Plant Database

The database is stored as a static TypeScript array in `src/data/plantDatabase.ts`. It contains approximately 150 entries spanning all eight categories.

### Category breakdown (approximate counts)

| Category | Count | Examples |
|----------|-------|---------|
| vegetable | 35 | Tomato (beefsteak, cherry, roma), Bell pepper, Jalapeno, Lettuce (romaine, butterhead), Spinach, Kale, Carrot, Radish, Beet, Onion, Garlic, Broccoli, Cauliflower, Cabbage, Zucchini, Summer squash, Butternut squash, Pumpkin, Cucumber, Snap pea, Green bean, Pole bean, Sweet corn, Potato, Sweet potato, Eggplant, Celery, Asparagus, Artichoke |
| fruit | 15 | Strawberry, Blueberry, Raspberry, Blackberry, Grape, Watermelon, Cantaloupe, Fig, Rhubarb, Gooseberry, Currant, Kiwi, Passion fruit, Honeyberry, Elderberry |
| herb | 20 | Basil (sweet, Thai), Cilantro, Parsley (flat-leaf, curly), Rosemary, Thyme, Oregano, Mint, Dill, Chives, Sage, Tarragon, Lemongrass, Fennel, Marjoram, Bay laurel, Chamomile, Lavender (culinary), Stevia, Sorrel |
| flower | 20 | Marigold, Zinnia, Sunflower, Cosmos, Petunia, Snapdragon, Dahlia, Nasturtium, Calendula, Sweet pea, Pansy, Begonia, Impatiens, Geranium, Dianthus, Aster, Celosia, Alyssum, Morning glory, Coleus |
| perennial | 20 | Hosta, Daylily, Lavender, Echinacea, Black-eyed Susan, Sedum, Phlox, Astilbe, Coral bells, Peony, Iris (bearded), Salvia, Catmint, Russian sage, Coreopsis, Shasta daisy, Bee balm, Bleeding heart, Fern (ostrich), Liatris |
| annual | 15 | Petunia, Impatiens, Marigold, Zinnia, Coleus, Begonia (wax), Geranium, Verbena, Calibrachoa, Lobelia, Dusty miller, Lantana, Portulaca, Cleome, Nicotiana |
| vine | 10 | Clematis, Wisteria, Honeysuckle, Trumpet vine, Virginia creeper, Boston ivy, Jasmine (star), Climbing hydrangea, Passionflower, Mandevilla |
| ground-cover | 15 | Creeping thyme, Ajuga, Vinca minor, Pachysandra, Creeping Jenny, Sedum (ground cover varieties), Irish moss, Sweet woodruff, Liriope, Mondo grass, Clover (white), Corsican mint, Dichondra, Mazus, Phlox (creeping) |

### Data sourcing and accuracy

Plant data is compiled from publicly available horticultural references. Values represent typical ranges for general growing conditions. The database is intentionally approximate and geared toward helping users plan, not serving as a definitive botanical reference.

### Lookup and filtering

The database array supports the following access patterns, implemented as utility functions in `src/data/plantDatabase.ts`:

- `getPlantById(id: string): Plant | undefined` — direct lookup.
- `searchPlants(query: string): Plant[]` — case-insensitive substring match against `commonName` and `scientificName`.
- `filterPlantsByCategory(category: Plant['category']): Plant[]` — exact category match.
- `filterPlants(opts: { query?: string, category?: string, sunRequirement?: string }): Plant[]` — combined filter used by the plant browser UI.

All filter functions return new arrays and do not mutate the source.

---

## 3. Planting Model

A `Planting` represents a specific instance of a plant assigned to a zone in the user's project. Plantings are stored in `projectStore.plantings`.

```
Planting {
  id: string            // uuid v4
  zoneId: string        // references a zone in projectStore.zones
  plantId: string       // references Plant.id in the static database
  quantity: number      // number of plants (minimum 1)
  plantingDate: string | null   // ISO 8601 date string, e.g. "2026-04-15", or null if not yet planned
  status: 'planned' | 'planted' | 'growing' | 'harvested' | 'removed'
  notes: string         // user-entered notes, default ""
}
```

### Field notes

- `zoneId` is a required foreign key. A planting always belongs to exactly one zone. If a zone is deleted, all its plantings must be cascade-deleted.
- `plantId` references the static plant database. Because the database is static and ships with the app, referential integrity is guaranteed as long as plant IDs are never removed between versions.
- `quantity` defaults to 1. The UI enforces a minimum of 1 via input validation.
- `status` follows a forward progression but the user can set it to any value at any time (e.g., skip from "planned" directly to "growing"). The status values are:
  - `planned` — intent to plant, not yet in the ground.
  - `planted` — physically planted.
  - `growing` — actively growing (optional intermediate state).
  - `harvested` — harvest completed (primarily for vegetables/fruits).
  - `removed` — plant removed or died.
- `plantingDate` is nullable so users can create planned entries without committing to a date.

### Store selectors

Key selectors in `src/store/projectStore.ts`:

- `selectAllPlantings(state): Planting[]` — returns the full plantings array.
- `plantingsForZone(state, zoneId: string): Planting[]` — filters plantings to those matching the given `zoneId`. This is the primary selector used by the planting panel.
- `plantingById(state, id: string): Planting | undefined` — direct lookup for editing.

---

## 4. Adding Plantings

### Preconditions

- At least one zone must exist in `projectStore.zones`.
- A zone must be selected (`uiStore.selectedZoneId` is non-null).

### Flow

1. **User selects a zone** on the canvas (click in select mode) or from the zone list.
2. **Planting panel** appears in the sidebar, showing existing plantings for this zone.
3. **User clicks "Add Planting"** button.
4. **Plant browser dialog** opens (modal overlay). User searches/filters the plant database and clicks a plant to select it.
5. **Planting form** appears (either in the dialog or replaces the dialog). Fields:
   - Plant: pre-filled with selected plant (read-only, shows name).
   - Quantity: number input, default 1, min 1.
   - Planting date: date picker, optional.
   - Status: dropdown, default "planned".
   - Notes: textarea, optional.
6. **User clicks "Save"**.
   - A new `Planting` record is created with a generated uuid and the form values.
   - The planting is appended to `projectStore.plantings`.
   - The dialog closes.
   - The planting panel refreshes to show the new entry.
   - An undo snapshot is captured by `zundo`.

### Validation

- Quantity must be >= 1 and an integer. The input rejects non-numeric values.
- PlantId must reference a valid plant in the database. Since the user selects from the browser, this is enforced by the UI flow.
- ZoneId must reference an existing zone. Guaranteed by the precondition.

---

## 5. Planting Panel

The planting panel is a sidebar section that appears when a zone is selected. It replaces or sits below the zone detail section.

### Header

- Zone name (from the selected zone).
- Planting count badge (e.g., "7 plantings").
- "Add Planting" button.

### Planting list

Each planting is displayed as a card/row containing:

- **Plant common name** (bold) and scientific name (italic, smaller).
- **Quantity** (e.g., "x 12").
- **Status badge** — color-coded pill:
  - planned: gray
  - planted: blue
  - growing: green
  - harvested: amber
  - removed: red
- **Planting date** (if set), formatted as locale-appropriate short date.

### Expanded detail

Clicking a planting row expands it to show:

- Full plant details pulled from the plant database:
  - Sun requirement icon and label.
  - Water needs icon and label.
  - Hardiness zone range.
  - Spacing recommendation.
  - Mature size.
  - Days to maturity (if applicable).
- Notes field (editable inline).
- Status dropdown (editable, changes save immediately to store).
- **Edit** button — opens the planting form pre-filled with current values.
- **Delete** button — removes the planting after a confirmation prompt.

### Empty state

If the selected zone has no plantings, show: "No plantings in this zone yet. Click 'Add Planting' to get started."

### No zone selected

If no zone is selected, the planting panel area shows: "Select a zone on the map to manage its plantings."

---

## 6. Plant Browser Dialog

A modal dialog for discovering and selecting plants from the database. Opened when adding a new planting.

### Layout

- **Search bar** at the top. Searches against `commonName` and `scientificName` (case-insensitive substring match). Debounced at 150ms to avoid filtering on every keystroke.
- **Category filter** — horizontal row of toggle buttons, one per plant category. Multiple categories can be active simultaneously. When none are active, all categories are shown.
- **Results count** — e.g., "Showing 23 of 150 plants".
- **Scrollable plant list** — the main body of the dialog. Virtualized if performance requires it (unlikely at 150 items, but the design accommodates it).

### Plant list entry

Each entry in the list displays:

- **Common name** (primary text, bold).
- **Scientific name** (secondary text, italic).
- **Category badge** — small colored pill with category name.
- **Info icons row**:
  - Sun icon: full sun (bright), partial sun (half), shade (dark).
  - Water droplet icon: low (one drop), moderate (two drops), high (three drops).
  - Zone range: small text "Z 5-9".
- Clicking the row selects the plant and proceeds to the planting form.

### Accessibility

- Search bar is auto-focused on dialog open.
- Arrow keys navigate the list.
- Enter selects the focused plant.
- Escape closes the dialog without selection.

---

## 7. Zone Deletion Cascade

When a zone is deleted from `projectStore.zones`, all `Planting` records with a matching `zoneId` must also be removed from `projectStore.plantings`. This cascade is handled in the zone deletion action within the project store:

```
deleteZone(zoneId):
  state.zones = state.zones.filter(z => z.id !== zoneId)
  state.plantings = state.plantings.filter(p => p.zoneId !== zoneId)
```

Both mutations happen in a single store action so they are captured as one undo snapshot. Undoing the zone deletion restores both the zone and all its plantings.

---

## 8. Data Flow Summary

```
Plant Database (static, ~150 entries)
    |
    | plantId reference
    v
Planting (in projectStore.plantings)
    |
    | zoneId reference
    v
Zone (in projectStore.zones, rendered on canvas)
```

- Plants are read-only reference data.
- Plantings are mutable project data, persisted via Dexie auto-save.
- Zones own plantings via the `zoneId` foreign key.
- The planting panel reads from both the plant database (for display metadata) and the project store (for planting records).
