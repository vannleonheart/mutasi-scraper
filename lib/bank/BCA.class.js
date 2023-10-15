const ScraperBank = require("../BrowserClasses");
const {UA} = require("../helper/utils/UA");
const BCASelectors = require("../helper/selector/BCASelector");
const {BCAParser} = require("../helper/utils/Parser");
const log = require("../helper/utils/Logger");
class ScrapBCA extends ScraperBank {
    constructor(user, pass, norek, args) {
        super(user, pass, args);
        this.norek = norek;
        this.log = log;
    }

    async launchAndSetupBrowser() {
        const page = await this.launchBrowser();
        this.log("[ LOG ] [" + this.user + "] Starting ..")
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(window, "navigator", {
                value: new Proxy(navigator, {
                    has: (target, key) => (key === "webdriver" ? false : key in target),
                    get: (target, key) =>
                        key === "webdriver" ?
                        undefined : typeof target[key] === "function" ?
                        target[key].bind(target) : target[key],
                }),
            });
        });
        await page.setUserAgent(UA());

        return page;
    }

    async loginToBCA(page) {
        await page.goto(BCASelectors.LOGIN_PAGE.url, {
            waitUntil: "domcontentloaded"
        });

        page.on("dialog", async dialog => {
            await dialog.accept();
            this.log("[ LOG ] [" + this.user + "] " + dialog.message());
            this.loginError = dialog.message();
        });
        this.log("[ LOG ] [" + this.user + "] [" + this.user + "] Login to BCA .. ")
        await page.type(BCASelectors.LOGIN_PAGE.userField, this.user, {
            delay: 100
        });
        await page.type(BCASelectors.LOGIN_PAGE.passField, this.pass);
        await page.click(BCASelectors.LOGIN_PAGE.submitButton, {
            delay: 200
        });

        await page.waitForTimeout(2000);
        if (this.loginError) {
            throw new Error(this.loginError);
        }
    }

    async processGetBalance(page) {
        await page.goto(BCASelectors.SETTLEMENT_PAGE.url, {
            waitUntil: "domcontentloaded"
        });
        this.log("[ LOG ] [" + this.user + "] Success login ..");
        await page.click(BCASelectors.SETTLEMENT_PAGE.balanceLink);

        const newPage = await this.createTargetPage(page);
        this.log("[ LOG ] [" + this.user + "] Select date ..");


        return newPage;
    }

    async selectAccountAndSetDates(page, tglawal, blnawal, tglakhir, blnakhir) {
        await page.goto(BCASelectors.SETTLEMENT_PAGE.url, {
            waitUntil: "domcontentloaded"
        });
        this.log("[ LOG ] [" + this.user + "] Success login ..")
        await page.click(BCASelectors.SETTLEMENT_PAGE.settlementLink);

        const newPage = await this.createTargetPage(page);
        const padStart2 = num => num.toString().padStart(2, "0");
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
        //   await newPage.waitForNavigation();
        await page.waitForTimeout(3000);

        return newPage;
    }

    async createTargetPage(page) {
        const pageTarget = page.target();
        const newTarget = await page.browser().waitForTarget(target => target.opener() === pageTarget);
        const newPage = await newTarget.page();

        await this.handleDialogAndLogout(newPage);

        await newPage.setDefaultNavigationTimeout(0);
        await newPage.setUserAgent(UA());
        await newPage.reload({
            waitUntil: "domcontentloaded"
        });

        return newPage;
    }




    async getBalance(tglawal, blnawal, tglakhir, blnakhir) {
        const page = await this.launchAndSetupBrowser();
        this.dialogMessage = null; // Initialize dialogMessage

        try {
            await this.loginToBCA(page);
            const newPage = await this.processGetBalance(page, tglawal, blnawal, tglakhir, blnakhir);

            // Check for dialog message

            const result = await newPage.evaluate(() => document.body.innerHTML);
            const parser = new BCAParser(result, "body > table:nth-child(3)");
            let resultsettlement = parser.parseBalance();
            this.log("[ LOG ] [" + this.user + "] Success get Balance for (" + this.user + ")");
            const exists = await this.checkIfReturnToLogin(newPage, BCASelectors.LOGIN_PAGE.userField);

            if (exists) {
                throw new Error("Loopback detected");
            }

            await this.logoutAndClose(page);


            return resultsettlement;
        } catch (error) {
            this.log("[ LOG ] [" + this.user + "] " + error);
            await this.logoutAndClose(page);
            return {
                status: false,
                error: this.dialogMessage
            };
        }
    }


    async getStatement(tglawal, blnawal, tglakhir, blnakhir) {
        const page = await this.launchAndSetupBrowser();
        this.dialogMessage = null; // Initialize dialogMessage

        try {
            await this.loginToBCA(page);
            const newPage = await this.selectAccountAndSetDates(page, tglawal, blnawal, tglakhir, blnakhir);

            // Check for dialog message

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

            await this.logoutAndClose(page);
            newPage.on("dialog", async dialog => {
                await dialog.accept();
                this.log("[ LOG ] [" + this.user + "] " + dialog.message());
                dialogMessage = dialog.message(); // Store the error message
            });

            return resultsettlement;

        } catch (error) {
            this.log("[ LOG ] [" + this.user + "] " + error);
            await this.logoutAndClose(page);
            return {
                status: false,
                error: this.dialogMessage
            };
        }
    }

    async logoutAndClose(page) {
        try {
            this.log("[ LOG ] [" + this.user + "] Logout..");
            await page.goto(BCASelectors.LOGOUT_PAGE.url, {
                waitUntil: "domcontentloaded"
            });
            await this.closeBrowser(page);
        } catch {
            return null;
        }
    }

    async handleDialogAndLogout(newPage) {
        newPage.on('dialog', async (dialog) => {
            this.dialogMessage = dialog.message();
            this.log('Dialog message: ', this.dialogMessage);
            await dialog.dismiss();
            await this.logoutAndClose(newPage);
        });
    }

    async checkIfReturnToLogin(page, selector) {
        try {
            const element = await page.$(selector);
            return element ?? null;
        } catch (e) {
            this.log("[ LOG ] [" + this.user + "] " + e);
            return false;
        }
    }
}

module.exports = ScrapBCA;