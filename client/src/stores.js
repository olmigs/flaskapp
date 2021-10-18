import { derived, writable } from 'svelte/store';
import init from '../public/init.json';
import { path } from '@tauri-apps/api';
import { callEndpoint } from '../scripts/client_http';

export const selected = writable(0);
export const isCool = derived(selected, $sel => {
    if ($sel === 0) return true;
    return false;
});

export function toggleCool(val) {
    if (val === 0) {
        selected.set(1);
    } else {
        selected.set(0);
    }
}

const storedFilename = localStorage.getItem('filename');
export const filename = writable(storedFilename);
filename.subscribe( value => {
    localStorage.setItem('filename', value === null ? '' : value);
});

const defaultFilepath = process.env.IS_PROD ? 'No folder chosen...' : '../../file';
const storedFilepath = localStorage.getItem('filepath');
export const filepath = writable(storedFilepath);
filepath.subscribe( value => {
    localStorage.setItem('filepath', value === null ? defaultFilepath : value);
});

export const slots = writable(init.slots);
export const names = writable(init.names);

export function setDownloadPath() {
    return path
        .downloadDir()
        .then(
            response => {
                filepath.set(response)
            })
        .catch(err => console.log(err));
}

export function updateContext(server) {
    callEndpoint(server, 'update')
        .then(resp => {
            slots.set(resp.slots);
            names.set(resp.names);
        })
        .catch(err => console.log(err));
}