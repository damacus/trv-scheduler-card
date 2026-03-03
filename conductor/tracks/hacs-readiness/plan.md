# Implementation Plan: HACS Readiness

## Phase 1: Core Performance and Architecture Fixes

- [ ] **Fix 1: Stop full re-renders in `set hass(hass)`**
  - **File:** `trv-heating-scheduler-card.js`
  - **Details:** The current implementation calls `this.render()` on every Home Assistant state update. This destroys input focus, breaks drag-and-drop state, and causes high CPU usage.
  - **Action:** Refactor `render()` to only generate the DOM once in `setConfig()` or a first-time initialization block. Move state-dependent DOM updates to a separate `updateUI()` method that only manipulates specific DOM nodes (e.g. `this.shadowRoot.querySelector(...)`) or only updates if the card's specific `input_text` helpers have actually changed.

- [ ] **Fix 2: Connect the Visual Editor**
  - **File:** `trv-heating-scheduler-card.js`
  - **Details:** `getConfigElement` returns the editor element, but the script is never imported.
  - **Action:** Add `import './trv-heating-scheduler-card-editor.js';` at the top of the main card file, or update the `hacs.json`/readme to instruct users to load it as a module alongside the main card. Ensure `window.customCards` registration accurately reflects the editor usage.

## Phase 2: HACS Structure and Repository Compatibility

- [ ] **Fix 3: Update `hacs.json` Configuration**
  - **File:** `hacs.json`
  - **Details:** Currently `"content_in_root": false` is set, meaning HACS expects the javascript files to be located in a `dist/` or `release/` directory. However, the JS files are in the root directory.
  - **Action:** Change `"content_in_root": true` in `hacs.json` so HACS copies the files directly from the repository root, or create a build step that outputs minified files to `dist/`.

- [ ] **Fix 4: Document AppDaemon Script Installation**
  - **File:** `README.md` / `PROJECT_SUMMARY.md`
  - **Details:** HACS will register this as a `plugin` (Lovelace card) based on the files. It will not automatically install `trv_scheduler.py` into the AppDaemon directory.
  - **Action:** Add a clear documentation section detailing that while HACS installs the frontend card, users MUST manually copy `trv_scheduler.py` into their AppDaemon `apps/` directory and configure their `apps.yaml`.

## Phase 3: Functionality Cleanups

- [ ] **Fix 5: Card-level Service Calls vs. AppDaemon**
  - **File:** `trv-heating-scheduler-card.js`
  - **Details:** `applySchedules()` calls `climate.set_temperature` from the browser. This competes with the AppDaemon backend and only functions while the browser is open and interacting.
  - **Action:** If AppDaemon is the intended engine for enforcing schedules, remove or disable the automatic `applySchedules()` from the card to prevent race conditions. The card should strictly be a UI for managing the `input_text` schedules.
