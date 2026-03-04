# TRV Scheduler Card - HACS Readiness Track

## Objective
To prepare the TRV Heating Scheduler repository for installation via the Home Assistant Community Store (HACS) as a Custom Repository and ensure the frontend card functions robustly without performance-killing render loops.

## Motivation
Currently, the codebase contains critical architectural flaws (re-rendering the entire Shadow DOM on every Home Assistant state change) and architectural inconsistencies regarding how HACS treats custom repositories (plugins vs. appdaemon apps). Resolving these is required before it can be added to HACS as a functional custom repository.

## Key Requirements
1. **Fix Critical UI Rendering Loop**: The card must intelligently update its UI based on relevant state changes, rather than rebuilding its `innerHTML` every time `set hass(hass)` is triggered.
2. **Bundle/Load the Visual Editor**: The custom card must properly load its configuration editor (`trv-heating-scheduler-card-editor.js`).
3. **Correct HACS Configuration**: Update `hacs.json` to properly point to the root directory for content, or restructure the repository with a `/dist` folder if a build step is introduced.
4. **Resolve the AppDaemon conflict**: Since HACS cannot install both a Lovelace plugin and an AppDaemon app from the same repository simultaneously without manual intervention, documentation must be clarified or the scripts decoupled.
