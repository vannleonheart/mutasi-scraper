const puppeteer = require("puppeteer-extra");
const stealthPlugin = require("puppeteer-extra-plugin-stealth");
const { executablePath } = require("puppeteer");
let newInjectedPage;
let isFingerprintInjectorEnabled = false;

puppeteer.use(stealthPlugin())

class ScraperBank {
  constructor(user, pass, args, useFingerprintInjector = false) {
    this.user = user || "username";
    this.pass = pass || "pass";
    
    this.proxyUrl = process.env.PROXY_URL; 
    this.anonymizedProxyUrl = null; 

    this.konfigbrowser = args ?? {
      headless: false,
      args: [
        "--window-position=000,000",
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--disable-web-security",
        "--disable-features=IsolateOrigins",
        "--disable-site-isolation-trials",
      ],
      executablePath: executablePath("chrome"),
      // userDataDir :"tmp"
    };

    // Enable fingerprint injector if parameter is true
    if (useFingerprintInjector) {
      newInjectedPage = require("fingerprint-injector");
      isFingerprintInjectorEnabled = true;
    }
  }

  async launchBrowser() {
    try {
      if (this.proxyUrl) {
        this.anonymizedProxyUrl = await proxyChain.anonymizeProxy(this.proxyUrl);
        this.konfigbrowser.args.push(`--proxy-server=${this.anonymizedProxyUrl}`);
      }

      this.browser = await puppeteer.launch(this.konfigbrowser);

      // Use fingerprint injector if enabled
      if (isFingerprintInjectorEnabled) {
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
      } else {
        this.page = await this.browser.newPage();
      }

      return this.page;
    } catch (e) {
      console.error(e);
    }
  }
}

module.exports = ScraperBank;
