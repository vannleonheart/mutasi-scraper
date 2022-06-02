function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const fs = require("fs");
const { compile } = require("html-to-text");
const vision = "@google-cloud/vision";
const format = require('date-format');
const consola = require('consola')
const convert = compile({
    wordwrap: 130
});

const timeout = 100000;
puppeteer.use(StealthPlugin());
// check if file exists
const fileExists = filePath => {
    try {
        return fs.statSync(filePath).isFile();
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
const color = function (text, color) {
    var colors = {
        "red": "\x1b[31m%s\x1b[0m",
        "green": "\x1b[32m%s\x1b[0m",
        "yellow": "\x1b[33m%s\x1b[0m",
        "blue": "\x1b[34m%s\x1b[0m",
        "magenta": "\x1b[35m%s\x1b[0m",
        "cyan": "\x1b[36m%s\x1b[0m",
        "white": "\x1b[37m%s\x1b[0m"
    };
    return colors[color] ? colors[color].replace("%s", text) : text;
};
consola.info(color("[+]", "green") + " Starting Scraper");

class ScraperBank {
    constructor(user, pass, args = {}) {
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
     * @description : Scraping data from Mandiri website
     * Resutlt 1 bulan terakhir
     * @returns mutasi
     */
    getMandiri() {
        var _this = this;
        consola.info(color("[+]", "green") + " STARTING MANDIRI SETTLEMENT SCRAPER"); // BCA SETTLEMENT
        return _asyncToGenerator(function* () {
            try {
                _this.browser = yield puppeteer.launch(_this.konfigbrowser);
                _this.page = yield _this.browser.newPage();
                yield _this.page.goto("https://ibank.bankmandiri.co.id/retail3/loginfo/loginRequest", {
                    waitUntil: "networkidle2"
                });
                consola.info(color("[+]", "green") + " LOGIN .."); // BCA SETTLEMENT
                yield _this.page.type("#userid_sebenarnya", _this.user, {
                    delay: 100
                });
                yield _this.page.type("#pwd_sebenarnya", _this.pass, {
                    delay: 100
                });
                yield _this.page.click("#btnSubmit");
                yield _this.page.waitForNavigation({
                    waitUntil: "networkidle2"
                });
                let url;
                consola.info(color("[+]", "green") + " GET SETTLEMENT .."); //
                yield _this.page.click("div.acc-left");
                yield _this.page.waitForSelector("#globalTable > tbody > tr:nth-child(1) > td.desc > div");
                const result = yield _this.page.$$eval("#globalTable > tbody > tr", function (rows) {
                    return Array.from(rows, function (row) {
                        const columns = row.querySelectorAll("td");
                        return Array.from(columns, function (column) {
                            return column.innerText;
                        });
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
                yield _this.page.goto("https://ibank.bankmandiri.co.id/retail3/loginfo/logout");
                yield _this.browser.close();
                return arrayfilter;
            } catch (error) {
                consola.error(" Terjadi kesalahan kode: " + err); // 
                return error;
            }
        })();
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
    getBCA(tglawal, blnawal, tglakhir, blnakhir) {
        var _this2 = this;

        return _asyncToGenerator(function* () {
            tglawal = tglawal || format.asString('dd', new Date());
            blnawal = blnawal || format.asString('M', new Date());
            tglakhir = tglakhir || format.asString('dd', new Date());
            blnakhir = blnakhir || format.asString('M', new Date());

            const browser = yield puppeteer.launch(_this2.konfigbrowser);
            const page = yield browser.newPage();
            consola.info(color("[+]", "green") + " STARTING BCA SETTLEMENT SCRAPER"); // BCA SETTLEMENT
            try {
                yield page.goto("https://ibank.klikbca.com/", {
                    waitUntil: "networkidle0"
                });
                yield page.setViewport({
                    width: 1366,
                    height: 635
                });
                page.on("dialog", (() => {
                    var ref = _asyncToGenerator(function* (dialog) {
                        consola.error(dialog.message());
                        yield dialog.dismiss();
                        process.exit(1);
                    });

                    return function (_x) {
                        return ref.apply(this, arguments);
                    };
                })());
                yield page.type("#user_id", _this2.user);
                yield page.type("#pswd", _this2.pass);
                yield page.keyboard.press("Enter");
                yield page.waitForNavigation({
                    setTimeout: 10000,
                    waitUntil: "networkidle0"
                });
                yield page.goto("https://ibank.klikbca.com/nav_bar_indo/account_information_menu.htm", {
                    waitUntil: "networkidle0"
                });
                consola.info(color("[+]", "green") + " STARTING LOGIN");
                yield page.waitForSelector("tbody > tr:nth-child(2) > td > font > a");
                yield page.click("tbody > tr:nth-child(2) > td > font > a");
                const pageTarget = page.target();
                const newTarget = yield browser.waitForTarget(function (target) {
                    return target.opener() === pageTarget;
                });

                const newPage = yield newTarget.page();
                newPage.on("dialog", (() => {
                    var ref = _asyncToGenerator(function* (dialog) {
                        consola.info(dialog.message());
                        yield dialog.dismiss();
                    });

                    return function (_x) {
                        return ref.apply(this, arguments);
                    };
                })());
                consola.info(color("[+]", "green") + " GET SETTLEMENT");
                yield newPage.waitForTimeout(2000);
                yield newPage.select("#startDt", tglawal.padStart(2, "0"));
                yield newPage.select("#startMt", blnawal.toString());
                yield newPage.select("#endDt", tglakhir.padStart(2, "0"));
                yield newPage.select("#endMt", blnakhir.toString());
                yield newPage.waitForSelector("table:nth-child(4) > tbody > tr > td > input:nth-child(1)");
                yield newPage.click("table:nth-child(4) > tbody > tr > td > input:nth-child(1)");
                yield newPage.waitForTimeout(2000);
                const result = yield newPage.evaluate(function () {
                    return document.body.innerHTML;
                });
                const reg = result.split("Saldo")[1].split('</table>  </td></tr><tr>  <td colspan="2">    <table border="0" width="70%" cellpadding="0" cellspacing="0" bordercolor="#ffffff">')[0];
                const td = reg.split(/<\/tr>/);
                let res = [];
                td.forEach(function (element) {
                    const potong = element.split("</td>");
                    res.push({
                        tanggal: potong[0],
                        keterangan: potong[1],
                        cab: potong[2],
                        nominal: potong[3],
                        mutasi: potong[4],
                        saldoakhir: potong[5]
                    });
                });
                let okey = [];
                for (let i = 0; i < res.length; i++) {
                    let str = convert(res[i].nominal, {
                        wordwrap: 130
                    });
                    let saldo = convert(res[i].saldoakhir, {
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
                consola.success(color("[+]", "green") + " ALLDONE");
                yield page.goto("https://ibank.klikbca.com/authentication.do?value(actions)=logout", {
                    waitUntil: "networkidle0"
                }); // logout
                yield browser.close();
                return okey.slice(1, -1);
            } catch (error) {
                consola.error("Terjadi kesalahan , kode :  " + error);
                yield page.goto("https://ibank.klikbca.com/authentication.do?value(actions)=logout", {
                    waitUntil: "networkidle0"
                }); // logout
                yield browser.close();
                return error;
            }
        })();
    }
    /**
     * BNI Settlement Scraper
     * Created By Abdul Muttaqin
     * @param  {  }
     * Resutlt 1 bulan terakhir
     */
    getBNI() {
        var _this3 = this;

        return _asyncToGenerator(function* () {
            const browser = yield puppeteer.launch(_this3.konfigbrowser);
            const page = yield browser.newPage();
            try {
                consola.info(color("[+]", "green") + " STARTING BNI SETTLEMENT SCRAPER"); // BNI SETTLEMENT
                yield page.goto("https://ibank.bni.co.id/MBAWeb/FMB");
                yield page.setViewport({
                    width: 1536,
                    height: 731
                });
                yield page.waitForSelector("#RetailUser_table #RetailUser");
                yield page.click("#RetailUser_table #RetailUser");
                yield page.waitForSelector("#s1_table #CorpId");
                yield page.click("#s1_table #CorpId");
                consola.info(color("[+]", "green") + " LOGIN TO IBANKING BNI");
                yield page.type("#s1_table #CorpId", _this3.user);
                yield page.waitForSelector("#s1_table #PassWord");
                yield page.click("#s1_table #PassWord");
                yield page.type("#s1_table #PassWord", _this3.pass);
                yield page.keyboard.press("Enter");
                yield page.waitForSelector("#MBMenuList");
                yield page.click("#MBMenuList");
                yield page.waitForSelector("#AccountMenuList_table #AccountMenuList");
                const elements = yield page.$x("//*[contains(text(),'MUTASI')]");
                yield elements[0].click();
                yield page.waitForSelector("#MAIN_ACCOUNT_TYPE");
                yield page.select("#MAIN_ACCOUNT_TYPE", "OPR");
                yield page.click("#AccountIDSelectRq");
                yield page.waitForSelector("#Search_Option_6");
                yield page.select("#TxnPeriod", "LastMonth");
                yield page.click("#FullStmtInqRq");
                yield page.waitForTimeout(2000);
                consola.info(color("[+]", "green") + " GET SETTLEMENT");
                const result = yield page.$$eval("table > tbody > tr", function (rows) {
                    return Array.from(rows, function (row) {
                        const columns = row.querySelectorAll("td");
                        return Array.from(columns, function (column) {
                            return column.innerText;
                        });
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
                yield page.waitForTimeout(2000);
                yield page.waitForSelector("#LogOut");
                yield page.click("#LogOut");
                yield page.waitForSelector("#__LOGOUT__");
                yield page.click("#__LOGOUT__");
                yield browser.close();
                return arrayfilter.slice(6, -7);
            } catch (error) {
                consola.error("Terjadi kesalahan , error kode : "+error);
            }
        })();
    }
    getDanamon() {
        var _this4 = this;

        return _asyncToGenerator(function* () {
            const browser = yield puppeteer.launch(_this4.konfigbrowser);
            const page = yield browser.newPage();
            try {
                yield page.goto("https://www.danamonline.com/onlinebanking/Login/lgn_new.aspx");
                yield page.setViewport({ width: 1536, height: 731 });

                yield page.waitForSelector("#txtAccessCode");
                yield page.type("#txtAccessCode", "cejuhilen1808@gmail.com");
                yield page.type("#txtPin", "missyou2");

                yield page.keyboard.press("Enter");
                yield page.waitForSelector("#frmDefault > div > div.transaction-area > div.ld-menu");
                yield page.goto("https://www.danamonline.com/onlinebanking/default.aspx?usercontrol=DepositAcct/dp_TrxHistory_new");
                yield page.waitForSelector("#_ctl0_btnGetDetails");
                yield page.select("#_ctl0_ddlTrxPeriod", "10 Hari Terakhir");
                yield page.click("#_ctl0_btnGetDetails");
                yield page.waitForTimeout(2000);

                const result = yield page.evaluate(function () {
                    return document.body.innerHTML;
                });

                yield page.waitForTimeout(2000);
                yield page.goto("https://www.danamonline.com/onlinebanking/Login/lgn_logout.aspx");

                yield browser.close();
                if (result.includes("Tidak ditemukan data")) {
                    return { message: "Tidak ditemukan data" };
                } else {
                    const res = yield page.$$eval("#_ctl0_dgList > tbody > tr", function (rows) {
                        return Array.from(rows, function (row) {
                            const columns = row.querySelectorAll("td");
                            return Array.from(columns, function (column) {
                                return column.innerText;
                            });
                        });
                    });
                    return res.slice(1);
                }
            } catch (error) {
                consola.info(error);
                yield page.goto("https://www.danamonline.com/onlinebanking/Login/lgn_logout.aspx");
            }
        })();
    }

    getBRI(norek) {
        var _this5 = this;

        return _asyncToGenerator(function* () {
            if (!fileExists("./apikey.json")) {

                return "API KEY GOOGLE VISION DIBUTUHKAN UNTUK MENGAMBIL KODE OCR \n hubungi dev untuk alternatif jika ingin menggunakan library tesseract-ocr";
               
            }
            const client = new vision.ImageAnnotatorClient({
                keyFilename: "./apikey.json"
            });
            const browser = yield puppeteer.launch(_this5.konfigbrowser);
            const page = yield browser.newPage();

            yield page.setDefaultNavigationTimeout(timeout);
            yield page.setDefaultTimeout(timeout);
            yield page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36");
            yield page.evaluateOnNewDocument(function () {
                Object.defineProperty(navigator, "webdriver", {
                    get: function () {
                        return false;
                    }
                });
            });

            yield page.evaluateOnNewDocument(function () {
                window.chrome = {
                    runtime: {}
                };
            });

            try {
                yield page.goto("http://ib.bri.co.id/ib-bri/Login.html", {
                    waitUntil: "networkidle0"
                });

                consola.info("LOG : Loading progress");
                const captchaPath = "./cache/";
                try {
                    yield page.waitForSelector('img[class="alignimg"]').then(function () {
                        return consola.info("LOG : all page loaded");
                    });
                    const element = yield page.$('img[class="alignimg"]');
                    consola.info("LOG : Screenshoot captcha Images...");
                    yield element.screenshot({ path: captchaPath + "captcha.png" });
                } catch (err) {
                    consola.error("LOG : " + err);
                }

                const cap = captchaPath + "captcha.png";
                const config = {
                    lang: "equ",
                    psm: 10,
                    tessedit_char_whitelist: "0123456789"
                };
                const [text] = yield client.textDetection(cap);

                let token = text.textAnnotations[0].description;

                consola.info("RESULT : Token Captcha : " + token);
                consola.info("INPUT : Input username in form..");
                yield page.type("input:nth-child(5)", _this5.user, { delay: 100 });
                consola.info("INPUT : Input password in form..");
                yield page.type("input:nth-child(8)", _this5.pass, { delay: 100 });
                consola.info("INPUT : Input captcha token in form..");
                yield page.type(".validation > input", token);
                consola.info("SUBMIT : Login progress..");
                yield page.keyboard.press("Enter");
                consola.info("LOG : Waiting progress after submit login");
                yield page.waitForNavigation();
                if ((yield page.$('a[id="myaccounts"]')) !== null || (yield page.$('a[href="Logout.html"]')) !== null) {
                    consola.info("LOG : Go to myaccounts menu...");
                    yield page.click('a[id="myaccounts"]');
                    consola.info("LOG : Loading ajax progress after click myaccounts...");
                    yield page.waitForTimeout({
                        timeout: timeout,
                        waitUntil: "domcontentloaded"
                    });
                    try {
                        const frame = yield page.frames().find(function (fr) {
                            return fr.name() === "menus";
                        });
                        consola.info("LOG : Go to mutasi menu...");
                        yield frame.waitForSelector('a[href="AccountStatement.html"]').then(function () {
                            return consola.info("LOG : all page loaded for mutasi menu");
                        });
                        consola.info("LOG : Loading ajax progress after click accountStatement menu...");
                        yield frame.click('a[href="AccountStatement.html"]', {
                            timeout: timeout,
                            waitUntil: "domcontentloaded"
                        });
                    } catch (err) {
                        consola.info("LOG : " + err);
                        if ((yield page.$('a[href="Logout.html"]')) !== null) {
                            yield page.click('a[href="Logout.html"]');
                            yield page.waitForTimeout();
                            consola.info("LOG : Logout account from ibri");
                            page.on("dialog", (() => {
                                var ref = _asyncToGenerator(function* (dialog) {
                                    consola.info(dialog.message());
                                    yield dialog.accept();
                                    yield browser.close();
                                });

                                return function (_x2) {
                                    return ref.apply(this, arguments);
                                };
                            })());
                        }
                    }

                    yield page.waitForTimeout({
                        timeout: timeout,
                        waitUntil: "domcontentloaded"
                    });

                    try {
                        const frame = yield page.frames().find(function (fr) {
                            return fr.name() === "content";
                        });
                        yield frame.waitForSelector("#ACCOUNT_NO").then(function () {
                            return consola.info("LOG : all page loaded");
                        });

                        yield frame.select("#ACCOUNT_NO", norek);
                        yield frame.waitForTimeout(2000);
                        consola.info("INPUT : Input rekening in form..");
                        yield frame.waitForTimeout(2000);
                        yield frame.click('input[id="VIEW_TYPE0"]');

                        consola.info("SUBMIT : Submit form..");
                        yield frame.click('input[name="submitButton"]', {
                            timeout: timeout,
                            waitUntil: "domcontentloaded"
                        });
                    } catch (err) {
                        consola.info("LOG : " + err);
                        if ((yield page.$('a[href="Logout.html"]')) !== null) {
                            yield page.click('a[href="Logout.html"]');
                            yield page.waitForTimeout();
                            consola.info("LOG : Logout account from ibri");
                            page.on("dialog", (() => {
                                var ref = _asyncToGenerator(function* (dialog) {
                                    consola.info(dialog.message());
                                    yield dialog.accept();
                                    yield browser.close();
                                });

                                return function (_x3) {
                                    return ref.apply(this, arguments);
                                };
                            })());
                        }
                    }

                    yield page.waitForTimeout({
                        timeout: timeout,
                        waitUntil: "domcontentloaded"
                    });

                    try {
                        const frame = yield page.frames().find(function (fr) {
                            return fr.name() === "content";
                        });
                        yield frame.waitForSelector("#divToPrint > div > table").then(function () {
                            return consola.info("LOG : all page loaded");
                        });

                        const DataMutasi = yield frame.evaluate(function () {
                            const rekeningData = document.querySelectorAll("#divToPrint > div > table > tbody > tr > td:nth-child(2)");
                            const nama_pemilik = rekeningData[0].innerText.trim();
                            const account_number = rekeningData[1].innerText.trim();
                            const mata_uang = rekeningData[2].innerText.trim();
                            const periode = rekeningData[3].innerText.trim();
                            const tanggal_mutasi = rekeningData[4].innerText.trim();

                            const rows = document.querySelectorAll("#tabel-saldo > tbody > tr");
                            const arr = Array.from(rows, function (row) {
                                const columns = row.querySelectorAll("td");
                                return Array.from(columns, function (column) {
                                    return column.innerText;
                                });
                            });

                            consola.info("LOG : Generate mutasi data...");
                            const ResDataMutasi = [];
                            arr.forEach(function (data) {
                                const date = data[0];
                                const desc = data[1];
                                const debet = data[2];
                                const kredit = data[3];
                                const saldo = data[4];

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

                        yield page.click("#main-page > div.headerwrap > div > div.uppernav.col-1-2 > span:nth-child(1) > a:nth-child(4) > b");
                        yield page.waitForTimeout();
                        consola.info("LOG : Logout account from ibri");
                        page.on("dialog", (() => {
                            var ref = _asyncToGenerator(function* (dialog) {
                                consola.info(dialog.message());
                                yield dialog.accept();
                                yield browser.close();
                            });

                            return function (_x4) {
                                return ref.apply(this, arguments);
                            };
                        })());
                        yield page.keyboard.press("Enter");
                        return DataMutasi;
                    } catch (err) {
                        consola.info("LOG : " + err);
                        if ((yield page.$('a[href="Logout.html"]')) !== null) {
                            yield page.click('a[href="Logout.html"]');
                            yield page.waitForTimeout();
                            consola.info("LOG : Logout account from ibri");
                            page.on("dialog", (() => {
                                var ref = _asyncToGenerator(function* (dialog) {
                                    consola.info(dialog.message());
                                    yield dialog.accept();
                                    yield browser.close();
                                });

                                return function (_x5) {
                                    return ref.apply(this, arguments);
                                };
                            })());
                        }
                        return err;
                    }
                } else {
                    if ((yield page.$("#errormsg-wrap")) !== null) {
                        const error_msg = yield page.evaluate(function () {
                            return document.querySelector("h2.errorresp").innerText;
                        });
                        const err = {
                            status: "ERROR",
                            error_code: 104,
                            error_message: error_msg
                        };

                        consola.info(err);
                    } else {
                        if ((yield page.$('a[href="Logout.html"]')) !== null) {
                            yield page.click('a[href="Logout.html"]');
                            yield page.waitForTimeout();
                            consola.info("LOG : Logout account from ibri");
                            page.on("dialog", (() => {
                                var ref = _asyncToGenerator(function* (dialog) {
                                    consola.info(dialog.message());
                                    yield dialog.accept();
                                });

                                return function (_x6) {
                                    return ref.apply(this, arguments);
                                };
                            })());
                        }

                        const err = {
                            status: "ERROR",
                            error_code: 105,
                            error_message: "Please try again..."
                        };

                        return err;
                    }
                }
            } catch (e) {
                consola.info("LOG : cant load the page, maybe server is busy : " + e);

                consola.info(e);
            }
        })();
    }
}
module.exports = ScraperBank;
