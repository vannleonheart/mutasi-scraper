const ScraperBank = require("../BrowserClasses");
const {UA} = require("../helper/UA");
const BNISelector = require("../helper/selector/BNISelector");
const BCAParser = require("../helper/Parser");
class ScrapBNI extends ScraperBank {
        constructor(user, pass, args) {
                super(user, pass, args);
        }
        /**
         * Login to BCA
         * @date 2023-04-17
         * @returns {Promise <>}
         */
        async login() {
                try {
                        const page = await this.launchBrowser();
                        await page.setUserAgent(UA());
                        await page.goto(BNISelector.LOGIN_PAGE.url, {
                                waitUntil: "networkidle2"
                        });
                        await page.waitForSelector(BNISelector.LOGIN_PAGE.gotologin);
                        await page.click(BNISelector.LOGIN_PAGE.gotologin);
                        await page.type(BNISelector.LOGIN_PAGE.userField, this.user, {
                                delay: 100
                        });
                        await page.type(BNISelector.LOGIN_PAGE.passField, this.pass, {
                                delay: 100
                        });
                        await page.waitForSelector(BNISelector.LOGIN_PAGE.submitButton);
                        await page.keyboard.press('Enter');

                        return page;
                } catch (e) {
                        console.error(e);
                        return null;
                }
        }
        /**
         *  Get Settlement from selected date
         * @date 2023-04-17
         * @param {string} tglawal ( Harus berbentuk string )
         * @param {string} blnawal ( Harus berbentuk string )
         * @param {string} tglakhir ( Harus berbentuk string )
         * @param {string} blnakhir ( Harus berbentuk string )
         * @returns {Promise}
         */
        async getSettlement(tglawal, blnawal, tglakhir, blnakhir) {
                const page = await this.login();
                if (!page) throw new Error("Login failed");
               
        }
        /**
         * Function to logout and close browser
         * @date 2023-04-17
         * @param {string} page
         * @returns {Promise}
         */
        async logoutAndClose(page) {
                await page.goto(BNISelector.LOGOUT_PAGE.url, {
                        waitUntil: "networkidle2"
                });
                await this.closeBrowser(page);
        }
        /**
         * Funtion to parse settlement
         * @date 2023-04-17
         * @param {string} html
         * @returns {Promise}
         */
        async checkIfReturnToLogin(page, selector) {
                try {
                        const element = await page.$(selector);
                        return element ?? null;
                } catch (e) {
                        console.error(e);
                        return false;
                }
        }
        async sleep(ms) {
                return new Promise((resolve) => setTimeout(resolve, ms));
        }
}
module.exports = ScrapBNI;