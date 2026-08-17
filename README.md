# Homebridge ADB Cast Plugin

A premium Homebridge plugin that integrates Google Chromecast and Android TV devices into Apple HomeKit with support for remote control widgets, dynamic volume dimmers, input switching, and real-time playback synchronization.

---

## Architecture: Tri-Backend System
To provide absolute reliability, this plugin orchestrates three independent connection layers for each device:
1. **ADB Cast Protocol**: Handles multicast discovery and retrieves cast playback status and volume levels.
2. **Android TV Remote Protocol**: Simulates physical keys (directional arrows, select, back, home) and handles TV power sleep/wakeup.
3. **ADB MediaSession**: Polls the Android media subsystem to track playback states inside native apps (such as Netflix, Prime Video, or YouTube) that don't advertise over standard Cast.

---

## Dual Accessory Design
Each configured TV exposes **two distinct tiles** in your Apple Home App:

### 1. The TV Tile (Unbridged External Accessory)
* **Native TV UI**: Renders as a native Apple TV accessory. Tapping it opens the power toggle and the input selector.
* **Apple TV Remote Widget**: Integrates with the iOS Control Center Remote Widget. You can navigate the screen using directional arrows, select, back, home, and **adjust the TV volume using your iPhone's physical volume buttons**!
* **Input Switching**: Preloaded with *Home*, *YouTube*, *Netflix*, and *Prime Video*. Selecting an app switches the TV input and opens it instantly.

### 2. The Volume Dimmer Lightbulb (Bridged Accessory)
* **Play/Pause Sync**: Turning the bulb ON/OFF sends play/pause commands to the TV.
* **Volume Dimmer**: Adjusting the brightness slider (0% to 100%) controls the Chromecast cast volume level.
* **Bi-directional Sync**: If you play or pause the TV using a physical remote, the lightbulb automatically turns ON or OFF in your Home app in real-time.

---

## Key Features
* **Zero-Dependency ADB Auto-Installer**: During installation, the plugin automatically detects your host OS (macOS, Linux, or Windows) and downloads the official Google Android Platform Tools. You do **not** need to install Homebrew, Python, or ADB manually.
* **Two-Phase Remote Pairing**: Provides a smooth pairing screen in the Homebridge UI that avoids the TV spawning endless spontaneous PIN codes.
* **Sandboxed UI**: A fully responsive settings page designed to work inside sandboxed iframes.
* **Manual Port Fallback**: An input field to manually enter dynamic ADB ports if your local router blocks mDNS discovery packets.

---

## Setup & Pairing
1. Go to the **Plugins** tab in Homebridge, find **Homebridge-Google-Cast**, and click **Settings**.
2. Wait for it to discover your TV or add it manually using its IP.
3. Click **Pair Remote** and enter the 4-digit PIN displayed on your TV.
4. Click **Enhance with ADB**, turn on Wireless Debugging on your TV, and enter the 6-digit pairing code.
5. **Pairing with Apple Home**:
   * Since the TV accessory is an external accessory, open your iOS **Home App** → **Add Accessory** → **More options...**
   * Select your TV from the list and enter your main Homebridge Setup PIN (e.g. `965-89-511`) to pair.
