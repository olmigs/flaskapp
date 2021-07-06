import { writable } from 'svelte/store';
import arrs from '../public/init.json';

const storedFilename = localStorage.getItem('filename');
export const filename = writable(storedFilename);
filename.subscribe( value => {
    localStorage.setItem('filename', value === null ? '' : value);
});

export const slots = writable(arrs.slots);
export async function updateSlots(server) {
    const endpoint = server + "/slots";
    return await returnResponseData(endpoint);
}

export const names = writable(arrs.names);
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

export async function updateContext(server) {
    const slot_prom = await updateSlots(server);
    const name_prom = await updateNames(server);
    const [slots_new, names_new] = await Promise.all([slot_prom, name_prom])
        .catch(err => { return err; });
    slots.set(slots_new);
    names.set(names_new);
}