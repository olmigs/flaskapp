import { writable } from 'svelte/store';
import init from '../public/init.json';
// import { path } from '@tauri-apps/api';

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
export async function updateSlots(server) {
    const endpoint = server + "/slots";
    return await returnResponseData(endpoint);
}

export const names = writable(init.names);
export async function updateNames(server) {
    const endpoint = server + "/names";
    return await returnResponseData(endpoint);
}

async function returnResponseData(endpoint) {
    const http = window.__TAURI__.http;
    return http
        .fetch(endpoint)
        .then(
            response => {
                return response.data;
            })
        .catch(
            err => {
                return err;
            });
}

export function setDownloadPath() {
    const path = window.__TAURI__.path;
    return path
        .downloadDir()
        .then(
            response => {
                filepath.set(response)
            })
        .catch(err => console.log(err));
}

export async function updateContext(server) {
    const slot_prom = await updateSlots(server);
    const name_prom = await updateNames(server);
    const [slots_new, names_new] = await Promise.all([slot_prom, name_prom])
        .catch(err => { return err; });
    slots.set(slots_new);
    names.set(names_new);
}