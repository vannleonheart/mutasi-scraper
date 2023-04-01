const ScraperBank = require("../BrowserClasses");
const { UA } = require("../helper/UA");
const { load } = require("cheerio");
const BCASelectors = require("../helper/selector/BCASelector");
class ScrapBCA extends ScraperBank {
  constructor(user, pass) {
    super(user, pass);
  }
  async login() {
    try {
      const page = await this.launchBrowser();
      await page.goto(BCASelectors.LOGIN_PAGE.url, {
        waitUntil: "domcontentloaded",
      });
      await page.type(BCASelectors.LOGIN_PAGE.userField, this.user);
      await page.type(BCASelectors.LOGIN_PAGE.passField, this.pass);
      await page.click(BCASelectors.LOGIN_PAGE.submitButton);
      return page;
    } catch (e) {
      console.log(e);
    }
  }

  /**
   * Function to get settlement data from BCA
   * Created by: Abdul Muttaqin
   * @date 2023-04-01
   * @param {any} tglawal
   * @param {any} blnawal
   * @param {any} tglakhir
   * @param {any} blnakhir
   * @returns {any}
   */
  async getSettlement(tglawal, blnawal, tglakhir, blnakhir) {
    const page = await this.login();
    try {
      await page.waitForTimeout(3000);
      await page.goto(BCASelectors.SETTLEMENT_PAGE.url, {
        waitUntil: "domcontentloaded",
      });
      await page.waitForSelector(BCASelectors.SETTLEMENT_PAGE.settlementLink);
      await page.click(BCASelectors.SETTLEMENT_PAGE.settlementLink);

      const pageTarget = page.target();
      const newTarget = await page
        .browser()
        .waitForTarget((target) => target.opener() === pageTarget);
      const newPage = await newTarget.page();
      await newPage.setUserAgent(UA());
      await newPage.waitForSelector("#startDt", {
        waitUntil: "domcontentloaded",
      });
      newPage.on("dialog", async (dialog) => {
        await dialog.accept();
        throw new Error(dialog.message());
      });
      await newPage.select(
        BCASelectors.SETTLEMENT_PAGE.startDateField,
        tglawal.padStart(2, "0")
      );
      await newPage.select(
        BCASelectors.SETTLEMENT_PAGE.startMonthField,
        blnawal.toString()
      );
      await newPage.select(
        BCASelectors.SETTLEMENT_PAGE.endDateField,
        tglakhir.padStart(2, "0")
      );
      await newPage.select(
        BCASelectors.SETTLEMENT_PAGE.endMonthField,
        blnakhir.toString()
      );
      await newPage.waitForSelector(BCASelectors.SETTLEMENT_PAGE.submitButton);
      await newPage.click(BCASelectors.SETTLEMENT_PAGE.submitButton);
      await newPage.waitForSelector(
        BCASelectors.SETTLEMENT_PAGE.settlementTable,
        {
          waitUntil: "domcontentloaded",
        }
      );
      await page.waitForTimeout(3000);
      const result = await newPage.evaluate(() => document.body.innerHTML);
      const hasilnya = this.ParseSettlement(result);
      await page.goto(BCASelectors.LOGOUT_PAGE.url, {
        waitUntil: "domcontentloaded",
      });
      await this.closeBrowser(page);
      return hasilnya;
    } catch (error) {
      await page.goto(BCASelectors.LOGOUT_PAGE.url, {
        waitUntil: "domcontentloaded",
      });
    }
  }
  ParseSettlement(html) {
    const $ = load(html);
    const settlements = [];
    $(BCASelectors.SETTLEMENT_PAGE.settlementTable).each((i, row) => {
      if (i === 0) return; // skip table header row
      const settlement = {
        tanggal: $(row).find("td").eq(0).text().trim(),
        keterangan: $(row).find("td").eq(1).text().trim(),
        cab: $(row).find("td").eq(2).text().trim(),
        nominal: $(row).find("td").eq(3).text().trim(),
        mutasi: $(row).find("td").eq(4).text().trim(),
        saldoakhir: $(row).find("td").eq(5).text().trim(),
      };
      settlements.push(settlement);
    });
    //console.log(settlements);
    let hasilnya = [];
    for (let i = 0; i < settlements.length; i++) {
      if (settlements[i].mutasi === "") {
      } else {
        hasilnya.push(settlements[i]);
      }
    }
    return hasilnya;
  }
}

module.exports = ScrapBCA;
