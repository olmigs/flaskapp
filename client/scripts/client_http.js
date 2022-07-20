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
    let opts;
    if (method === 'GET') {
        opts = {
            method: 'GET',
            headers: {
                'X-API-Key': key,
            },
            responseType: type,
        };
    } else if (endpoint === 'export') {
        opts = {
            method: method,
            headers: {
                'X-API-Key': key,
            },
            body: http.Body.form(data),
            responseType: type,
        };
    } else {
        opts = {
            method: method,
            headers: {
                'X-API-Key': key,
            },
            body: http.Body.json(data),
            responseType: type,
        };
    }
    return http.fetch(url, opts).then((resp) => {
        if (endpoint === 'export') {
            return resp;
        } else {
            return resp.data;
        }
    });
}

function getAPIKey() {
    return invoke('get_api_key');
}
