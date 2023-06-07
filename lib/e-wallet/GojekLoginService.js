const gojekApi = require('./gojekApi');
const { createBasePostData } = require('./helpers');

class GojekLoginService {
    async loginRequest(phoneNumber) {
        try {
            const data = createBasePostData({ phone_number: phoneNumber });
            const response = await gojekApi.post('/login/request', data);
            return response.data;
        } catch (error) {
            console.error(error);
        }
    }

    async verifyToken(otp, otpToken) {
        try {
            const data = createBasePostData({ 
                data: {
                    otp: otp,
                    otp_token: otpToken,
                },
                grant_type: 'otp',
                scopes: [],
            });
            const response = await gojekApi.post('/token', data);
            return response.data;
        } catch (error) {
            console.error(error);
        }
    }
}

module.exports = GojekLoginService;
