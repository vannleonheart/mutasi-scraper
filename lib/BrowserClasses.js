const puppeteer = require("puppeteer-extra");
const stealthPlugin = require("puppeteer-extra-plugin-stealth");
const chromePath = require("./helper/chromePath");
const startServer = require("./helper/localProxy");
startServer();
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
      headless: "new",
      args: [
        "--log-level=3", // fatal only
        "--no-default-browser-check",
        "--no-sandbox",
        "--no-first-run",
        "--no-zygote",
        '--proxy-server=socks5://localhost:1080',
      ],
      executablePath: chromePath.chrome,
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
