import moment from "moment";
import ScraperBank from "../BrowserClasses";
import RecaptchaSolver from "puppeteer-recaptcha-bypass";
import BRISelectors from "../helper/selector/BRISelector";
import { BRIParser } from "../helper/utils/Parser";

/**
 * ScrapBRI class for scraping BRI (Bank Rakyat Indonesia) data.
 * @class ScrapBRI
 * @extends ScraperBank
 */
class ScrapBRI extends ScraperBank {
  private corpID: string;
  private norek: string;
  private apiKey: string;
  public page: any;

  constructor(corpID: string, user: string, pass: string, norek: string, apiKey: string) {
    super(user, pass);
    this.corpID = corpID;
    this.norek = norek;
    this.apiKey = apiKey;
  }

  async loginToBRI(): Promise<any> {
    this.page = await this.launchBrowser();
    const selectors = BRISelectors.LOGIN_PAGE;
  
    await this.page.goto(selectors.url);
    await this.page.waitForSelector(selectors.corpID);
    await RecaptchaSolver(this.page, this.apiKey);
    await this.page.type(selectors.corpID, this.corpID);
    await this.page.type(selectors.userID, this.user);
    await this.page.type(selectors.passwordField, this.pass);
    await this.page.click(selectors.submitButton);
    await this.page.waitForNavigation({ waitUntil: 'networkidle0' });
  
    return this.page;
  }
  
  async getStatement(): Promise<any> {
    if (!this.apiKey) {
      throw new Error("API key is required");
    }
  
    try {
      const page = await this.loginToBRI();
      await page.click(BRISelectors.LOGIN_PAGE.debitAccountView);
      await page.waitForSelector(BRISelectors.LOGIN_PAGE.selectResultsOptions);
  
      const accountValue = await this.selectAccount(page, this.norek);
      const token = await page.$eval(BRISelectors.LOGIN_PAGE.tokenInput, (el: HTMLInputElement) => el.value);
      const formattedDate = this.formatCurrentDate();
      await this.applyDateFilter(page, formattedDate);
  
      const data = await this.fetchAccountDetails(accountValue, formattedDate, token);
      await page.goto("https://newbiz.bri.co.id/logout");
  
      return new BRIParser().parse(data);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  private async selectAccount(page: any, accountNumber: string): Promise<string> {
    const selectors = BRISelectors.LOGIN_PAGE;
    await page.waitForSelector(selectors.selectResultsOptions);
    const options = await page.$$eval(selectors.selectResultsOptions, (nodes: any[]) =>
      nodes.map((n) => ({
        value: n.innerText,
        id: n.getAttribute("id"),
      }))
    );
    const option = options.find((o: { value: string | string[]; }) => o.value.includes(accountNumber));
  
    if (!option) {
      throw new Error(`Account with number ${accountNumber} not found`);
    }
    await page.click(`li#${option.id}`);
  
    return option.value;
  }
  
  private async applyDateFilter(page: any, formattedDate: string): Promise<void> {
    const selectors = BRISelectors.LOGIN_PAGE;
  
    await page.type(selectors.periodeView, formattedDate);
  
    await page.click(selectors.applyDateButton);
      await page.waitForResponse((response: any) =>
      response.url().includes('someEndpoint') && response.status() === 200
    );
  }
  async fetchAccountDetails(accountValue: string, formattedDate: string, token: string): Promise<any> {
    const response = await this.page.evaluate(async (accountValue: any, formattedDate: any, token: any) => {
      const res = await fetch("https://newbiz.bri.co.id/account/requestView", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "*/*",
          "Accept-Language": "en-US,en;q=0.9",
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin",
          "X-Requested-With": "XMLHttpRequest",
          "Sec-CH-UA": '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
          "Sec-CH-UA-Mobile": "?0",
          "Sec-CH-UA-Platform": '"Linux"'
        },
        referrer: "https://newbiz.bri.co.id/accountinformation",
        referrerPolicy: "strict-origin-when-cross-origin",
        body: JSON.stringify({
          debitaccount: accountValue,
          periode: formattedDate,
          _token: token
        }),
        credentials: "include"
      });
      return res.json();
    }, accountValue, formattedDate, token);
  
    return response.data.list;
  }

  formatCurrentDate(): string {
    const currentDate = new Date();
    const day = currentDate.getDate().toString().padStart(2, "0");
    const month = (currentDate.getMonth() + 1).toString().padStart(2, "0");
    const year = currentDate.getFullYear();
    const formattedDate = `${day}-${month}-${year} - ${day}-${month}-${year}`;
    
    return formattedDate;
  }
}

export default ScrapBRI;