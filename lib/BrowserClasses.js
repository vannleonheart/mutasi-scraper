const puppeteer = require("puppeteer-extra");
const stealthPlugin = require("puppeteer-extra-plugin-stealth");
const {executablePath } = require("puppeteer");
/** Main Class ScraperBank
 * @class ScraperBank
 * @date 2023-04-17
 * @param {any} user
 * @param {any} pass
 * @param {any} args
 * @returns {Promise}
 */
puppeteer.use(stealthPlugin())
class ScraperBank {
  constructor(user, pass, args) {
    this.user = user || "username";
    this.pass = pass || "pass";
    this.konfigbrowser = args ?? {
      headless: false,
      args: [
        "--window-position=000,000",
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--disable-web-security",
        "--disable-features=IsolateOrigins",
        " --disable-site-isolation-trials",
      ],
      //userDataDir: "tmp",
      executablePath : executablePath("chrome")
    };
  }
  async launchBrowser() {
    try {
      const browser = await puppeteer.launch(this.konfigbrowser);
      const page = await browser.newPage();
      return page;
    } catch (e) {
      console.log(e);
    }
  }

  async closeBrowser(page) {
    try {
      await page.browser().close();
    } catch (e) {
      console.log(e);
    }
  }
}

module.exports = ScraperBank;
