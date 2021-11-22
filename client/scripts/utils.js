import { get } from 'svelte/store';
import { tick } from 'svelte';
import { dialog, path } from '@tauri-apps/api';
import {
    filename,
    filepath,
    setDownloadPath,
    slots,
    updateContext,
} from '../src/stores';
import { callEndpoint } from '../scripts/client_http';

export function openDialog(dir, serv, last) {
    return dialog
        .open({
            defaultPath: dir,
            filters: [
                {
                    name: 'casio_rbk',
                    extensions: ['rbk'],
                },
            ],
            multiple: false,
            directory: false,
        })
        .then((input) => {
            if (input != null) {
                filename.set(getFileFromPath(input));
                filepath.set(getFolderFromPath(input));
                callEndpoint(serv, 'import', 'json', 'POST', {
                    filename: input,
                })
                    .then(async (resp) => {
                        updateContext(serv, resp);
                        hackDOM(input, last);
                    })
                    .catch((err) => console.log(err));
            }
        })
        .catch((err) => {
            console.log(err);
            if (
                typeof err === 'string' &&
                err.includes('failed to setup dialog') &&
                err.includes("doesn't exist")
            ) {
                // migsnote: test RESOURCE NOT FOUND
                // alert("Folder not found! Resetting to default...");
                setDownloadPath();
            }
        });
}

async function hackDOM(check, last) {
    if (check == last) {
        let shamelessCopy = get(slots);
        slots.set([]);
        await tick();
        slots.set(shamelessCopy);
    }
}

export function submitForm(formElement, server, last) {
    const formData = new FormData(formElement);
    const formDataDict = {};
    for (var pair of formData.entries()) {
        formDataDict[pair[0]] = pair[1];
    }
    // add last imported file, just in case
    formDataDict['last'] = last;
    callEndpoint(server, 'export', 'json', 'POST', formDataDict)
        .then((resp) => {
            alertHandler(resp.status);
            slots.set(resp.data.slots);
        })
        .catch((err) => console.log(err));
}

function alertHandler(status) {
    let msg = '';
    if (status === 200) {
        msg += '\nSuccessfully exported\n';
    } else {
        msg += '\nOh no! Something went wrong exporting\n';
    }
    msg += get(filename) + ' to folder\n' + get(filepath);
    alert(msg);
}

function getFolderFromPath(value) {
    let pathStr = '';
    const pathArr = value.split(path.sep);
    for (let i = 0; i < pathArr.length - 1; i++) {
        pathStr += pathArr[i] + path.sep;
    }
    return pathStr;
}

function getFileFromPath(value) {
    const pathArr = value.split(path.sep);
    const lastIndex = pathArr.length - 1;
    return pathArr[lastIndex];
}

export function pyLog(serv, msg) {
    const formData = new FormData();
    formData.append('line', msg);
    callEndpoint(serv, 'log', 'json', 'PUT', formData)
        .then((resp) => console.log(resp))
        .catch((err) => console.log(err));
}
