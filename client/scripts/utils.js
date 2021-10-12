import { get } from 'svelte/store';
import { dialog, http, path } from '@tauri-apps/api';
import { filename, filepath, setDownloadPath, updateContext } from '../src/stores';
import { callEndpoint } from '../scripts/client_http';

export function openDialog(dir, serv) {
    // const dialog = window.__TAURI__.dialog;
    return dialog
        .open({
            'defaultPath': dir,
            'filters': [{
                name: 'casio_rbk',
                extensions: ['rbk']
            }],
            'multiple': false,
            'directory': false
        })
        .then(
            input => {
                if (input != null) {
                    // const url = serv + '/import?filename=' + input;
                    filename.set(getFileFromPath(input));
                    filepath.set(getFolderFromPath(input));
                    // const http = window.__TAURI__.http;
                    callEndpoint(serv, 'import', 'json', 'POST', {filename: input})
                        .then(_resp => {
                            updateContext(serv);
                            location.reload();
                        })
                        .catch(err => console.log(err));
                } 
            })
        .catch(err => {
            console.log(err);
            if (typeof(err) === "string" && err.includes('failed to setup dialog') && err.includes('doesn\'t exist')) { // migsnote: test RESOURCE NOT FOUND
                // alert("Folder not found! Resetting to default...");
                setDownloadPath();
            }
        });
}

export function submitForm(formElement, server) {
    const formData = new FormData(formElement);
    const formDataDict = {};
    for (var pair of formData.entries()) {
        formDataDict[pair[0]] = pair[1];
    }
    const url = server + '/export';

    return http
        .fetch(url, {
            method: 'POST',
            body: http.Body.form(formDataDict)
        })
        .then(response => {
            updateContext(server);
            alertHandler(response);
        })
        .catch(err => alertHandler(err));
}

function alertHandler(response) {
    let msg = '';
    if (response.status === 200) {
        msg += 'Successfully exported\n';
    } else {
        msg += 'Oh no! Something went wrong exporting\n';
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
    const url = serv + '/log';
    return http.
        fetch(
            url, 
            {
                method: 'PUT',
                body: formData
            })
            .then(response => response.json())
}