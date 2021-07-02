import { writable } from 'svelte/store';

const storedFilename = localStorage.getItem('filename');
export const filename = writable(storedFilename);
filename.subscribe( value => {
    localStorage.setItem('filename', value === null ? '' : value);
});

// migsTODO: instead of 'await', why not set the values while waiting?

export const slots = writable([]);
export async function updateSlots(server) {
    const endpoint = server + "/slots";
    return returnResponseData(endpoint);
}

export const names = writable([]);
export async function updateNames(server) {
    const endpoint = server + "/names";
    return returnResponseData(endpoint);
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

// assumes store has a known/strict type
async function setStoreFromFetch(endpoint, store) {
    const http = window.__TAURI__.http;
    http
        .fetch(endpoint)
        .then(
            response => {
                store.set(response.data);
            })
        .catch(
            err => {
                console.log('Fetch Error :-S', err);
            });
}