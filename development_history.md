# Development History: Homebridge ADB Cast

This document details the development lifecycle, technical decisions, architectural evolutions, and debugging history of the **Homebridge-ADB-Cast** plugin.

---

## 1. Architectural Foundations: Tri-Backend System
To build a reliable TV and Cast monitoring system, we designed a unified client that coordinates three separate network layers:
* **Layer 1: Google Cast Client (`CastClient.ts`)**: Communicates over the native Chromecast protocol to query active cast streams, pause/play cast sessions, and retrieve or set the TV's volume levels.
* **Layer 2: Android TV Remote Client (`AndroidTVClient.ts`)**: Connects over port `6466` using SSL certificates to emulate remote key injections (up, down, enter, back, home) and handle power commands.
* **Layer 3: ADB Client (`ADBClient.ts`)**: Connects over ADB's TLS interface to run shell commands. Specifically, it polls `dumpsys media_session` every few seconds to extract playback states inside native apps (like Netflix or Prime Video) that do not broadcast over Cast.

The **`MediaStateManager.ts`** aggregates events from all three sources, prioritizing Cast when casting is active, and falling back to ADB app polling when native apps are running.

---

## 2. Accessory Design Evolutions
We iterated through multiple accessory layouts to achieve the perfect balance between HomeKit native widgets and user convenience:

### Phase 1: Pure TV Accessory (External)
* *Design*: Exposed a single `Television` service.
* *Limitation*: Apple HomeKit does not support bridged Television accessories. They must be registered as "External Accessories", meaning they do not appear automatically and require manual pairing codes.

### Phase 2: Single Lightbulb Hybrid (Bridged)
* *Design*: Refactored the TV into a single bridged `Lightbulb` accessory. 
* *Mechanism*: Toggling ON/OFF mapped to Play/Pause, and adjusting the Brightness slider mapped to Volume.
* *Limitation*: Users lost the native Television tile UI, the input selector, and physical TV power Sleep/Wake controls.

### Phase 3: Lightbulb + Power Switch (Bridged)
* *Design*: Added a secondary `Switch` service named "Power" on the same lightbulb accessory card.
* *Mechanism*: Provided discrete Sleep/Wake buttons alongside volume control.

### Phase 4: Final Dual-Accessory Layout (TV Tile + Volume Dimmer)
* *Design*: We combined the best of both worlds by publishing **two distinct accessories** per device:
  1. **Television Accessory (External)**: Published unbridged. Displays the native Apple TV Tile and integrates with the **iOS Control Center Remote Widget**, letting users use directional arrows, Select, Back, Home, and physical iPhone volume buttons to control the TV.
  2. **Volume Dimmer Accessory (Bridged Lightbulb)**: Published bridged. Toggles Play/Pause on ON/OFF clicks and controls TV volume via the brightness slider. Syncs bidirectionally with the physical remote.

---

## 3. Key Upgrades & Critical Fixes

### A. Zero-Dependency ADB Auto-Installer
* *Problem*: Users had to install ADB manually on their host OS.
* *Solution*: Implemented a `postinstall.js` script in `package.json` that runs on package install. It detects the host OS (macOS, Linux, Windows), downloads the official Google platform-tools archive, extracts it locally to `bin/platform-tools`, and flags the binary as executable. The plugin checks the local `bin` path first.

### B. Two-Phase SSL Remote Pairing
* *Problem*: Opening the config UI triggered a background remote connection loop that flooded the TV screen with endless pairing PIN prompts.
* *Solution*: Separated the endpoints into `/start-remote-pairing` (visualizes the PIN once) and `/submit-remote-pin`. Setting the TV remote instance to memory prevents connection lifecycle hijacking.

### C. State-Aware Power Control
* *Problem*: Chromecast devices ignore distinct sleep/wake commands (`KEYCODE_SLEEP`/`KEYCODE_WAKEUP`) over the remote connection, responding only to the toggle command `KEYCODE_POWER` (26).
* *Solution*: Programmed the client to track the TV's power state. If the TV is ON and sleep is requested, it sends keycode 26. If the TV is OFF and wake is requested, it sends keycode 26. This translates a dumb toggle key into a smart ON/OFF switch.

### D. Configurable TV Inputs
* *Problem*: Input sources (Home, YouTube, Netflix, etc.) were hardcoded.
* *Solution*: Added an `inputs` multi-select field to `config.schema.json`. The plugin now dynamically reads the user's enabled apps list and maps them to standard Android TV package names (e.g., `com.netflix.ninja` or `com.disney.disneyplus`) to launch them over ADB commands.

### E. Tester Mode
* *Problem*: Returning devices with valid trust store configurations would auto-connect, making it hard for developers to test clean-slate setups.
* *Solution*: Configured an agent rule (`tester_mode.md`) to dynamically disable auto-ADB mapping and simulate fresh setup flows on command.
