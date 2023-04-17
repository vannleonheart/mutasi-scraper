const puppeteer = require("puppeteer-extra");
const stealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(stealthPlugin());
const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");
puppeteer.use(AdblockerPlugin({ blockTrackers: true }));
/** Main Class ScraperBank
 * @class ScraperBank
 * @date 2023-04-17
 * @param {any} user
 * @param {any} pass
 * @param {any} args
 * @returns {any}
 */
class ScraperBank {
  constructor(user, pass, args) {
    this.user = user || "username";
    this.pass = pass || "pass";
    this.konfigbrowser = args ?? {
      headless: false ,
      args: [
        '--log-level=3', // fatal only
        '--no-default-browser-check',
        '--disable-infobars',
        '--disable-web-security',
        '--disable-site-isolation-trials',
        '--no-experiments',
        '--ignore-gpu-blacklist',
        '--ignore-certificate-errors',
        '--ignore-certificate-errors-spki-list',
        '--mute-audio',
        '--disable-extensions',
        '--no-sandbox',
  
        '--no-first-run',
        '--no-zygote',
     ],
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
  async  moveMouse(page, startX, startY, endX, endY, steps, delay) {
    const mouse = page.mouse;
    await mouse.move(startX, startY);
  
    const deltaX = (endX - startX) / steps;
    const deltaY = (endY - startY) / steps;
  
    for (let step = 0; step < steps; step++) {
      await sleep(delay);
      await mouse.move(startX + deltaX * step, startY + deltaY * step);
    }
  
    // Complete the final step
    await mouse.move(endX, endY);
  }
  async sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

module.exports = ScraperBank;
