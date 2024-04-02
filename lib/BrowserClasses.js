const puppeteer = require("puppeteer-extra");
const stealthPlugin = require("puppeteer-extra-plugin-stealth");
const {executablePath } = require("puppeteer");
const chromepath = require('./launcher');
const { newInjectedPage } = require("fingerprint-injector");
const chromePath = require("./helper/utils/chromeLauncher");
/** Main Class ScraperBank
 * @class ScraperBank
 * @date 2023-04-17
 * @param {any} user
 * @param {any} pass
 * @param {any} args
 * @returns {Promise}
 */
puppeteer.use(stealthPlugin());

class ScraperBank {
  constructor(user, pass, args) {
    this.user = user || "username";
    this.pass = pass || "pass";
    

    this.configBrowser = args ?? {
      headless: "new",
      args: [
        "--window-position=000,000",
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--disable-web-security",
        "--disable-features=IsolateOrigins",
        "--disable-site-isolation-trials",
      ],
      executablePath: chromePath.chrome,

    };
  }

  async launchBrowser() {
    try {

      this.browser = await puppeteer.launch(this.configBrowser);
      this.page = await newInjectedPage(
        this.browser,
        {
            // constraints for the generated fingerprint
            fingerprintOptions: {
                devices: ['desktop'],
                operatingSystems: ['macos'],
            },
        },
    );


    
      return this.page;
    } catch (e) {
      console.log(e);
    }
  }


}

module.exports = ScraperBank;