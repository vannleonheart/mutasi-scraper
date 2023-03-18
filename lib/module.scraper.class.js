const { load } = require("cheerio");
const puppeteer = require("puppeteer-extra");
const stealthPlugin = require("puppeteer-extra-plugin-stealth");
const { executablePath } = require("puppeteer");
puppeteer.use(stealthPlugin());

class ScraperBank {
  constructor(user, pass, args = {}) {
    this.user = user || "username";
    this.pass = pass || "pass";
    this.konfigbrowser = {
      headless: false || args.headless,
      viewport: {
        width: 0,
        height: 0,
      },
      executablePath: executablePath("chrome"),
      disablegpu: true,
    };
  }

  async getBCA(tglawal, blnawal, tglakhir, blnakhir) {
    const browser = await puppeteer.launch(this.konfigbrowser);
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
      delete navigator.__proto__.webdriver;
    });
    await page.setRequestInterception(true);
    page.on("dialog", async (dialog) => {
      await dialog.accept();
      throw new Error(dialog.message());
    });

    page.on("request", (request) => {
      if (["image", "stylesheet", "font"].includes(request.resourceType())) {
        request.abort();
      } else {
        request.continue();
      }
    });

    try {
      await page.goto("https://ibank.klikbca.com/", {
        waitUntil: "domcontentloaded",
      });
      await page.setViewport({
        width: 1366,
        height: 635,
      });
      await page.type("#user_id", this.user);
      await page.type("#pswd", this.pass);
      await page.keyboard.press("Enter");
      await page.waitForNavigation({ waitUntil: "domcontentloaded" });
      await page.goto(
        "https://ibank.klikbca.com/nav_bar_indo/account_information_menu.htm",
        {
          waitUntil: "domcontentloaded",
        }
      );
      await page.waitForSelector("tr:nth-child(2) a");
      await page.click("tr:nth-child(2) a");
      const pageTarget = page.target();
      const newTarget = await browser.waitForTarget(
        (target) => target.opener() === pageTarget
      );
      const newPage = await newTarget.page();
      await newPage.waitForSelector("#startDt", {
        waitUntil: "domcontentloaded",
      });
      newPage.on("dialog", async (dialog) => {
        await dialog.accept();
        throw new Error(dialog.message());
      });
  
      await newPage.select("#startDt", tglawal.padStart(2, "0"));
      await newPage.select("#startMt", blnawal.toString());
      await newPage.select("#endDt", tglakhir.padStart(2, "0"));
      await newPage.select("#endMt", blnakhir.toString());
      await newPage.waitForSelector(
        "table:nth-child(4) > tbody > tr > td > input:nth-child(1)"
      );
      await newPage.click(
        "table:nth-child(4) > tbody > tr > td > input:nth-child(1)"
      );

      await newPage.waitForSelector('table');
      const result = await newPage.evaluate(() => document.body.innerHTML);
      const $ = load(result);
      const settlements = [];
      $('table[bordercolor="#ffffff"] tr').each((i, row) => {
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

      const hasilnya = settlements.filter((settlement) => settlement.mutasi !== "");
      await page.goto(
        "https://ibank.klikbca.com/authentication.do?value(actions)=logout",
        {
          waitUntil: "domcontentloaded",
        }
      );
      await browser.close();
      return hasilnya;
    } catch (error) {
      await page.goto(
        "https://ibank.klikbca.com/authentication.do?value(actions)=logout",
        {
          waitUntil: "networkidle0",
        }
      );

      await browser.close();
      return error;
    }
  }
  async getBNI() {
    const browser = await puppeteer.launch(this.konfigbrowser);
    const page = await browser.newPage();
    
    await page.evaluateOnNewDocument(() => {
      delete navigator.__proto__.webdriver;
    });
    //We
    try {
      await page.goto("https://ibank.bni.co.id/MBAWeb/FMB");

      await page.waitForSelector("#RetailUser_table #RetailUser");
      await page.click("#RetailUser_table #RetailUser");
      await page.waitForSelector("#s1_table #CorpId");
      await page.click("#s1_table #CorpId");
      await page.type("#s1_table #CorpId", this.user);
      await page.waitForSelector("#s1_table #PassWord");
      await page.click("#s1_table #PassWord");
      await page.type("#s1_table #PassWord", this.pass);
      await page.keyboard.press("Enter");
      try {
        await page.waitForSelector("#Display_MConError");
        let checklogin = await page.$('#Display_MConError');
    
        const err =  await page.evaluate(el => el.textContent, checklogin)
        //console.log(err)
        await browser.close()
        return {
          error: err.split("." )[1].split(".")[0]
        }
      } catch {
    
    
      }
      await page.waitForSelector("#MBMenuList");
      await page.click("#MBMenuList");
      await page.waitForSelector("#AccountMenuList_table #AccountMenuList");
      const elements = await page.$x("//*[contains(text(),'MUTASI')]");
      await elements[0].click();
      await page.waitForSelector("#MAIN_ACCOUNT_TYPE");
      await page.select("#MAIN_ACCOUNT_TYPE", "OPR");
      await page.click("#AccountIDSelectRq");
      await page.waitForSelector("#Search_Option_6");
      await page.select("#TxnPeriod", "Today");
      await page.click("#FullStmtInqRq");
      await page.waitForTimeout(2000);
      await page.waitForSelector("table > tbody > tr")
      const result = await page.$$eval("table > tbody > tr", (rows) => {
        return Array.from(rows, (row) => {
          const columns = row.querySelectorAll("td");
          return Array.from(columns, (column) => column.innerText);
        });
      });
      let arrayfilter = [];
      for (let i = 0; i < result.length; i++) {
        const filtered = result[i].filter(function (el) {
          return el != "";
        });
        if (filtered.length > 0) {
          arrayfilter.push(filtered);
        }
      }
      await page.waitForSelector("#LogOut");
      await page.click("#LogOut");
      await page.waitForSelector("#__LOGOUT__");
      await page.click("#__LOGOUT__");
      await browser.close();
    
      let arr = []
      var res = arrayfilter.slice(6, -7);
      var string = res.join("\n");
      var potong = string.split("Tanggal Transaksi");
      for (let i = 1; i < potong.length; i++) {
        let potong2 = potong[i].split("\n");
        let mutasi; 
        if(potong2[5] === "Cr"){
          mutasi = "CR"
        }else if(potong2[5] === "Db"){
          mutasi = "DB"
        }
        arr.push(
          {
            tanggal: potong2[1]
            , keterangan: potong2[3]
            , mutasi: mutasi
            , nominal: potong2[7]
            , saldoakhir: potong2[9]
          })
      }
      return arr;
    }
    catch (error) {
      console.log(error);
    }
  }
  async getDanamon() {
    const browser = await puppeteer.launch(this.konfigbrowser);
    const page = await browser.newPage();
    try {
      await page.goto("https://www.danamonline.com/onlinebanking/Login/lgn_new.aspx");
      await page.setViewport(
        {
          width: 1536
          , height: 731
        });
      await page.waitForSelector("#txtAccessCode");
      await page.type("#txtAccessCode", this.user);
      await page.type("#txtPin", this.pass);
      await page.keyboard.press("Enter");
      await page.waitForSelector("#frmDefault > div > div.transaction-area > div.ld-menu");
      await page.goto("https://www.danamonline.com/onlinebanking/default.aspx?usercontrol=DepositAcct/dp_TrxHistory_new");
      await page.waitForSelector("#_ctl0_btnGetDetails");
      await page.select("#_ctl0_ddlTrxPeriod", "10 Hari Terakhir");
      await page.click("#_ctl0_btnGetDetails");
      await page.waitForTimeout(2000);
      const result = await page.evaluate(() => document.body.innerHTML);
      await page.waitForTimeout(2000);
      await page.goto("https://www.danamonline.com/onlinebanking/Login/lgn_logout.aspx");
      await browser.close();
      if (result.includes("Tidak ditemukan data")) {
        return {
          message: "Tidak ditemukan data"
        };
      }
      else {
        const res = await page.$$eval("#_ctl0_dgList > tbody > tr", (rows) => {
          return Array.from(rows, (row) => {
            const columns = row.querySelectorAll("td");
            return Array.from(columns, (column) => column.innerText);
          });
        });
        return res.slice(1);
      }
    }
    catch (error) {
      console.log(error);
      await page.goto("https://www.danamonline.com/onlinebanking/Login/lgn_logout.aspx");
    }
  }
}
module.exports = ScraperBank;
