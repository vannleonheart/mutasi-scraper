import ScraperBank from "../BrowserClasses";
import BNISelector from "../helper/selector/BNISelector";
import { BNIParser } from "../helper/utils/Parser";
/**
 * Scraper for BNI (Bank Negara Indonesia) that extends ScraperBank class.
 * @author fdciabdul
 * @memberof Bank
 * @class ScrapBNI
 */
class ScrapBNI extends ScraperBank {
  constructor(user: any, pass: any, args: any, useFingerprintInjector = false) {
    super(user, pass, args);
  }

  async login() {
    try {
      const page = await this.launchBrowser();
      await page.goto(BNISelector.LOGIN_PAGE.url, {
        waitUntil: "networkidle2",
      });
      await page.waitForSelector(BNISelector.LOGIN_PAGE.gotologin);
      await page.click(BNISelector.LOGIN_PAGE.gotologin);
      await page.type(BNISelector.LOGIN_PAGE.userField, this.user, {
        delay: 100,
      });
      await page.type(BNISelector.LOGIN_PAGE.passField, this.pass, {
        delay: 100,
      });
      await page.waitForSelector(BNISelector.LOGIN_PAGE.submitButton);
      await page.keyboard.press("Enter");
      await page.waitForNavigation();
      if (
        await this.checkSettlement(
          page,
          BNISelector.SETTLEMENT_PAGE.displayMConError
        )
      ) {
        return {
          message: "No Settlement Data",
        };
      }
      return page;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  async getStatement() {
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

      if (
        await this.checkSettlement(
          page,
          BNISelector.SETTLEMENT_PAGE.displayMConError
        )
      ) {
        await this.logoutAndClose(page);
        return {
          message: "No Settlement Data",
        };
      }
      await page.waitForSelector(BNISelector.SETTLEMENT_PAGE.tableRows);
      const tableData = await page.$$eval(
        BNISelector.SETTLEMENT_PAGE.tableRows,
        (rows: Iterable<HTMLElement> | ArrayLike<HTMLElement>):any => {
          return Array.from(rows, (row: HTMLElement) => {
            const columns: NodeListOf<HTMLElement> = row.querySelectorAll("td");
            return Array.from(columns, (column) => column.innerText);
          });
        }
      );
      await this.logoutAndClose(page);
      const parser = new BNIParser();
      const result = parser.parse(tableData);
      return result;
    } catch (error) {
      return {
        message: "No Settlement Data",
      };
    }
  }


  async logoutAndClose(page: { click: (arg0: any) => any; waitForSelector: (arg0: any) => any; browser: () => { (): any; new(): any; close: { (): any; new(): any; }; }; }) {
    await page.click(BNISelector.SETTLEMENT_PAGE.logout);
    await page.waitForSelector(BNISelector.SETTLEMENT_PAGE.logoutConfirm);
    await page.click(BNISelector.SETTLEMENT_PAGE.logoutConfirm);
    await page.browser().close();
  }

  
  async checkSettlement(page: { $: (arg0: any) => any; $eval: (arg0: any, arg1: (element: any) => any) => any; }, selector: any) {
    try {
      const element = await page.$(selector);
      if (element) {
        const errorMessage = await page.$eval(
          selector,
          (element: { textContent: any; }) => element.textContent
        );
        return errorMessage;
      }
      return null;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  async sleep(ms: number | undefined) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}


export default ScrapBNI;