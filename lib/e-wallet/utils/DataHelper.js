const createBasePostData = (additionalData = {}) => {
    const baseData = {
        client_id: 'gojek:consumer:app',
        client_secret: 'pGwQ7oi8bKqqwvid09UrjqpkMEHklb',
        country_code: '+62',
        login_type: '',
        magic_link_ref: '',
    };
    
    return {...baseData, ...additionalData};
};

module.exports = {
    createBasePostData
};
