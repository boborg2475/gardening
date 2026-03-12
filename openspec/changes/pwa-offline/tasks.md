## 1. Vite PWA Plugin Setup

- [ ] 1.1 Install vite-plugin-pwa as dev dependency
- [ ] 1.2 Configure VitePWA plugin in vite.config.ts (generateSW, prompt register, glob patterns)
- [ ] 1.3 Write tests verifying plugin configuration

## 2. Web App Manifest & Icons

- [ ] 2.1 Create public/manifest.json with app metadata
- [ ] 2.2 Create app icons (192x192, 512x512, maskable 512x512, apple-touch 180x180)
- [ ] 2.3 Add manifest link, theme-color meta, and apple-touch-icon link to index.html
- [ ] 2.4 Verify manifest loads correctly in dev server

## 3. Install Banner

- [ ] 3.1 Create useInstallPrompt hook (capture beforeinstallprompt, check localStorage, expose install/dismiss)
- [ ] 3.2 Create InstallBanner component with Install/Dismiss buttons
- [ ] 3.3 Implement dismiss persistence in localStorage
- [ ] 3.4 Write tests for install prompt hook and banner component

## 4. Update Toast

- [ ] 4.1 Create useUpdatePrompt hook wrapping useRegisterSW with periodic 60-minute update checks
- [ ] 4.2 Create UpdateToast component with Update/dismiss buttons
- [ ] 4.3 Wire updateServiceWorker(true) to Update button
- [ ] 4.4 Write tests for update toast component

## 5. Persistent Storage & Offline Verification

- [ ] 5.1 Add navigator.storage.persist() call on first project creation
- [ ] 5.2 Verify all features work offline in production build (manual test checklist)
- [ ] 5.3 Write tests for persistent storage request
