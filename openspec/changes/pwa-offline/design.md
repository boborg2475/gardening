## Context

The app is entirely client-side with no backend API calls. All data persists in IndexedDB. This makes it an ideal PWA candidate — once assets are cached, every feature works offline. The main concerns are: caching the app shell, prompting installation, and handling updates gracefully.

## Goals / Non-Goals

**Goals:**
- Cache all static assets via service worker for full offline operation
- Provide install prompt for supported browsers (Chromium-based)
- Notify users when updates are available without disrupting their session
- Request persistent storage to protect IndexedDB data from eviction

**Non-Goals:**
- Background sync (no backend to sync with)
- Push notifications
- Custom service worker logic beyond precaching

## Decisions

### 1. generateSW over injectManifest
The app has no runtime caching needs (no API calls). Workbox's generated service worker handles precaching of all static assets, which is the only requirement. No custom SW logic needed.

### 2. registerType: 'prompt' over 'autoUpdate'
Users are shown a toast when a new version is available rather than silently updating. This avoids unexpected behavior mid-session (e.g., canvas state disruption during a reload).

### 3. Install banner with localStorage dismissal
The install banner appears once for eligible users. Dismissal is persisted in localStorage so it doesn't reappear. If localStorage is unavailable, the banner shows each session (graceful degradation).

### 4. Periodic update check
Long-running sessions (user keeps the app open for hours while gardening) might miss update notifications. A 60-minute interval check ensures updates are detected without excessive network requests.

## Risks / Trade-offs

- **Icon assets need to be created** → Simple leaf/plant motif in garden green. Can use a basic SVG-to-PNG pipeline or hand-craft.
- **Service worker caching may cause stale assets** → The prompt-based update flow ensures users are notified and can choose when to update.
