import puppeteer from "puppeteer-extra";
import stealthPlugin from "puppeteer-extra-plugin-stealth";
import { newInjectedPage } from "fingerprint-injector";
import chromePath from "./helper/utils/chromeLauncher";
import { ConfigBrowser } from './interfaces/browserConfig'; // Assuming this is correctly imported

// Apply the stealth plugin to the puppeteer instance
puppeteer.use(stealthPlugin());

/** Main Class ScraperBank
 * @class ScraperBank
 * @date 2023-04-17
 * @param {string} user - Username for authentication.
 * @param {string} pass - Password for authentication.
 * @param {ConfigBrowser} args - Configuration arguments for the browser.
 */
class ScraperBank {
  public user: string;
  public pass: string;
  private configBrowser: ConfigBrowser;
  public browser: any;
  public page: any;

  constructor(user: string, pass: string, args?: Partial<ConfigBrowser>) {
    this.user = user || "username";
    this.pass = pass || "pass";
    const executablePath = chromePath.chrome ?? puppeteer.executablePath();

    this.configBrowser = {
      headless: false,
      args: [
        "--window-position=000,000",
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--disable-web-security",
        "--disable-features=IsolateOrigins",
        "--disable-site-isolation-trials",
      ],
      executablePath, 
      ...args,
    };
  }

  async launchBrowser(): Promise<any> {
    try {
      this.browser = await puppeteer.launch(this.configBrowser);
      this.page = await newInjectedPage(this.browser, {
        fingerprintOptions: {
          devices: ['desktop'],
          operatingSystems: ['macos'],
        },
      });

      return this.page;
    } catch (e) {
      console.error(e);
      throw e; 
    }
  }
}

export default ScraperBank;