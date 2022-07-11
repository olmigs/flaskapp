// const http = require('@tauri-apps/api/http');
import { http, invoke } from '@tauri-apps/api';

export async function callEndpoint(
    server,
    endpoint,
    responseType = 'json',
    method = 'GET',
    data = ''
) {
    
    let type;
    switch (responseType) {
        case 'json':
            type = http.ResponseType.JSON;
            break;
        case 'text':
            type = http.ResponseType.Text;
            break;
    }
    const url = server + '/' + endpoint;
    const key = await getAPIKey();
    // console.log(key);
    if (method === 'GET') {
        return http
            .fetch(url, {
                method: 'GET',
                headers: {
                    'X-API-Key': key
                },
                responseType: type,
            })
            .then(resp => {
                return resp.data;
            });
    } else if (['export', 'log'].includes(endpoint)) {
        return http
            .fetch(url, {
                method: method,
                headers: {
                    'X-API-Key': key
                },
                body: http.Body.form(data),
                responseType: type,
            })
            .then(resp => {
                return resp;
            });
    } else {
        return http
            .fetch(url, {
                method: method,
                headers: {
                    'X-API-Key': key
                },
                body: http.Body.json(data),
                responseType: type,
            })
            .then(resp => {
                return resp.data;
            });
    }
}

function getAPIKey() {
    return invoke('get_api_key');
}
