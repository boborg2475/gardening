## Why

Gardeners use this tool in their yard where connectivity is unreliable. The app has no backend dependencies, making it a natural fit for full offline operation. PWA installation makes it feel native on phones and tablets without app store distribution, and offline capability ensures the app is always available.

## What Changes

- Configure vite-plugin-pwa with generateSW strategy and precaching of all static assets
- Create web app manifest with app metadata, icons, and standalone display mode
- Add install banner that captures beforeinstallprompt and offers Install/Dismiss options
- Add update toast that notifies when a new service worker version is available
- Request persistent storage via navigator.storage.persist() to reduce risk of browser eviction
- Add periodic update check (every 60 minutes) for long-running sessions

## Capabilities

### New Capabilities
- `pwa-offline`: PWA configuration with service worker precaching, install prompt, update notification, and full offline support

### Modified Capabilities

## Impact

- `vite.config.ts` — Add vite-plugin-pwa plugin configuration
- `public/` — manifest.json, app icons (192, 512, maskable, apple-touch)
- `index.html` — Manifest link, theme-color meta, apple-touch-icon link
- `src/pwa/` — useInstallPrompt and useUpdatePrompt hooks
- `src/components/` — InstallBanner and UpdateToast components
- `package.json` — Add vite-plugin-pwa dev dependency
