const ScraperBank = require("../BrowserClasses");
const BCASelectors = require("../helper/selector/BCASelector");
const { BCAParser } = require("../helper/utils/Parser");
const log = require("../helper/utils/Logger");

/**
 * Scraper for BCA (Bank Central Asia) that extends ScraperBank class.
 * @class ScrapBCA
 * @author fdciabdul
 * @memberof Bank
 */

class ScrapBCA extends ScraperBank {
    /**
     * Constructor for ScrapBCA class.
     * @constructor
     * @param {string} user - BCA username.
     * @param {string} pass - BCA password.
     * @param {string} norek - BCA account number.
     * @param {object} args - Additional arguments.
     * @param {boolean} useFingerprintInjector - Flag to use fingerprint injector.
     * 
     * @example new ScrapBCA('user','pass',true);
     */
    constructor(user, pass, norek, args, useFingerprintInjector = false) {
        super(user, pass, args, useFingerprintInjector);
        this.norek = norek;
        this.log = log;
    }

    /**
     * Logs in to the BCA website.
     * @async 
     * @example loginToBCA()
     */
    async loginToBCA() {
        this.page = await this.launchBrowser();
        await this.page.goto(BCASelectors.LOGIN_PAGE.url, {
            waitUntil: "domcontentloaded"
        });

        this.page.on("dialog", async dialog => {
            await dialog.accept();
            this.log("[ LOG ] [" + this.user + "] " + dialog.message());
            this.loginError = dialog.message();
        });
        this.log("[ LOG ] [" + this.user + "] [" + this.user + "] Login to BCA .. ")
        await this.page.type(BCASelectors.LOGIN_PAGE.userField, this.user, {
            delay: 100
        });
        await this.page.type(BCASelectors.LOGIN_PAGE.passField, this.pass);
        await this.page.click(BCASelectors.LOGIN_PAGE.submitButton, {
            delay: 200
        });

        await this.page.waitForTimeout(2000);
        if (this.loginError) {
            throw new Error(this.loginError);
        }
    }

    /**
     * Processes getting the balance.
     * @async
     * @param {Object} page - Page object.
     * @returns {Object} - New page object.
     * @example processGetBalance(<objectPage>);
     */
    async processGetBalance(page) {
        await this.page.goto(BCASelectors.SETTLEMENT_PAGE.url, {
            waitUntil: "domcontentloaded"
        });
        this.log("[ LOG ] [" + this.user + "] Success login ..");
        await this.page.click(BCASelectors.SETTLEMENT_PAGE.balanceLink);

        const newPage = await this.createTargetPage(page);
        this.log("[ LOG ] [" + this.user + "] Select date ..");


        return newPage;
    }

    /**
     * Selects account and sets date for transactions.
     * @async
     * @param {number} tglawal - Start date.
     * @param {number} blnawal - Start month.
     * @param {number} tglakhir - End date.
     * @param {number} blnakhir - End month.
     * @returns {Object} - New page object.
     * @example selectAccountAndSetDates(tglawal, blnawal, tglakhir, blnakhir)
     */
    async selectAccountAndSetDates(tglawal, blnawal, tglakhir, blnakhir) {
        await this.page.goto(BCASelectors.SETTLEMENT_PAGE.url, {
            waitUntil: "domcontentloaded"
        });
        this.log("[ LOG ] [" + this.user + "] Success login ..")
        await this.page.click(BCASelectors.SETTLEMENT_PAGE.settlementLink);

        const newPage = await this.createTargetPage();
        const padStart2 = num => num.toString().padStart(2, "0");
        if (tglawal || blnawal || tglakhir || blnakhir) {
            this.log("[ LOG ] [" + this.user + "] Select date ..")
            await newPage.waitForSelector(BCASelectors.SETTLEMENT_PAGE.startDateField);
            await newPage.select(BCASelectors.SETTLEMENT_PAGE.startDateField, padStart2(tglawal));
            await newPage.select(BCASelectors.SETTLEMENT_PAGE.startMonthField, blnawal.toString());
            await newPage.select(BCASelectors.SETTLEMENT_PAGE.endDateField, padStart2(tglakhir));
            await newPage.select(BCASelectors.SETTLEMENT_PAGE.endMonthField, blnakhir.toString());
            this.log("[ LOG ] [" + this.user + "] Get mutasi ..")
            await newPage.click(BCASelectors.SETTLEMENT_PAGE.submitButton, {
                delay: 1500
            });

            await this.page.waitForTimeout(3000);
            return newPage;
        } else {
            this.log("[ LOG ] [" + this.user + "] Get latest mutasi ..")
            await newPage.click(BCASelectors.SETTLEMENT_PAGE.submitButton, {
                delay: 1500
            });
            await this.page.waitForTimeout(3000);
            return newPage;
        }

    }

    /**
     * Creates a new target page (get new window).
     * @async
     * @returns {Object} - New page object.
     */
    async createTargetPage() {
        const pageTarget = this.page.target();
        const newTarget = await this.page.browser().waitForTarget(target => target.opener() === pageTarget);
        const newPage = await newTarget.page();

        await this.handleDialogAndLogout(newPage);

        await newPage.reload({
            waitUntil: "domcontentloaded"
        });

        return newPage;
    }



    /**
     * Gets the statement for a specified date range.
     * @async
     * @param {number} tglawal - Start date.
     * @param {number} blnawal - Start month.
     * @param {number} tglakhir - End date.
     * @param {number} blnakhir - End month.
     * @returns {Object} - Statement information. / if not set it will return latest statement
     */
    async getStatement(tglawal, blnawal, tglakhir, blnakhir) {
        this.dialogMessage = null;

        try {
            await this.loginToBCA();

            const newPage = await this.selectAccountAndSetDates(tglawal, blnawal, tglakhir, blnakhir);

            const result = await newPage.evaluate(() => document.body.innerHTML);
            let parser;
            if (result.includes("Account Number")) {
                parser = new BCAParser(result, BCASelectors.PARSING_FIELD_ENG);
            } else {
                parser = new BCAParser(result, BCASelectors.PARSING_FIELD);
            }
            let resultsettlement = parser.parse();
            this.log("[ LOG ] [" + this.user + "] Success get mutasi for (" + this.user + ")" + " Jumlah mutasi (" + resultsettlement.length + ")");
            const exists = await this.checkIfReturnToLogin(newPage, BCASelectors.LOGIN_PAGE.userField);

            if (exists) {
                throw new Error("Loopback detected");
            }

            await this.logoutAndClose();
            newPage.on("dialog", async dialog => {
                await dialog.accept();
                this.log("[ LOG ] [" + this.user + "] " + dialog.message());
                dialogMessage = dialog.message();
            });

            return resultsettlement;

        } catch (error) {
            this.log("[ LOG ] [" + this.user + "] " + error);
            await this.logoutAndClose();
            return {
                status: false,
                error: this.dialogMessage ?? error
            };
        }
    }

    /**
     * Logs out and closes the session.
     * @async
     */
    async logoutAndClose() {
        try {
            this.log("[ LOG ] [" + this.user + "] Logout..");
            await this.page.goto(BCASelectors.LOGOUT_PAGE.url, {
                waitUntil: "domcontentloaded"
            });
            await this.browser.close();
        } catch {
            return null;
        }
    }

    /**
     * Handles dialog and logs out the page.
     * @async
     * @param {Object} newPage - New page object.
     */

    async handleDialogAndLogout(newPage) {
        newPage.on('dialog', async (dialog) => {
            this.dialogMessage = dialog.message();
            this.log('Dialog message: ', this.dialogMessage);
            await dialog.dismiss();
            await this.logoutAndClose(newPage);
        });
    }

   /**
     * Checks if it returns to the login page.
     * @async
     * @param {Object} page - Page object.
     * @param {string} selector - Selector to check.
     * @returns {boolean} - Returns true if it returns to the login page.
     */
    async checkIfReturnToLogin(page, selector) {
        try {
            const element = await this.page.$(selector);
            return element ?? null;
        } catch (e) {
            this.log("[ LOG ] [" + this.user + "] " + e);
            return false;
        }
    }
}

module.exports = ScrapBCA;