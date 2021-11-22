import { derived, writable } from 'svelte/store';
import init from '../public/init.json';
import { path } from '@tauri-apps/api';
import { callEndpoint } from '../scripts/client_http';

const storedSelection = localStorage.getItem('rbkm_selected');
export const selected = writable(storedSelection);
selected.subscribe((value) => {
    localStorage.setItem('rbkm_selected', value === null ? 0 : value);
});
export const isCool = derived(selected, ($sel) => deriveCool($sel));

function deriveCool(sel) {
    if (sel == 0) {
        return true;
    } else return false;
}

export function toggleCool(val) {
    if (val == 0) {
        selected.set(1);
    } else if (val == 1) {
        selected.set(0);
    } else {
        console.log('error toggling cool, ' + val);
    }
}

const storedFilename = localStorage.getItem('rbkm_filename');
export const filename = writable(storedFilename);
filename.subscribe((value) => {
    localStorage.setItem('rbkm_filename', value === null ? '' : value);
});

const defaultFilepath = process.env.IS_PROD
    ? 'No folder chosen...'
    : '../../file';
const storedFilepath = localStorage.getItem('rbkm_filepath');
export const filepath = writable(storedFilepath);
filepath.subscribe((value) => {
    localStorage.setItem(
        'rbkm_filepath',
        value === null ? defaultFilepath : value
    );
});

export const last = writable('');
export const slots = writable(init.slots);
export const names = writable(init.names);

export function setDownloadPath() {
    return path
        .downloadDir()
        .then((response) => {
            filepath.set(response);
        })
        .catch((err) => console.log(err));
}

export function updateContext(server, lastImported = null) {
    if (lastImported) {
        last.set(lastImported);
    }
    callEndpoint(server, 'update')
        .then((resp) => {
            slots.set(resp.slots);
            names.set(resp.names);
        })
        .catch((err) => console.log(err));
}
