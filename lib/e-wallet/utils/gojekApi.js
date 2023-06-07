const axios = require('axios');

const gojekApi = axios.create({
    baseURL: 'https://goid.gojekapi.com/goid',
    headers: {
        'x-appversion': '4.67.2',
        'x-appid': 'com.gojek.app',
        'x-platform': 'Android',
        'x-uniqueid': 'a7035ec7c71b5e53',
        accept: 'application/json',
        authorization: 'Bearer',
        'x-user-type': 'customer',
        'x-deviceos': 'Android,11',
        'x-phonemake': 'Google',
        'x-pushtokentype': 'FCM',
        'x-phonemodel': 'google,sdk_gphone_x86',
        'accept-language': 'en-ID',
        'x-user-locale': 'en_ID',
        'content-type': 'application/json; charset=UTF-8',
        host: 'goid.gojekapi.com',
        connection: 'Keep-Alive',
        'accept-encoding': 'gzip',
        'user-agent': 'okhttp/4.10.0'
    },
});

module.exports = gojekApi;
