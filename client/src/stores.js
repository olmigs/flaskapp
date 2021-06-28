import { writable } from 'svelte/store';
// import cfg from "../db/slots.json";

const storedFilename = localStorage.getItem('filename');
export const filename = writable(storedFilename);
filename.subscribe( value => {
    localStorage.setItem('filename', value === null ? '' : value);
})

// const storedSlots = localStorage.getItem('slots');
// export const slots = writable(cfg.slots);
// slots.subscribe( value => {
//     localStorage.setItem('slots', cfg.slots);
// })