# ![logo](/client/src-tauri/icons/112X112.png) RBK Mixer ![logo](/client/src-tauri/icons/112X112.png)
## CT-X700/X800/CDP-S350 RBK File Editor

### Development Requirements
- [Python (3.9)](https://www.python.org/downloads/) (dev server runtime)
- Rust (1.51)
- Tauri
    - api (1.0.0-beta.8)
    - cli (1.0.0-beta.10)
- Node.js (16.4.0)
- Webview2

### Run this app
1. open your console (navigate i.e. `cd` somewhere you like)
3. `git clone` this repository
4. navigate to folder `flaskapp`, run `yarn install`
5. run `yarn tauri dev`

A Webview2-rendered window magically opens. Also, a Python waitress server will be running at `localhost:6980`.

_Warning: The server may still be running, even after the Tauri window closes._

### Python backend
Check `client/src-tauri/server` for available server executables. If you don't find one for your architecture, why not build one and add it to the repo?

```shell
cd server
pyinstaller -F server.py
```

Now, navigate to the newly created `dist/server` to find your fresh executable. _Results may vary._

## Known issues
- updates to `casio_rbk` library are not automatically included; to get the latest, will need to go to the [Casio-Registrations github page](https://github.com/michgz/casio-registrations)