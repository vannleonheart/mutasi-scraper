"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _puppeteerExtra = require("puppeteer-extra");

var _puppeteerExtra2 = _interopRequireDefault(_puppeteerExtra);

var _puppeteerExtraPluginStealth = require("puppeteer-extra-plugin-stealth");

var _puppeteerExtraPluginStealth2 = _interopRequireDefault(_puppeteerExtraPluginStealth);

var _fs = require("fs");

var _fs2 = _interopRequireDefault(_fs);

var _htmlToText = require("html-to-text");

var _vision = require("@google-cloud/vision");

var _vision2 = _interopRequireDefault(_vision);

var _dateFormat = require("date-format");

var _dateFormat2 = _interopRequireDefault(_dateFormat);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var convert = (0, _htmlToText.compile)({
  wordwrap: 130
});

var timeout = 100000;
_puppeteerExtra2.default.use((0, _puppeteerExtraPluginStealth2.default)());
// check if file exists
var fileExists = function fileExists(filePath) {
  try {
    return _fs2.default.statSync(filePath).isFile();
  } catch (err) {
    return false;
  }
};

/**
 * Ibankin Settlement Scraper
 * Created by : Abdul Muttaqin
 * Date : 2022-04-20
 * Time : 10:00
 * Email : abdulmuttaqin456@gmail.com
 * @description : Scraping data from BRI,BNI,BCA,MANDIRI,DANAMON website
 */

var ScraperBank = function () {
  function ScraperBank(user, pass) {
    var args = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    _classCallCheck(this, ScraperBank);

    this.user = user || "username";
    this.pass = pass || "pass";
    this.browser = null || args.browser;
    this.page = null || args.page;

    this.konfigbrowser = {
      headless: false || args.headless,
      viewport: {
        width: 0,
        height: 0
      },
      args: ["--log-level=3", // fatal only
      "--no-default-browser-check", "--disable-infobars", "--disable-site-isolation-trials", "--no-experiments", "--ignore-gpu-blacklist", "--ignore-certificate-errors", "--ignore-certificate-errors-spki-list", "--mute-audio", "--disable-extensions", "--no-sandbox"],
      userDataDir: "./fdciabdul",
      disablegpu: true
    };
  }
  /** Mandiri Settlement Scraper
   *  Created By Abdul Muttaqin
   * @param  {}
   * @returns mutasi
   */


  _createClass(ScraperBank, [{
    key: "getMandiri",
    value: async function getMandiri() {
      try {
        this.browser = await _puppeteerExtra2.default.launch(this.konfigbrowser);
        this.page = await this.browser.newPage();
        await this.page.goto("https://ibank.bankmandiri.co.id/retail3/loginfo/loginRequest", {
          waitUntil: "networkidle2"
        });
        await this.page.type("#userid_sebenarnya", this.user, {
          delay: 100
        });
        await this.page.type("#pwd_sebenarnya", this.pass, {
          delay: 100
        });
        await this.page.click("#btnSubmit");
        await this.page.waitForNavigation({
          waitUntil: "networkidle2"
        });
        var url = void 0;
        await this.page.click("div.acc-left");
        await this.page.waitForSelector("#globalTable > tbody > tr:nth-child(1) > td.desc > div");
        var result = await this.page.$$eval("#globalTable > tbody > tr", function (rows) {
          return Array.from(rows, function (row) {
            var columns = row.querySelectorAll("td");
            return Array.from(columns, function (column) {
              return column.innerText;
            });
          });
        });
        var arrayfilter = [];
        for (var i = 0; i < result.length; i++) {
          var filtered = result[i].filter(function (el) {
            return el != "-";
          });
          if (filtered.length > 0) {
            arrayfilter.push(filtered);
          }
        }
        await this.page.goto("https://ibank.bankmandiri.co.id/retail3/loginfo/logout");
        await this.browser.close();
        return arrayfilter;
      } catch (error) {
        return error;
      }
    }
    /** BCA  Settlement Scraper
     *  Created By Abdul Muttaqin
     * @param  { tglawal, blnawal, tglakhir, blnakhir }
     * format tanggal : 2 digit
     * format bulan : 1 digit
     * tipe parameter : string
     * @param  {}
     * @returns mutasi
     */

  }, {
    key: "getBCA",
    value: async function getBCA(tglawal, blnawal, tglakhir, blnakhir) {
      var _this = this;

      tglawal = tglawal || _dateFormat2.default.asString('dd', new Date());
      blnawal = blnawal || _dateFormat2.default.asString('M', new Date());
      tglakhir = tglakhir || _dateFormat2.default.asString('dd', new Date());
      blnakhir = blnakhir || _dateFormat2.default.asString('M', new Date());
      console.log(tglawal, blnawal, tglakhir, blnakhir);
      var browser = await _puppeteerExtra2.default.launch(this.konfigbrowser);
      var page = await browser.newPage();
      try {
        var _ret = await async function () {
          await page.goto("https://ibank.klikbca.com/", {
            waitUntil: "networkidle0"
          });
          await page.setViewport({
            width: 1366,
            height: 635
          });
          await page.type("#user_id", _this.user);
          await page.type("#pswd", _this.pass);
          await page.keyboard.press("Enter");
          await page.waitForNavigation({
            setTimeout: 10000,
            waitUntil: "networkidle0"
          });
          await page.goto("https://ibank.klikbca.com/nav_bar_indo/account_information_menu.htm", {
            waitUntil: "networkidle0"
          });

          await page.waitForSelector("tbody > tr:nth-child(2) > td > font > a");
          await page.click("tbody > tr:nth-child(2) > td > font > a");
          var pageTarget = page.target();
          var newTarget = await browser.waitForTarget(function (target) {
            return target.opener() === pageTarget;
          });

          var newPage = await newTarget.page();
          newPage.on("dialog", async function (dialog) {
            console.log(dialog.message());
            await dialog.dismiss();
          });
          await newPage.waitForTimeout(2000);
          await newPage.select("#startDt", tglawal.padStart(2, "0"));
          await newPage.select("#startMt", blnawal.toString());
          await newPage.select("#endDt", tglakhir.padStart(2, "0"));
          await newPage.select("#endMt", blnakhir.toString());
          await newPage.waitForSelector("table:nth-child(4) > tbody > tr > td > input:nth-child(1)");
          await newPage.click("table:nth-child(4) > tbody > tr > td > input:nth-child(1)");
          await newPage.waitForTimeout(2000);
          var result = await newPage.evaluate(function () {
            return document.body.innerHTML;
          });
          var reg = result.split("Saldo")[1].split('</table>  </td></tr><tr>  <td colspan="2">    <table border="0" width="70%" cellpadding="0" cellspacing="0" bordercolor="#ffffff">')[0];
          var td = reg.split(/<\/tr>/);
          var res = [];
          td.forEach(function (element) {
            var potong = element.split("</td>");
            res.push({
              tanggal: potong[0],
              keterangan: potong[1],
              cab: potong[2],
              nominal: potong[3],
              mutasi: potong[4],
              saldoakhir: potong[5]
            });
          });
          var okey = [];
          for (var i = 0; i < res.length; i++) {
            var str = convert(res[i].nominal, {
              wordwrap: 130
            });
            var saldo = convert(res[i].saldoakhir, {
              wordwrap: 130
            });
            str = str.substring(0, str.length - 3);
            saldo = saldo.split(".")[0];
            okey.push({
              tanggal: convert(res[i].tanggal, {
                wordwrap: 130
              }),
              keterangan: convert(res[i].keterangan, {
                wordwrap: 130
              }),
              cab: convert(res[i].cab, {
                wordwrap: 130
              }),
              nominal: str,
              mutasi: convert(res[i].mutasi, {
                wordwrap: 130
              }),
              saldoakhir: saldo
            });
          }
          await page.goto("https://ibank.klikbca.com/authentication.do?value(actions)=logout", {
            waitUntil: "networkidle0"
          }); // logout
          await browser.close();
          return {
            v: okey.slice(1, -1)
          };
        }();

        if ((typeof _ret === "undefined" ? "undefined" : _typeof(_ret)) === "object") return _ret.v;
      } catch (error) {
        console.log("Terjadi kesalahan , kode :  " + error);
        await page.goto("https://ibank.klikbca.com/authentication.do?value(actions)=logout", {
          waitUntil: "networkidle0"
        }); // logout
        await browser.close();
        return error;
      }
    }
    /**
     * BNI Settlement Scraper
     * Created By Abdul Muttaqin
     * @param  {  }
     * Resutlt 1 bulan terakhir
     */

  }, {
    key: "getBNI",
    value: async function getBNI() {
      var browser = await _puppeteerExtra2.default.launch(this.konfigbrowser);
      var page = await browser.newPage();
      try {
        await page.goto("https://ibank.bni.co.id/MBAWeb/FMB");
        await page.setViewport({
          width: 1536,
          height: 731
        });
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
        var elements = await page.$x("//*[contains(text(),'MUTASI')]");
        await elements[0].click();
        await page.waitForSelector("#MAIN_ACCOUNT_TYPE");
        await page.select("#MAIN_ACCOUNT_TYPE", "OPR");
        await page.click("#AccountIDSelectRq");
        await page.waitForSelector("#Search_Option_6");
        await page.select("#TxnPeriod", "LastMonth");
        await page.click("#FullStmtInqRq");
        await page.waitForTimeout(2000);
        var result = await page.$$eval("table > tbody > tr", function (rows) {
          return Array.from(rows, function (row) {
            var columns = row.querySelectorAll("td");
            return Array.from(columns, function (column) {
              return column.innerText;
            });
          });
        });
        var arrayfilter = [];
        for (var i = 0; i < result.length; i++) {
          var filtered = result[i].filter(function (el) {
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
        return arrayfilter.slice(6, -7);
      } catch (error) {
        console.log(error);
      }
    }
  }, {
    key: "getDanamon",
    value: async function getDanamon() {
      var browser = await _puppeteerExtra2.default.launch(this.konfigbrowser);
      var page = await browser.newPage();
      try {
        await page.goto("https://www.danamonline.com/onlinebanking/Login/lgn_new.aspx");
        await page.setViewport({ width: 1536, height: 731 });

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

        var result = await page.evaluate(function () {
          return document.body.innerHTML;
        });

        await page.waitForTimeout(2000);
        await page.goto("https://www.danamonline.com/onlinebanking/Login/lgn_logout.aspx");

        await browser.close();
        if (result.includes("Tidak ditemukan data")) {
          return { message: "Tidak ditemukan data" };
        } else {
          var res = await page.$$eval("#_ctl0_dgList > tbody > tr", function (rows) {
            return Array.from(rows, function (row) {
              var columns = row.querySelectorAll("td");
              return Array.from(columns, function (column) {
                return column.innerText;
              });
            });
          });
          return res.slice(1);
        }
      } catch (error) {
        console.log(error);
        await page.goto("https://www.danamonline.com/onlinebanking/Login/lgn_logout.aspx");
      }
    }
  }, {
    key: "getBRI",
    value: async function getBRI(norek) {
      if (!fileExists("./apikey.json")) {

        return "API KEY GOOGLE VISION DIBUTUHKAN UNTUK MENGAMBIL KODE OCR \n hubungi dev untuk alternatif jika ingin menggunakan library tesseract-ocr";
        process.exit(1);
      }
      var client = new _vision2.default.ImageAnnotatorClient({
        keyFilename: "./apikey.json"
      });
      var browser = await _puppeteerExtra2.default.launch(this.konfigbrowser);
      var page = await browser.newPage();

      await page.setDefaultNavigationTimeout(timeout);
      await page.setDefaultTimeout(timeout);
      await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36");
      await page.evaluateOnNewDocument(function () {
        Object.defineProperty(navigator, "webdriver", {
          get: function get() {
            return false;
          }
        });
      });

      await page.evaluateOnNewDocument(function () {
        window.chrome = {
          runtime: {}
        };
      });

      try {
        await page.goto("http://ib.bri.co.id/ib-bri/Login.html", {
          waitUntil: "networkidle0"
        });

        console.log("LOG : Loading progress");
        var captchaPath = "./cache/";
        try {
          await page.waitForSelector('img[class="alignimg"]').then(function () {
            return console.log("LOG : all page loaded");
          });
          var element = await page.$('img[class="alignimg"]');
          console.log("LOG : Screenshoot captcha Images...");
          await element.screenshot({ path: captchaPath + "captcha.png" });
        } catch (err) {
          console.log("LOG : " + err);
        }

        var cap = captchaPath + "captcha.png";
        var config = {
          lang: "equ",
          psm: 10,
          tessedit_char_whitelist: "0123456789"
        };

        var _ref = await client.textDetection(cap);

        var _ref2 = _slicedToArray(_ref, 1);

        var text = _ref2[0];


        var token = text.textAnnotations[0].description;

        console.log("RESULT : Token Captcha : " + token);
        console.log("INPUT : Input username in form..");
        await page.type("input:nth-child(5)", this.user, { delay: 100 });
        console.log("INPUT : Input password in form..");
        await page.type("input:nth-child(8)", this.pass, { delay: 100 });
        console.log("INPUT : Input captcha token in form..");
        await page.type(".validation > input", token);
        console.log("SUBMIT : Login progress..");
        await page.keyboard.press("Enter");
        console.log("LOG : Waiting progress after submit login");
        await page.waitForNavigation();
        if ((await page.$('a[id="myaccounts"]')) !== null || (await page.$('a[href="Logout.html"]')) !== null) {
          console.log("LOG : Go to myaccounts menu...");
          await page.click('a[id="myaccounts"]');
          console.log("LOG : Loading ajax progress after click myaccounts...");
          await page.waitForTimeout({
            timeout: timeout,
            waitUntil: "domcontentloaded"
          });
          try {
            var frame = await page.frames().find(function (fr) {
              return fr.name() === "menus";
            });
            console.log("LOG : Go to mutasi menu...");
            await frame.waitForSelector('a[href="AccountStatement.html"]').then(function () {
              return console.log("LOG : all page loaded for mutasi menu");
            });
            console.log("LOG : Loading ajax progress after click accountStatement menu...");
            await frame.click('a[href="AccountStatement.html"]', {
              timeout: timeout,
              waitUntil: "domcontentloaded"
            });
          } catch (err) {
            console.log("LOG : " + err);
            if ((await page.$('a[href="Logout.html"]')) !== null) {
              await page.click('a[href="Logout.html"]');
              await page.waitForTimeout();
              console.log("LOG : Logout account from ibri");
              page.on("dialog", async function (dialog) {
                console.log(dialog.message());
                await dialog.accept();
                await browser.close();
              });
            }
          }

          await page.waitForTimeout({
            timeout: timeout,
            waitUntil: "domcontentloaded"
          });

          try {
            var _frame = await page.frames().find(function (fr) {
              return fr.name() === "content";
            });
            await _frame.waitForSelector("#ACCOUNT_NO").then(function () {
              return console.log("LOG : all page loaded");
            });

            await _frame.select("#ACCOUNT_NO", norek);
            await _frame.waitForTimeout(2000);
            console.log("INPUT : Input rekening in form..");
            await _frame.waitForTimeout(2000);
            await _frame.click('input[id="VIEW_TYPE0"]');

            console.log("SUBMIT : Submit form..");
            await _frame.click('input[name="submitButton"]', {
              timeout: timeout,
              waitUntil: "domcontentloaded"
            });
          } catch (err) {
            console.log("LOG : " + err);
            if ((await page.$('a[href="Logout.html"]')) !== null) {
              await page.click('a[href="Logout.html"]');
              await page.waitForTimeout();
              console.log("LOG : Logout account from ibri");
              page.on("dialog", async function (dialog) {
                console.log(dialog.message());
                await dialog.accept();
                await browser.close();
              });
            }
          }

          await page.waitForTimeout({
            timeout: timeout,
            waitUntil: "domcontentloaded"
          });

          try {
            var _frame2 = await page.frames().find(function (fr) {
              return fr.name() === "content";
            });
            await _frame2.waitForSelector("#divToPrint > div > table").then(function () {
              return console.log("LOG : all page loaded");
            });

            var DataMutasi = await _frame2.evaluate(function () {
              var rekeningData = document.querySelectorAll("#divToPrint > div > table > tbody > tr > td:nth-child(2)");
              var nama_pemilik = rekeningData[0].innerText.trim();
              var account_number = rekeningData[1].innerText.trim();
              var mata_uang = rekeningData[2].innerText.trim();
              var periode = rekeningData[3].innerText.trim();
              var tanggal_mutasi = rekeningData[4].innerText.trim();

              var rows = document.querySelectorAll("#tabel-saldo > tbody > tr");
              var arr = Array.from(rows, function (row) {
                var columns = row.querySelectorAll("td");
                return Array.from(columns, function (column) {
                  return column.innerText;
                });
              });

              console.log("LOG : Generate mutasi data...");
              var ResDataMutasi = [];
              arr.forEach(function (data) {
                var date = data[0];
                var desc = data[1];
                var debet = data[2];
                var kredit = data[3];
                var saldo = data[4];

                if (desc === "Saldo Awal" | desc === "Total Mutasi" | desc === "Saldo Akhir") {
                  return;
                }

                if (debet.length > 0) {
                  var type = "debet";
                  var jumlah = debet.replace(",00", ".00");
                } else {
                  var type = "kredit";
                  var jumlah = kredit.replace(",00", ".00");
                }

                ResDataMutasi.push({
                  date: date,
                  description: desc,
                  type: type,
                  jumlah: jumlah,
                  saldo: saldo.replace(",00", ".00")
                });
              });

              return {
                nama_pemilik: nama_pemilik,
                account_number: account_number,
                mata_uang: mata_uang,
                periode: periode,
                tanggal_mutasi: tanggal_mutasi,
                response: ResDataMutasi
              };
            });

            await page.click("#main-page > div.headerwrap > div > div.uppernav.col-1-2 > span:nth-child(1) > a:nth-child(4) > b");
            await page.waitForTimeout();
            console.log("LOG : Logout account from ibri");
            page.on("dialog", async function (dialog) {
              console.log(dialog.message());
              await dialog.accept();
              await browser.close();
            });
            await page.keyboard.press("Enter");
            return DataMutasi;
          } catch (err) {
            console.log("LOG : " + err);
            if ((await page.$('a[href="Logout.html"]')) !== null) {
              await page.click('a[href="Logout.html"]');
              await page.waitForTimeout();
              console.log("LOG : Logout account from ibri");
              page.on("dialog", async function (dialog) {
                console.log(dialog.message());
                await dialog.accept();
                await browser.close();
              });
            }
            return err;
          }
        } else {
          if ((await page.$("#errormsg-wrap")) !== null) {
            var error_msg = await page.evaluate(function () {
              return document.querySelector("h2.errorresp").innerText;
            });
            var err = {
              status: "ERROR",
              error_code: 104,
              error_message: error_msg
            };

            console.log(err);
          } else {
            if ((await page.$('a[href="Logout.html"]')) !== null) {
              await page.click('a[href="Logout.html"]');
              await page.waitForTimeout();
              console.log("LOG : Logout account from ibri");
              page.on("dialog", async function (dialog) {
                console.log(dialog.message());
                await dialog.accept();
              });
            }

            var _err = {
              status: "ERROR",
              error_code: 105,
              error_message: "Please try again..."
            };

            return _err;
          }
        }
      } catch (e) {
        console.log("LOG : cant load the page, maybe server is busy : " + e);

        console.log(e);
      }
    }
  }]);

  return ScraperBank;
}();

module.exports = ScraperBank;