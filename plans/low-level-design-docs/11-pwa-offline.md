# 11 - PWA and Offline Support

## Overview

The Garden Yard Planner is a client-side-only application with no backend API calls, making it a natural fit for full offline operation. This document covers the service worker configuration, web app manifest, install prompt UX, and update flow.

---

## 1. vite-plugin-pwa Configuration

### Plugin Setup

Add `vite-plugin-pwa` to the Vite config with the following options:

```
VitePWA({
  registerType: 'prompt',       // Manual update prompt, not auto-update
  strategies: 'generateSW',     // Workbox generates the SW automatically
  workbox: {
    globPatterns: ['**/*.{js,css,html,woff2,woff,ttf,ico,png,svg}'],
    maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,  // 3 MB limit per file
    runtimeCaching: []           // No runtime caching needed -- all assets are precached
  },
  includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
  manifest: false                // Manifest provided as a separate file (see section 2)
})
```

### Strategy Rationale

- **`generateSW`** over `injectManifest`: The app has no runtime caching needs (no API calls, no dynamic content fetching). Workbox's generated service worker handles precaching of all static assets, which is the only requirement.
- **`registerType: 'prompt'`**: The user is shown a toast when a new version is available rather than silently updating. This avoids unexpected behavior mid-session (e.g., canvas state disruption during a reload).

### Precache Behavior

- On first visit, the service worker installs and precaches all static assets listed in the Workbox manifest.
- Subsequent visits serve assets from the cache (cache-first strategy for precached assets).
- The app shell (index.html, JS bundles, CSS, fonts) is fully cached, enabling complete offline operation.

---

## 2. Web App Manifest

File: `public/manifest.json`

```
{
  "name": "Garden Yard Planner",
  "short_name": "GardenPlan",
  "description": "Plan your garden and yard layout offline",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "theme_color": "#2d7a3a",
  "background_color": "#ffffff",
  "orientation": "any",
  "categories": ["lifestyle", "utilities"],
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-maskable-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

### Icon Design

- Simple leaf/plant motif rendered as a flat design.
- Garden green (#2d7a3a) leaf on white background.
- Maskable variant has extra safe-zone padding (inner 80% circle) for adaptive icon shapes on Android.

### HTML Link Tags

In `index.html`:
- `<link rel="manifest" href="/manifest.json">`
- `<meta name="theme-color" content="#2d7a3a">`
- `<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">` (180x180)

---

## 3. Install Prompt

### Capturing the Event

In the App component (or a dedicated `useInstallPrompt` hook):

1. Listen for the `beforeinstallprompt` event on `window`.
2. Prevent the default browser mini-infobar by calling `event.preventDefault()`.
3. Store the event reference in a ref (`deferredPromptRef`).
4. Check localStorage for `installBannerDismissed`. If not set, set `showInstallBanner: true` in component state.

### Banner Component

`InstallBanner` renders a fixed-position banner at the top of the viewport:

- **Text**: "Install Garden Planner for offline use"
- **Buttons**: "Install" (primary, green) | "Dismiss" (text/secondary)
- **Style**: CSS Module. Green background (#2d7a3a), white text. Slides down from top with a CSS transition.

### Install Flow

1. User clicks "Install".
2. Call `deferredPromptRef.current.prompt()`.
3. Await `deferredPromptRef.current.userChoice`.
4. If accepted: hide banner, clear ref.
5. If dismissed by the browser prompt: hide banner, do not persist dismissal (allow re-show on next session).

### Dismiss Flow

1. User clicks "Dismiss".
2. Set `localStorage.setItem('installBannerDismissed', 'true')`.
3. Hide banner.
4. Banner will not appear again on future visits because of the localStorage check.

### Edge Cases

- Browser does not support `beforeinstallprompt` (e.g., Firefox, Safari): banner never shows; no error.
- App is already installed (standalone mode): `beforeinstallprompt` does not fire; banner never shows.
- localStorage unavailable: banner shows every session (graceful degradation, not an error).

---

## 4. Update Toast

### Detection

`vite-plugin-pwa` provides a virtual module `virtual:pwa-register` that exposes:
- `needRefresh`: reactive boolean, true when a new SW is waiting.
- `updateServiceWorker(reloadPage?: boolean)`: function to activate the waiting SW.

Use the `useRegisterSW` hook from `vite-plugin-pwa/react`:

```
const { needRefresh, updateServiceWorker } = useRegisterSW({
  onRegisteredSW(swUrl, registration) {
    // Optional: periodic update check (e.g., every 60 minutes)
    setInterval(() => registration?.update(), 60 * 60 * 1000);
  }
});
```

### Toast Component

`UpdateToast` renders when `needRefresh` is true:

- **Position**: fixed, bottom-right corner (desktop) or bottom-center (mobile).
- **Text**: "A new version is available"
- **Button**: "Update" (primary).
- **Dismiss**: small X button to dismiss the toast (user can update later by refreshing manually).

### Update Flow

1. User clicks "Update".
2. Call `updateServiceWorker(true)` which posts `SKIP_WAITING` to the waiting service worker and reloads the page.
3. The new service worker activates and the app loads the latest version.

### Periodic Update Check

- The `onRegisteredSW` callback sets up an interval to call `registration.update()` every 60 minutes while the app is open.
- This ensures long-running sessions detect updates without requiring a manual page refresh.

---

## 5. Offline Capability

### What Works Offline

Everything. The app has no backend dependencies:

| Feature | Offline Status | Notes |
|---|---|---|
| Create/edit projects | Fully offline | Data in IndexedDB |
| Draw property, house, zones | Fully offline | Canvas + store |
| Place features | Fully offline | Feature catalog is bundled |
| Plant database browsing | Fully offline | Plant data is bundled |
| JSON export/import | Fully offline | File API, no network |
| PNG export | Fully offline | Canvas toBlob |
| PDF export | Fully offline | jsPDF is bundled |
| Undo/redo | Fully offline | Zustand + zundo |

### Offline Indicator

- No explicit offline indicator is needed because the app never makes network requests during normal operation.
- If a future version adds optional cloud sync, an offline indicator should be added at that time.

### Data Safety

- All data is stored in IndexedDB, which persists across browser sessions and offline periods.
- Users should be encouraged (via a periodic, non-intrusive prompt) to export JSON backups, since IndexedDB can be cleared by the browser under storage pressure.
- The app requests `navigator.storage.persist()` on first project creation to request persistent storage from the browser, reducing the chance of automatic eviction.

---

## Module Structure

| Module | Responsibility |
|---|---|
| `src/pwa/useInstallPrompt.ts` | Hook: capture beforeinstallprompt, expose install/dismiss actions |
| `src/pwa/useUpdatePrompt.ts` | Hook: wrap useRegisterSW, expose needRefresh and update action |
| `src/components/InstallBanner.tsx` | Install prompt banner UI |
| `src/components/UpdateToast.tsx` | Update available toast UI |
| `vite.config.ts` (plugin section) | vite-plugin-pwa configuration |
| `public/manifest.json` | Web app manifest |
| `public/icons/` | App icons (192, 512, maskable, apple-touch) |

---

## Dependencies

- **vite-plugin-pwa** (dev dependency): Workbox service worker generation and virtual module for registration.
- No other new runtime dependencies.
