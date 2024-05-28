import ScraperBank from "../BrowserClasses";
import BCASelectors from "../helper/selector/BCASelector";
import { BCAParser } from "../helper/utils/Parser";
import log from "../helper/utils/Logger";

/**
 * Scraper for BCA (Bank Central Asia) that extends ScraperBank class.
 * @class ScrapBCA
 * @author fdciabdul
 * @memberof Bank
 */

class ScrapBCA extends ScraperBank {
    private log: typeof log;
    public page: any;
    private loginError: string | null;
    private dialogMessage: string | null;

    /**
     * Constructor for the ScrapBCA class.
     *
     * @param {string} user - The username for authentication.
     * @param {string} pass - The password for authentication.
     * @param {object} args - Additional arguments.
     * @param {boolean} [useFingerprintInjector=false] - Flag to use fingerprint injector.
     */
    constructor(user: string, pass: string, args: object, useFingerprintInjector: boolean = false) {
        super(user, pass, args);
        this.log = log;
        this.dialogMessage = null;
        this.loginError = null;
    }

    /**
     * Logs into BCA by launching the browser, navigating to the login page,
     * handling any dialogs, filling in the username and password fields,
     * clicking the submit button, and checking for any login errors.
     *
     * @return {Promise<void>} A promise that resolves once the login process is complete.
     */
    async loginToBCA(): Promise<void> {
        this.page = await this.launchBrowser();
        await this.page.goto(BCASelectors.LOGIN_PAGE.url, {
            waitUntil: "domcontentloaded"
        });

        this.page.on("dialog", async (dialog: { accept: () => any; message: () => any; }) => {
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

    async processGetBalance() {
        await this.page.goto(BCASelectors.SETTLEMENT_PAGE.url, {
            waitUntil: "domcontentloaded"
        });
        this.log("[ LOG ] [" + this.user + "] Success login ..");
        await this.page.click(BCASelectors.SETTLEMENT_PAGE.balanceLink);

        const newPage = await this.createTargetPage();
        this.log("[ LOG ] [" + this.user + "] Select date ..");

        return newPage;
    }

    async selectAccountAndSetDates(tglawal: number, blnawal: number, tglakhir: number, blnakhir: number) {
        await this.page.goto(BCASelectors.SETTLEMENT_PAGE.url, {
            waitUntil: "domcontentloaded"
        });
        this.log("[ LOG ] [" + this.user + "] Success login ..")
        await this.page.click(BCASelectors.SETTLEMENT_PAGE.settlementLink);

        const newPage = await this.createTargetPage();
        const padStart2 = (num: number) => num.toString().padStart(2, "0");
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
        const newTarget = await this.page.browser().waitForTarget((target: { opener: () => any; }) => target.opener() === pageTarget);
        const newPage = await newTarget.page();

        await this.handleDialogAndLogout(newPage);

        await newPage.reload({
            waitUntil: "domcontentloaded"
        });

        return newPage;
    }


    async getStatement(tglawal:number, blnawal:number, tglakhir:number, blnakhir:number) {
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
            newPage.on("dialog", async (dialog: { accept: () => any; message: () => string | null; }) => {
                await dialog.accept();
                this.log("[ LOG ] [" + this.user + "] " + dialog.message());
                this.dialogMessage = dialog.message();
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

    async handleDialogAndLogout(newPage : any) {
        newPage.on('dialog', async (dialog: any) => {
            this.dialogMessage = dialog.message();
            this.log(`[ LOG ] ["${this.user}"] ${this.dialogMessage}`);
            await dialog.dismiss();
            await this.logoutAndClose();
        });
    }

    async checkIfReturnToLogin(page:any, selector:any) {
        try {
            const element = await this.page.$(selector);
            return element ?? null;
        } catch (e) {
            this.log("[ LOG ] [" + this.user + "] " + e);
            return false;
        }
    }
}

export default ScrapBCA;