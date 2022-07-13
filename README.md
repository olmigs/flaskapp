# ![logo](/client/src-tauri/icons/112X112.png) RBK Mixer ![logo](/client/src-tauri/icons/112X112.png)

## CT-X700/X800/CDP-S350 RBK File Editor

### Install

Currently, RBK Mixer only supports MacOS and Windows. You can find the `.dmg` (MacOS) or `.msi` (Windows) files on the [Releases page](https://github.com/olmigs/rbk-mixer/releases).

Brave Linux users can follow the development steps below, and submit a PR with the server executable in `client/src-tauri/server`.

### Windows-specific Requirements

-   [Webview2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)

**Note:** Webview2 runtime is included with Windows machines that have Microsoft Edge installed. Moreover, even if you do not have Edge, Webview2 may be installed for other Microsoft365 apps. For more information, check out [this post](https://docs.microsoft.com/en-us/deployoffice/webview2-install).

### Development Requirements

-   [Python (3.9)](https://www.python.org/downloads/)
-   [Rust (1.51)](https://www.rust-lang.org/tools/install)
-   [Tauri](https://github.com/tauri-apps/tauri)
    -   api (1.0.0-beta.8)
    -   cli (1.0.0-beta.10)
-   [Node.js (16.4.0)](https://nodejs.dev/learn/how-to-install-nodejs)

### Develop this app

1. open your console (navigate i.e. `cd` somewhere you like)
2. `git clone` this repository
3. navigate to folder `rbk-mixer`, call `yarn install`
4. call `yarn tauri dev`

A window magically opens. Also, a Python server will be running at `localhost:6980`.

_Warning: The server may still be running, even after the Tauri window closes. See Architecture Notice below._

#### Building Python backend server

Check `client/src-tauri/server` for available server executables. If you don't find one for your architecture, why not build one and add it to the repo?

```shell
cd server
# if you have pyinstaller
pyinstaller -F server.py
# alternatively (usually on Windows)
python3 install.py
```

Navigate to the newly created `dist/server` to find your fresh executable. To rename this executable for use in application:

```shell
cd ../scripts
echo "you may need to install node_modules first, so"
yarn install
yarn move
```

Move this executable to `client/src-tauri/server` to be included in the app bundle.

### Architecture Notice

Using a Tauri sidecar to run a server is an anti-pattern. When spawned, a Tauri sidecar returns a `tauri::api::process::CommandChild` that must be killed when the Tauri application closes/exits. If the child is not killed, it will outlive the application, becoming a "zombie."

Though Tauri does its best to clean up managed child processes, due to a healthy fear of zombies, I spawn another command - `taskkill` on Windows, `kill` otherwise - with the server process ID when the user requests the application window closed.

### Acknowledgements

This project was spearheaded by the capable [Chandler Holloway](https://chandykeys.unicornplatform.page/).

RBK Mixer uses a fork of [Casio-Registrations](https://github.com/michgz/casio-registrations). My thanks to Mike, without whose effort and support, the conclusion of this project would not have been possible. [Check out Tone Tyrant](https://github.com/michgz/tonetyrant), it's got a slick UI and realtime MIDI!
