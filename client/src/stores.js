import { writable } from 'svelte/store';

const storedFilename = localStorage.getItem('filename');
export const filename = writable(storedFilename);
filename.subscribe( value => {
    localStorage.setItem('filename', value === null ? '' : value);
});

export const slots = writable([]);
export async function updateSlots(server) {
    const endpoint = server + "/slots";
    await setStore(endpoint, slots);
}

export const names = writable([]);
export async function updateNames(server) {
    const endpoint = server + "/names";
    await setStore(endpoint, names);
}

// assumes store has a known/strict type
async function setStore(endpoint, store) {
    const http = window.__TAURI__.http;
    http
        .fetch(endpoint)
        .then(
            response => {
                store.set(response.data);
            })
        .catch(function(err) {
            console.log('Fetch Error :-S', err);
        });
}