// const http = require('@tauri-apps/api/http');
import { http } from '@tauri-apps/api';

export function callEndpoint(
    server,
    endpoint,
    responseType = 'json',
    method = 'GET',
    data = ''
) {
    const url = server + '/' + endpoint;
    var type;
    switch (responseType) {
        case 'json':
            type = http.ResponseType.JSON;
            break;
        case 'text':
            type = http.ResponseType.Text;
            break;
    }
    if (method === 'GET') {
        return http
            .fetch(url, {
                method: 'GET',
                responseType: type,
            })
            .then(resp => {
                return resp.data;
            });
    } else if (endpoint === 'export') {
        return http
            .fetch(url, {
                method: method,
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
                body: http.Body.json(data),
                responseType: type,
            })
            .then(resp => {
                return resp.data;
            });
    }
}
