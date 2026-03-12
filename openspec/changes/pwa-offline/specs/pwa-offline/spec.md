## ADDED Requirements

### Requirement: Service worker precaches all static assets
The app SHALL register a service worker on load that precaches all static assets (JS, CSS, HTML, fonts, icons) for full offline operation.

#### Scenario: Service worker registers on first load
- **WHEN** the app loads in a browser that supports service workers
- **THEN** a service worker SHALL be registered and all static assets SHALL be precached

#### Scenario: App works fully offline after first load
- **WHEN** the user goes offline after the service worker has installed
- **THEN** all app features SHALL function without network connectivity

#### Scenario: Unsupported browser skips registration
- **WHEN** the browser does not support service workers
- **THEN** registration SHALL be silently skipped and the app SHALL work normally without offline capability

### Requirement: Web manifest provides correct app metadata
The manifest SHALL define the app name, icons, display mode, and theme color for PWA installation.

#### Scenario: Manifest provides required metadata
- **WHEN** the browser reads the web manifest
- **THEN** it SHALL find name "Garden Yard Planner", short_name "GardenPlan", display "standalone", theme_color "#2d7a3a", and icons at 192x192 and 512x512 sizes

### Requirement: Install banner appears on supported browsers
A banner SHALL prompt installation when the browser fires beforeinstallprompt and the user has not previously dismissed it.

#### Scenario: Install banner appears for eligible users
- **WHEN** the browser fires beforeinstallprompt and localStorage does not contain installBannerDismissed
- **THEN** an install banner SHALL appear with "Install Garden Planner for offline use" text and Install/Dismiss buttons

#### Scenario: Dismissing banner persists across sessions
- **WHEN** the user clicks Dismiss on the install banner
- **THEN** localStorage SHALL store installBannerDismissed=true and the banner SHALL not appear on future visits

#### Scenario: Install button triggers browser install prompt
- **WHEN** the user clicks Install on the banner
- **THEN** the deferred prompt SHALL be shown and the banner SHALL be hidden regardless of the user's choice in the browser prompt

#### Scenario: Banner does not appear on unsupported browsers
- **WHEN** the browser does not fire beforeinstallprompt (Firefox, Safari)
- **THEN** the install banner SHALL never appear

### Requirement: Update toast notifies when new version is available
A toast notification SHALL appear when the service worker detects a new version waiting to activate.

#### Scenario: Update toast appears when new version detected
- **WHEN** needRefresh becomes true (new service worker is waiting)
- **THEN** a toast SHALL appear with "A new version is available" and an "Update" button

#### Scenario: Clicking Update reloads with new version
- **WHEN** the user clicks Update on the toast
- **THEN** updateServiceWorker(true) SHALL be called, activating the waiting service worker and reloading the page

#### Scenario: Dismissing toast allows manual update later
- **WHEN** the user dismisses the update toast via the X button
- **THEN** the app SHALL continue on the current version and the user can update by manually refreshing

### Requirement: Persistent storage is requested to protect data
The app SHALL request navigator.storage.persist() to reduce the risk of browser evicting IndexedDB data.

#### Scenario: Persistent storage requested on first project creation
- **WHEN** the user creates their first project
- **THEN** navigator.storage.persist() SHALL be called if available
