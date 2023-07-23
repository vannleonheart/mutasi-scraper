const ScraperBank = require("../BrowserClasses");
const { UA } = require("../helper/UA");
const BCASelectors = require("../helper/selector/BCASelector");
const { BCAParser } = require("../helper/Parser");
/**
 * ScrapBCA module.
 * @module ScrapBCA
 * @see module:ScraperBank
 * @author @fdciabdul
 */
class ScrapBCA extends ScraperBank {
  /**
   * @constructor {string} user
   * @constructor {string} pass
   * @constructor {string} norek
   */
  constructor(user, pass, norek, args) {
    super(user, pass, args);
    this.norek = norek;
  }
  /**
   * @async
   * @method
   * @author @fdciabdul
   */
  async launchAndSetupBrowser() {
    const page = await this.launchBrowser();
    console.log("[ LOG ] Starting ..");

    await page.setUserAgent(UA());

    return page;
  }

  /**
   * Description : Login to BCA
   * @param {any} page
   * @returns {any}
   */
  async loginToBCA(page) {
    await page.goto(BCASelectors.LOGIN_PAGE.url, {
      waitUntil: "domcontentloaded",
    });

    page.on("dialog", async (dialog) => {
      await dialog.accept();
      console.log("[ LOG ] " + dialog.message());
      this.loginError = dialog.message(); // Store the error message
    });
    console.log("[ LOG ] Login to BCA .. [" + this.user + "]");
    await page.type(BCASelectors.LOGIN_PAGE.userField, this.user, {
      delay: 100,
    });
    await page.type(BCASelectors.LOGIN_PAGE.passField, this.pass);
    await page.click(BCASelectors.LOGIN_PAGE.submitButton, { delay: 200 });

    await page.waitForTimeout(2000);
    if (this.loginError) {
      throw new Error(this.loginError); // Throw an error if there was a login error
    }
  }

  /**
   * Description : Select account number and set dates
   * @param {any} page
   * @param {any} tglawal
   * @param {any} blnawal
   * @param {any} tglakhir
   * @param {any} blnakhir
   * @returns {any}
   */
  async selectAccountAndSetDates(page, tglawal, blnawal, tglakhir, blnakhir) {
    await page.goto(BCASelectors.STATEMENT_PAGE.url, {
      waitUntil: "domcontentloaded",
    });
    console.log("[ LOG ] Success login ..");
    await page.click(BCASelectors.STATEMENT_PAGE.settlementLink);

    const newPage = await this.createTargetPage(page);
    if (this.norek) {
      await this.selectAccountNumber(newPage);
    }
    const padStart2 = (num) => num.toString().padStart(2, "0");
    console.log("[ LOG ] Select date ..");
    await newPage.waitForSelector(BCASelectors.STATEMENT_PAGE.startDateField);
    await newPage.select(
      BCASelectors.STATEMENT_PAGE.startDateField,
      padStart2(tglawal)
    );
    await newPage.select(
      BCASelectors.STATEMENT_PAGE.startMonthField,
      blnawal.toString()
    );
    await newPage.select(
      BCASelectors.STATEMENT_PAGE.endDateField,
      padStart2(tglakhir)
    );
    await newPage.select(
      BCASelectors.STATEMENT_PAGE.endMonthField,
      blnakhir.toString()
    );
    console.log("[ LOG ] Get mutasi ..");
    await newPage.click(BCASelectors.STATEMENT_PAGE.submitButton, {
      delay: 1500,
    });
    await newPage.waitForNavigation();
    return newPage;
  }

  /**
   * Description : Create new page
   * @param {any} page
   * @returns {any}
   */
  async createTargetPage(page) {
    const pageTarget = page.target();
    const newTarget = await page
      .browser()
      .waitForTarget((target) => target.opener() === pageTarget);
    const newPage = await newTarget.page();

    await this.handleDialogAndLogout(newPage);

    await newPage.setDefaultNavigationTimeout(0);
    await newPage.setUserAgent(UA());
    await newPage.reload({ waitUntil: "domcontentloaded" });

    return newPage;
  }

  /**
   * Description:  Handle select account number
   * @param {any} page
   * @returns {any}
   */
  async selectAccountNumber(page) {
    let accountNumber = this.norek;
    await page.waitForSelector(BCASelectors.STATEMENT_PAGE.accountNOSelector);
    if(accountNumber) {
        await page.select(
            BCASelectors.STATEMENT_PAGE.accountNOSelector,
            accountNumber
          );
    }else {
    console.log("[ LOG ] Select account number ..");
    await page.waitForSelector(BCASelectors.STATEMENT_PAGE.accountNOSelector);
    const options = await page.$$eval("#D1 option", (options) =>
      options.map((option) => option.value)
    );
    console.log("[ LOG ] " + options);
 
    if (!accountNumber || accountNumber.trim() === "") {
      accountNumber = options[0];
    }

    await page.select(
      BCASelectors.STATEMENT_PAGE.accountNOSelector,
      accountNumber
    );

    return accountNumber;
  }
}

  /**
   * @deprecated Use  {@link ScrapBCA#getStatement} instead.
   */
  async getSettlement(tglawal, blnawal, tglakhir, blnakhir) {
    console.warn(
      "Warning: getSettlement method is deprecated. Use getStatement instead."
    );

    const page = await this.launchAndSetupBrowser();
    this.dialogMessage = null; // Initialize dialogMessage

    try {
      await this.loginToBCA(page);
      const newPage = await this.selectAccountAndSetDates(
        page,
        tglawal,
        blnawal,
        tglakhir,
        blnakhir
      );

      // Check for dialog message

      const result = await newPage.evaluate(() => document.body.innerHTML);
      let parser;
      if (result.includes("Account Number")) {
        parser = new BCAParser(result, BCASelectors.PARSING_FIELD_ENG);
      } else {
        parser = new BCAParser(result, BCASelectors.PARSING_FIELD);
      }
      let resultsettlement = parser.parse();
      console.log("[ LOG ] get mutasi ..");
      const exists = await this.checkIfReturnToLogin(
        newPage,
        BCASelectors.LOGIN_PAGE.userField
      );

      if (exists) {
        throw new Error("Loopback detected");
      }

      await this.logoutAndClose(page);
      newPage.on("dialog", async (dialog) => {
        await dialog.accept();
        console.log("[ LOG ] " + dialog.message());
        dialogMessage = dialog.message(); // Store the error message
      });

      return resultsettlement;
    } catch (error) {
      console.log("[ LOG ] " + error);
      await this.logoutAndClose(page);
      return { status: false, error: this.dialogMessage };
    }
  }

  /**
   * Description : Get statement from BCA
   * @param {any} tglawal <Tanggal Awal> harus 1 digit
   * @param {any} blnawal <Bulan Awal> harus 2 digit
   * @param {any} tglakhir <Tanggal Akhir> harus 1 digit
   * @param {any} blnakhir <Bulan Akhir> harus 1 digit
   * @returns {any}
   */
  async getStatement(tglawal, blnawal, tglakhir, blnakhir) {
    const page = await this.launchAndSetupBrowser();
    this.dialogMessage = null; // Initialize dialogMessage

    try {
      await this.loginToBCA(page);
      const newPage = await this.selectAccountAndSetDates(
        page,
        tglawal,
        blnawal,
        tglakhir,
        blnakhir
      );

      // Check for dialog message

      const result = await newPage.evaluate(() => document.body.innerHTML);
      let parser;
      if (result.includes("Account Number")) {
        parser = new BCAParser(result, BCASelectors.PARSING_FIELD_ENG);
      } else {
        parser = new BCAParser(result, BCASelectors.PARSING_FIELD);
      }
      let resultsettlement = parser.parse();
      console.log("[ LOG ] get mutasi ..");
      const exists = await this.checkIfReturnToLogin(
        newPage,
        BCASelectors.LOGIN_PAGE.userField
      );

      if (exists) {
        throw new Error("Loopback detected");
      }

      await this.logoutAndClose(page);
      newPage.on("dialog", async (dialog) => {
        await dialog.accept();
        console.log("[ LOG ] " + dialog.message());
        dialogMessage = dialog.message(); // Store the error message
      });

      return resultsettlement;
    } catch (error) {
      console.log("[ LOG ] " + error);
      await this.logoutAndClose(page);
      return { status: false, error: this.dialogMessage };
    }
  }

  /**
   * Description : Logout and close browser
   * @param {any} page
   * @returns {any}
   */
  async logoutAndClose(page) {
    try {
      console.log("[ LOG ] Logout..");
      await page.goto(BCASelectors.LOGOUT_PAGE.url, {
        waitUntil: "domcontentloaded",
      });
      await this.closeBrowser(page);
    } catch {
      return null;
    }
  }

  /**
   * Description: Handle dialog and logout
   * @param {any} newPage
   * @returns {any}
   */
  async handleDialogAndLogout(newPage) {
    newPage.on("dialog", async (dialog) => {
      this.dialogMessage = dialog.message();
      console.log("Dialog message: ", this.dialogMessage);
      await dialog.dismiss();
      await this.logoutAndClose(newPage);
    });
  }

  /**
   * Description : checking when get statement and return to login page
   * @param {any} page
   * @param {any} selector
   * @returns {any}
   */
  async checkIfReturnToLogin(page, selector) {
    try {
      const element = await page.$(selector);
      return element ?? null;
    } catch (e) {
      console.log("[ LOG ] " + e);
      return false;
    }
  }
}

module.exports = ScrapBCA;
