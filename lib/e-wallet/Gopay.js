const axios = require('axios');
const gojekConfig = require('./utils/gojekConfig');

class GoPayService {
    constructor(bearerToken) {
        this.baseURL = 'https://api.gojekapi.com/gojek/v2/customer';
        this.headers = { 
            ...gojekConfig.headers, 
            authorization: `Bearer ${bearerToken}`
        };
    }

    async getCustomerData() {
        try {
            const response = await axios({
                method: 'GET',
                url: this.baseURL,
                headers: this.headers,
            });
            return this.parseCustomerData(response.data);
        } catch (error) {
            console.error(error);
        }
    }

    parseCustomerData(data) {
        const customer = data.customer;
        return {
            id: customer.id,
            nama: customer.name,
            surel: customer.email,
            telepon: customer.phone,
            nomor: customer.number,
            negara: customer.signed_up_country,
            kodeNegara: customer.country_code,
            surelTerverifikasi: customer.email_verified,
            lokal: customer.locale,
            terhubungFacebook: customer.facebook_connected,
            dibuatPada: customer.created_at,
            urlGambarProfil: customer.profile_image_url
        };
    }
}
module.exports = GoPayService;
