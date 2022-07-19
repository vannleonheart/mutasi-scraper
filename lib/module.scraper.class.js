
const fs = require("fs");
const {compile} = require("html-to-text");
const randomUseragent = require('random-useragent');
const axios = require("axios");
const convert = compile({wordwrap: 130});
var FormData = require('form-data');
const timeout = 10000000;
const puppeteer = require("puppeteer-extra");
const stealthPlugin = require("puppeteer-extra-plugin-stealth")();

["chrome.runtime", "navigator.languages"].forEach(a =>
  stealthPlugin.enabledEvasions.delete(a)
);

puppeteer.use(stealthPlugin);
const fileExists = (filePath) => {
  try {
    return fs.statSync(filePath).isFile();
  }
  catch (err) {
    return false;
  }
};
class ScraperBank {
  constructor(user, pass, args = {}) {
    this.user = user || "username";
    this.pass = pass || "pass";
    this.browser = null || args.browser;
    this.page = null || args.page;

    this.konfigbrowser = {
      headless: false || args.headless
      , viewport:
      {
        width: 0
        , height: 0
      },
      executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe'
      // , userDataDir: args.userdatadir || "./fdciabdul"
      , disablegpu: true
    };
  }
  async getMandiri() {
    try {
      this.browser = await puppeteer.launch(this.konfigbrowser);
      this.page = await this.browser.newPage();
      await this.page.goto("https://ibank.bankmandiri.co.id/retail3/loginfo/loginRequest"
        , {
          waitUntil: "networkidle2"
          ,
        });
      await this.page.type("#userid_sebenarnya", this.user
        , {
          delay: 100
          ,
        });
      await this.page.type("#pwd_sebenarnya", this.pass
        , {
          delay: 100
          ,
        });
      await this.page.click("#btnSubmit");
      await this.page.waitForNavigation(
        {
          waitUntil: "networkidle2"
          ,
        });
      try {
        if (this.page.$(".ns-box-inner p") !== null) {
          const message = await this.page.$eval('.ns-box-inner p', el => el.innerText);
          await this.browser.close();
          return {
            message
          };
        }
      }
      catch (error) { }
      await this.page.click("div.acc-left");
      await this.page.waitForSelector("#globalTable > tbody > tr:nth-child(1) > td.desc > div");
      const result = await this.page.$$eval("#globalTable > tbody > tr", (rows) => {
        return Array.from(rows, (row) => {
          const columns = row.querySelectorAll("td");
          return Array.from(columns, (column) => column.innerText);
        });
      });
      const saldo = await this.page.$eval('.balance-amount', el => el.innerText);
      let arrayfilter = [];
      for (let i = 0; i < result.length; i++) {
        const filtered = result[i].filter(function (el) {
          return el != "-";
        });
        if (filtered.length > 0) {
          arrayfilter.push(filtered);
        }
      }
      await this.page.goto("https://ibank.bankmandiri.co.id/retail3/loginfo/logout");
      await this.browser.close();
      let arr = [];
      for (let i = 1; i < result.length; i++) {
        let potong2 = result[i];
        var tipe;
        var saldoakhir = saldo.replace("IDR", "");
        if (potong2[2].includes("-")) {
          tipe = "DB";
        }
        else {
          nominal = potong2[2];
        }
        if (potong2[3].includes("-")) {
          tipe = "CR";
        }
        else {
          nominal = potong2[3];
        }
        arr.push(
          {
            tanggal: potong2[0]
            , keterangan: potong2[1]
            , mutasi: tipe
            , nominal: nominal
            , saldoakhir: saldoakhir
          })
      }
      return arr;
    }
    catch (error) {
      await this.browser.close();
      return error;
    }
  }
  async getBCA(tglawal, blnawal, tglakhir, blnakhir) {
    const browser = await puppeteer.launch(this.konfigbrowser);
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => {
      delete navigator.__proto__.webdriver;
    });
    //We stop images and stylesheet to save data
    await page.setRequestInterception(true);

    page.on('request', (request) => {
      if (['image', 'stylesheet', 'font'].includes(request.resourceType())) {
        request.abort();
      } else {
        request.continue();
      }
    })
    try {
      await page.goto("https://ibank.klikbca.com/"
        , {
          waitUntil: "networkidle0"
          ,
        });
      await page.setViewport(
        {
          width: 1366
          , height: 635
          ,
        });
      await page.type("#user_id", this.user);
      await page.type("#pswd", this.pass);
      await page.keyboard.press("Enter");
      await page.waitForNavigation(
        {
          setTimeout: 10000
          , waitUntil: "networkidle0"
          ,
        });
      await page.goto("https://ibank.klikbca.com/nav_bar_indo/account_information_menu.htm"
        , {
          waitUntil: "networkidle0"
          ,
        });
      const pesan = new Promise((resolve, reject) => {
        const handler = async dialog => {
          await dialog.dismiss();
          resolve(dialog.message());
        };
        page.once("dialog", handler);
      });
      await page.waitForSelector("tbody > tr:nth-child(2) > td > font > a");
      await page.click("tbody > tr:nth-child(2) > td > font > a");
      const pageTarget = page.target();
      const newTarget = await browser.waitForTarget(
        (target) => target.opener() === pageTarget);
      const newPage = await newTarget.page();
      await newPage.waitForTimeout(2000);
      await newPage.select("#startDt", tglawal.padStart(2, "0"));
      await newPage.select("#startMt", blnawal.toString());
      await newPage.select("#endDt", tglakhir.padStart(2, "0"));
      await newPage.select("#endMt", blnakhir.toString());
      await newPage.waitForSelector("table:nth-child(4) > tbody > tr > td > input:nth-child(1)");
      await newPage.click("table:nth-child(4) > tbody > tr > td > input:nth-child(1)");
      await newPage.waitForTimeout(2000);
      const result = await newPage.evaluate(() => document.body.innerHTML);
      const reg = result.split("Saldo")[1].split('</table>  </td></tr><tr>  <td colspan="2">    <table border="0" width="70%" cellpadding="0" cellspacing="0" bordercolor="#ffffff">')[0];
      const td = reg.split(/<\/tr>/);
      let res = [];
      td.forEach((element) => {
        const potong = element.split("</td>");
        res.push(
          {
            tanggal: potong[0]
            , keterangan: potong[1]
            , cab: potong[2]
            , nominal: potong[3]
            , mutasi: potong[4]
            , saldoakhir: potong[5]
            ,
          });
      });
      let okey = [];
      for (let i = 0; i < res.length; i++) {
        let str = convert(res[i].nominal
          , {
            wordwrap: 130
            ,
          });
        let saldo = convert(res[i].saldoakhir
          , {
            wordwrap: 130
            ,
          });
        str = str.substring(0, str.length - 3);
        saldo = saldo.split(".")[0];
        okey.push(
          {
            tanggal: convert(res[i].tanggal
              , {
                wordwrap: 130
                ,
              })
            , keterangan: convert(res[i].keterangan
              , {
                wordwrap: 130
                ,
              })
            , cab: convert(res[i].cab
              , {
                wordwrap: 130
                ,
              })
            , nominal: str
            , mutasi: convert(res[i].mutasi
              , {
                wordwrap: 130
                ,
              })
            , saldoakhir: saldo
            ,
          });
      }
      await page.goto("https://ibank.klikbca.com/authentication.do?value(actions)=logout"
        , {
          waitUntil: "domcontentloaded"
          ,
        });
      await browser.close();
      return okey.slice(1, -1);
    }
    catch (error) {
      console.log(error);
      await page.goto("https://ibank.klikbca.com/authentication.do?value(actions)=logout"
        , {
          waitUntil: "networkidle0"
          ,
        });
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
          return el != "-";
        });
        if (filtered.length > 0) {
          arrayfilter.push(filtered);
        }
      }
      await page.waitForTimeout(2000);
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
      await page.type("#txtAccessCode", "cejuhilen1808@gmail.com");
      await page.type("#txtPin", "missyou2");
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
  async getBRI(norek) {
    const browser = await puppeteer.launch(this.konfigbrowser);
    try {
      const page = await browser.newPage();
      console.log(page)
      await page.setDefaultNavigationTimeout(timeout);
      await page.setDefaultTimeout(0);
      await page.setUserAgent(randomUseragent.getRandom());
      await page.evaluateOnNewDocument(() => {
        delete navigator.__proto__.webdriver;
      });
      //We stop images and stylesheet to save data
    
     
      await page.goto("https://ib.bri.co.id/"
        , {
          waitUntil: "networkidle2"
          ,
        });
      console.log("LOG : Loading progress");
      const captchaPath = "./cache/";
      try {
        await page.waitForSelector('img[class="alignimg"]').then(() => console.log("LOG : all page loaded"));
        const element = await page.$('img[class="alignimg"]');
        console.log("LOG : Screenshoot captcha Images...");
        await element.screenshot(
          {
            path: captchaPath + "captcha.png"
          });
      }
      catch (err) {
        console.log("LOG : " + err);
        await browser.close();
      }
      const cap = captchaPath + "captcha.png";
      var form = new FormData();
      form.append('fileName', fs.createReadStream(cap), 'stickers.jpg');
      const recog = await axios.post('https://www.nyckel.com/v0.9/functions/yduzh0xptiwz8ans/ocr', form
        , {
          headers:
          {
            ...form.getHeaders()
            , Authentication: 'Bearer ...'
            ,
          }
          ,
        });
      let token = recog.data.text;
      console.log(recog.data)
      await page.waitForSelector("#wrapper > div.header-wrap > div > div.logoib.col-1-2 > img");
      console.log("RESULT : Token Captcha : " + token);
      console.log("INPUT : Input username in form..");
      const example = await page.$x('//*[@id="loginForm"]/input[3]');
      await example[0].type(this.user
        , {
          delay: 100
        });
      await page.keyboard.press("Tab");
      console.log("INPUT : Input password in form..");
      const example1 = await page.$x('//*[@id="loginForm"]/input[6]');
      await example1[0].type(this.pass
        , {
          delay: 100
        });
      await page.keyboard.press("Tab");
      await page.type(".validation > input", token);
      console.log("SUBMIT : Login progress..");
      await page.keyboard.press("Enter");
      console.log("LOG : Waiting progress after submit login");

      await page.waitForNavigation();
      if (
        (await page.$('a[id="myaccounts"]')) !== null || (await page.$('a[href="Logout.html"]')) !== null) {
        console.log("LOG : Go to myaccounts menu...");
        await page.click('a[id="myaccounts"]');
        console.log("LOG : Loading ajax progress after click myaccounts...");
        await page.waitForTimeout(
          {
            timeout: timeout
            , waitUntil: "domcontentloaded"
            ,
          });
        try {
          const frame = await page.frames().find((fr) => fr.name() === "menus");
          console.log("LOG : Go to mutasi menu...");
          await frame.waitForSelector('a[href="AccountStatement.html"]').then(() => console.log("LOG : all page loaded for mutasi menu"));
          console.log("LOG : Loading ajax progress after click accountStatement menu...");
          await frame.click('a[href="AccountStatement.html"]'
            , {
              timeout: timeout
              , waitUntil: "domcontentloaded"
              ,
            });
        }
        catch (err) {
          console.log("LOG : " + err);
          if ((await page.$('a[href="Logout.html"]')) !== null) {
            await page.click('a[href="Logout.html"]');
            await page.waitForTimeout();
            console.log("LOG : Logout account from ibri");
            page.on("dialog", async (dialog) => {
              console.log(dialog.message());
              await dialog.accept();
              await browser.close();
            });
            return {
              message: "Tidak ditemukan data"
            };
          }
        }
        await page.waitForTimeout(
          {
            timeout: timeout
            , waitUntil: "domcontentloaded"
            ,
          });
        try {
          const frame = await page.frames().find((fr) => fr.name() === "content");
          await frame.waitForSelector("#ACCOUNT_NO").then(() => console.log("LOG : all page loaded"));
          await frame.select("#ACCOUNT_NO", norek);
          await frame.waitForTimeout(2000);
          console.log("INPUT : Input rekening in form..");
          await frame.waitForTimeout(2000);
          await frame.click('input[id="VIEW_TYPE0"]');
          console.log("SUBMIT : Submit form..");
          await frame.click('input[name="submitButton"]'
            , {
              timeout: timeout
              , waitUntil: "domcontentloaded"
              ,
            });
        }
        catch (err) {
          console.log("LOG : " + err);
          if ((await page.$('a[href="Logout.html"]')) !== null) {
            await page.click('a[href="Logout.html"]');
            await page.waitForTimeout();
            console.log("LOG : Logout account from ibri");
            page.on("dialog", async (dialog) => {
              console.log(dialog.message());
              await dialog.accept();
              await browser.close();
            });
          }
        }
        await page.waitForTimeout(
          {
            timeout: timeout
            , waitUntil: "domcontentloaded"
            ,
          });
        try {
          const frame = await page.frames().find((fr) => fr.name() === "content");
          await frame.waitForSelector("#divToPrint > div > table").then(() => console.log("LOG : all page loaded"));
          const DataMutasi = await frame.evaluate(() => {
            const rekeningData = document.querySelectorAll("#divToPrint > div > table > tbody > tr > td:nth-child(2)");
            const nama_pemilik = rekeningData[0].innerText.trim();
            const account_number = rekeningData[1].innerText.trim();
            const mata_uang = rekeningData[2].innerText.trim();
            const periode = rekeningData[3].innerText.trim();
            const tanggal_mutasi = rekeningData[4].innerText.trim();
            const rows = document.querySelectorAll("#tabel-saldo > tbody > tr");
            const arr = Array.from(rows, (row) => {
              const columns = row.querySelectorAll("td");
              return Array.from(columns, (column) => column.innerText);
            });
            console.log("LOG : Generate mutasi data...");
            const ResDataMutasi = [];
            arr.forEach(function (data) {
              const date = data[0];
              const desc = data[1];
              const debet = data[2];
              const kredit = data[3];
              const saldo = data[4];
              if (
                (desc === "Saldo Awal") | (desc === "Total Mutasi") | (desc === "Saldo Akhir")) {
                return;
              }
              if (debet.length > 0) {
                var type = "debet";
                var jumlah = debet.replace(",00", ".00");
              }
              else {
                var type = "kredit";
                var jumlah = kredit.replace(",00", ".00");
              }
              ResDataMutasi.push(
                {
                  date: date
                  , description: desc
                  , type: type
                  , jumlah: jumlah
                  , saldo: saldo.replace(",00", ".00")
                  ,
                });
            });
            return {
              nama_pemilik: nama_pemilik
              , account_number: account_number
              , mata_uang: mata_uang
              , periode: periode
              , tanggal_mutasi: tanggal_mutasi
              , response: ResDataMutasi
              ,
            };
          });
          await page.click("#main-page > div.headerwrap > div > div.uppernav.col-1-2 > span:nth-child(1) > a:nth-child(4) > b");
          await page.waitForTimeout();
          console.log("LOG : Logout account from ibri");
          page.on("dialog", async (dialog) => {
            console.log(dialog.message());
            await dialog.accept();
            await browser.close();
          });
          await page.keyboard.press("Enter");
          await page.waitForTimeout(3000);
          //await browser.close();
          return DataMutasi;
        }
        catch (err) {
          console.log("LOG : " + err);
          if ((await page.$('a[href="Logout.html"]')) !== null) {
            await page.click('a[href="Logout.html"]');
            await page.waitForTimeout();
            console.log("LOG : Logout account from ibri");
            page.on("dialog", async (dialog) => {
              console.log(dialog.message());
              await dialog.accept();
              await browser.close();
            });
          }
          return err;
        }
      }
      else {
        if ((await page.$("#errormsg-wrap")) !== null) {
          const error_msg = await page.evaluate(
            () => document.querySelector("h2.errorresp").innerText);
          const err = {
            status: "ERROR"
            , error_code: 104
            , error_message: error_msg
            ,
          };
          console.log(err);
          await browser.close();
        }
        else {
          if ((await page.$('a[href="Logout.html"]')) !== null) {
            await page.click('a[href="Logout.html"]');
            await page.waitForTimeout();
            console.log("LOG : Logout account from ibri");
            page.on("dialog", async (dialog) => {
              console.log(dialog.message());
              await dialog.accept();
            });
          }
          const err = {
            status: "ERROR"
            , error_code: 105
            , error_message: "Please try again..."
            ,
          };
          return err;
        }
      }
    }
    catch (e) {

      console.log("LOG : cant load the page, maybe server is busy : " + e);
      console.log(e);

    }
  }
}
module.exports = ScraperBank;
