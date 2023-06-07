const ScraperBank = require("../BrowserClasses");
const {
	UA
} = require("../helper/UA");
const BNISelector = require("../helper/selector/BNISelector");
const {
	BNIParser
} = require("../helper/Parser");
class ScrapBNI extends ScraperBank {
	constructor(user, pass, args) {
		super(user, pass, args);
	}
	/**
	 * Login to BNI
	 * @date 2023-06-03
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
			await page.waitForNavigation();
                        if (await this.checkSettlement(page, BNISelector.SETTLEMENT_PAGE.displayMConError)) {
				
				return {
					message: "No Settlement Data"
				};
			}
			return page;
		} catch (e) {
			console.error(e);
			return null;
		}
	}
	/**
	 *  Get Settlement from today
	 * @date 2023-06-03
	 * @returns {Promise}
	 */
        async getSettlement() {
                const page = await this.login();
                if (!page) throw new Error("Login failed");
                try {
        
                        await page.waitForSelector(BNISelector.SETTLEMENT_PAGE.menuList);
                        await page.click(BNISelector.SETTLEMENT_PAGE.menuList);
                        await page.waitForSelector(BNISelector.SETTLEMENT_PAGE.accountMenuList);
                        const elements = await page.$x(BNISelector.SETTLEMENT_PAGE.mutasiText);
                        await elements[0].click();
                        await page.waitForSelector(BNISelector.SETTLEMENT_PAGE.mainAccountType);
                        await page.select(BNISelector.SETTLEMENT_PAGE.mainAccountType, "OPR");
                        await page.click(BNISelector.SETTLEMENT_PAGE.accountIDSelectRq);
                        await page.waitForSelector(BNISelector.SETTLEMENT_PAGE.searchOption);
                        await page.select(BNISelector.SETTLEMENT_PAGE.txnPeriod, "LastMonth");
                        await page.click(BNISelector.SETTLEMENT_PAGE.fullStmtInqRq);
        
                        if (await this.checkSettlement(page, BNISelector.SETTLEMENT_PAGE.displayMConError)) {
                                await this.logoutAndClose(page);
                                return {
                                        message: "No Settlement Data"
                                };
                        }
                        await page.waitForSelector(BNISelector.SETTLEMENT_PAGE.tableRows);
                        const tableData = await page.$$eval(BNISelector.SETTLEMENT_PAGE.tableRows, (rows) => {
                                return Array.from(rows, (row) => {
                                    const columns = row.querySelectorAll("td");
                                    return Array.from(columns, (column) => column.innerText);
                                });
                            });
                        await this.logoutAndClose(page);
                        const parser = new BNIParser();
			const result = parser.parse(tableData);
			return result;
        
                } catch (error) {
                        return {
                                message: "No Settlement Data"
                        };
                }
        }
        

	async logoutAndClose(page) {
		await page.click(BNISelector.SETTLEMENT_PAGE.logout);
		await page.waitForSelector(BNISelector.SETTLEMENT_PAGE.logoutConfirm);
		await page.click(BNISelector.SETTLEMENT_PAGE.logoutConfirm);
		await page.browser().close();
	}

	async checkSettlement(page, selector) {
                try {
                    const element = await page.$(selector);
                    if (element) {
                        const errorMessage = await page.$eval(selector, element => element.textContent);
                        return errorMessage;
                    }
                    return null;
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