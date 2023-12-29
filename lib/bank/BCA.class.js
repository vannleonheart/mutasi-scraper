const ScraperBank = require("../BrowserClasses");
const BCASelectors = require("../helper/selector/BCASelector");
const { BCAParser } = require("../helper/utils/Parser");
const log = require("../helper/utils/Logger");
class ScrapBCA extends ScraperBank {
    constructor(user, pass, norek, args, useFingerprintInjector = false) {
        super(user, pass, args, useFingerprintInjector);
        this.norek = norek;
        this.log = log;
    }


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

            await this.logoutAndClose();


            return resultsettlement;
        } catch (error) {
            this.log("[ LOG ] [" + this.user + "] " + error);
            await this.logoutAndClose();
            return {
                status: false,
                error: this.dialogMessage
            };
        }
    }


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
            const element = await this.page.$(selector);
            return element ?? null;
        } catch (e) {
            this.log("[ LOG ] [" + this.user + "] " + e);
            return false;
        }
    }
}

module.exports = ScrapBCA;