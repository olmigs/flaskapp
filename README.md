# ![logo](/client/src-tauri/icons/112X112.png) RBK Mixer ![logo](/client/src-tauri/icons/112X112.png)
## CT-X700/X800/CDP-S350 RBK File Editor

### Development Requirements
- [Python (3.9)](https://www.python.org/downloads/)
- [Rust (1.51)](https://www.rust-lang.org/tools/install)
- Tauri
    - api (1.0.0-beta.8)
    - cli (1.0.0-beta.10)
- [Node.js (16.4.0)](https://nodejs.dev/learn/how-to-install-nodejs)

### Windows-specific Requirements
- [Webview2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)

__Note on Webview2:__ Webview2 runtime is included with Windows machines that have Microsoft Edge installed. Moreover, even if you do not have Edge, Webview2 may be installed for other Microsoft365 apps. For more information, check out [this post](https://docs.microsoft.com/en-us/deployoffice/webview2-install).


### Develop this app
1. open your console (navigate i.e. `cd` somewhere you like)
3. `git clone` this repository
4. navigate to folder `rbk-mixer`, call `yarn install`
5. call `yarn tauri dev`

A window magically opens. Also, a Python server will be running at `localhost:6980`.

_Warning: The server may still be running, even after the Tauri window closes._

#### Python backend
Check `client/src-tauri/server` for available server executables. If you don't find one for your architecture, why not build one and add it to the repo?

```shell
cd server
pyinstaller -F server.py
```

Navigate to the newly created `dist/server` to find your fresh executable. To rename this executable for use in application:

```shell
cd ../scripts
echo "you may need to install node_modules first, so"
yarn install
yarn move
```

Now you can move this executable to `client/src-tauri/server` to be included in the app bundle.

## Notice
RBK Mixer uses a fork of [Casio-Registrations](https://github.com/michgz/casio-registrations) to manage RBK files.