export function openFile(e) {
    e.preventDefault();
    const dialog = window.__TAURI__.dialog;
    const fileRelativeLoc = '../../file';
    dialog.open({
        'defaultPath': fileRelativeLoc,
        'filters': [{
            name: 'casio_rbk',
            extensions: ['rbk']
        }]
    });
}

export function fsLog(msg) {
    const fs = window.__TAURI__.fs;
}

