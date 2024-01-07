
const moment = require("moment");
const ScraperBank = require("../BrowserClasses");
const RecaptchaSolver = require("puppeteer-recaptcha-bypass");
const BRISelectors = require("../helper/selector/BRISelector");

/**
 * ScrapBRI class for scraping BRI (Bank Rakyat Indonesia) data.
 * @class
 * @extends ScraperBank
 * @memberof Bank
 */

class ScrapBRI extends ScraperBank {
  /**
   * Constructor for ScrapBRI class.
   * @constructor
   * @param {string} corpID - BRI corporate ID.
   * @param {string} user - BRI username.
   * @param {string} pass - BRI password.
   * @param {string} norek - BRI account number.
   * @param {string} apiKey - API key for RecaptchaSolver.
   * @param {boolean} useFingerprintInjector - Flag to use fingerprint injector.
   */
  constructor(corpID, user, pass, norek, apikey, useFingerprintInjector) {
    super(user, pass, useFingerprintInjector);
    this.corpID = corpID;
    this.norek = norek;
    this.apiKey = apikey
  }

  /**
   * Logs in to the BRI website.
   * @async
   * @returns {Object} - Page object.
   */
  async loginToBRI() {
    this.page = await this.launchBrowser();

    const selectors = BRISelectors.LOGIN_PAGE;
    await this.page.goto(selectors.url);
    await this.page.waitForSelector(selectors.corpID);
    await RecaptchaSolver(this.page, this.apiKey)
    await this.page.type(selectors.corpID, this.corpID);
    await this.page.type(selectors.userID, this.user);
    await this.page.type(selectors.passwordField, this.pass);
    await this.page.click(selectors.submitButton);
    await this.page.keyboard.press("Enter");
    await this.page.waitForNavigation();
    await this.page.goto(selectors.url);
    await this.page.waitForSelector(selectors.debitAccountView, {
      timeout: 1000,
    });

    return this.page;
  }

  /**
   * Gets the account statement from the BRI website.
   * @async
   * @returns {Object} - Account statement data.
   */
  async getStatement() {
    if (!this.apiKey) {
      return {
        status: false,
        message: "you must include the api key"
      }
    }
    try {
      const selectors = BRISelectors.LOGIN_PAGE;
      const page = await this.loginToBRI();
      await page.click(selectors.debitAccountView);
      await page.waitForSelector(selectors.selectResultsOptions);

      const options = await page.$$eval(selectors.selectResultsOptions, (nodes) =>
        nodes.map((n) => ({
          value: n.innerText,
          id: n.getAttribute("id"),
        }))
      );

      const option = options.find((o) => o.value.includes(this.norek));
      let accountValue;
      if (option) {
        await page.click(`li#${option.id}`);
        accountValue = await page.$$eval(
          `option`,
          (options, val) => {
            const element = options.find((option) =>
              option.textContent.includes(val)
            );
            return element ? element.value : null;
          },
          option.value
        );
      } else {
        console.log("Option not found");
      }

      const token = await page.$eval(selectors.tokenInput, (el) => el.value);
      const formattedDate = this.formatCurrentDate();
      await page.type(selectors.periodeView, formattedDate);
      await page.waitForSelector(selectors.applyDateButton);
      await page.click(selectors.applyDateButton);
      await page.click(selectors.submitViewButton);

      const data = await this.fetchAccountDetails(accountValue, formattedDate, token);

      await page.goto("https://newbiz.bri.co.id/logout");
      const result = this.parseAccountData(data);

      return result;
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * Fetches account details from the BRI website.
   * @async
   * @param {string} accountValue - Account value.
   * @param {string} formattedDate - Formatted date.
   * @param {string} token - Security token.
   * @returns {Object} - Account details data.
   */
  async fetchAccountDetails(accountValue, formattedDate, token) {
    const accountOption = await this.page.evaluate(
      async (accountValue, formattedDate, token) => {
        const response = await fetch(
          "https://newbiz.bri.co.id/account/requestView",
          {
            headers: {
              accept: "*/*",
              "accept-language": "en-US,en;q=0.9",
              "content-type": "application/json",
              "sec-ch-ua":
                '"Not.A/Brand";v="8", "Chromium";v="114", "Google Chrome";v="114"',
              "sec-ch-ua-mobile": "?0",
              "sec-ch-ua-platform": '"Linux"',
              "sec-fetch-dest": "empty",
              "sec-fetch-mode": "cors",
              "sec-fetch-site": "same-origin",
              "x-requested-with": "XMLHttpRequest",
            },
            referrer: "https://newbiz.bri.co.id/accountinformation",
            referrerPolicy: "strict-origin-when-cross-origin",
            body: JSON.stringify({
              debitaccount: accountValue,
              periode: formattedDate,
              _token: token,
            }),
            method: "POST",
            mode: "cors",
            credentials: "include",
          }
        );
        const jsonResponse = await response.json();
        return jsonResponse;
      },
      accountValue,
      formattedDate,
      token
    );
    const data = accountOption.data.list;
    return data;
  }

  /**
   * Formats the current date.
   * @returns {string} - Formatted date string.
   */
  formatCurrentDate() {
    const currentDate = new Date();
    const formattedDate = `${currentDate
      .getDate()
      .toString()
      .padStart(2, "0")}-${(currentDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${currentDate.getFullYear()} - ${currentDate
          .getDate()
          .toString()
          .padStart(2, "0")}-${(currentDate.getMonth() + 1)
            .toString()
            .padStart(2, "0")}-${currentDate.getFullYear()}`;
    return formattedDate;
  }

  /**
   * Parses account data received from the BRI website.
   * @param {Object} data - Raw account data.
   * @returns {Array} - Parsed account data.
   */
  parseAccountData(data) {

    let newData = data.map((obj) => {
      if (obj.DESK_TRAN === "Transaksi tidak ditemukan") {
        return data;
      } else {
        let tanggal = obj.TGL_TRAN.slice(8, 10) + "/" + obj.TGL_TRAN.slice(5, 7);
        let mutasi = obj.MUTASI_DEBET == "0.00" ? "CR" : "DB";
        let nominal = (
          obj.MUTASI_DEBET == "0.00" ? obj.MUTASI_KREDIT : obj.MUTASI_DEBET
        ).replace(".00", "");
        let saldoakhir = obj.SALDO_AKHIR_MUTASI.replace(".00", "");
        let words = obj.DESK_TRAN.split(" ");
        let nama = words[1] + " " + words[2];
        const currentYear = moment().year();
        const parsedDate = moment(tanggal + "/" + currentYear, "DD/MM/YYYY");
        const formattedDate = parsedDate.format("YYYY-MM-DD HH:mm:ss");
        return {
          tanggal: formattedDate,
          keterangan: obj.DESK_TRAN,
          name: nama,
          mutasi,
          nominal,
          saldoakhir,
        };
      }

    });
    return newData;
  }
}

module.exports = ScrapBRI;
