"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { return step("next", value); }, function (err) { return step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var fs = require("fs");

var _require = require("html-to-text");

var compile = _require.compile;

var randomUseragent = require('random-useragent');
var axios = require("axios");
var convert = compile({ wordwrap: 130 });
var FormData = require('form-data');
var timeout = 10000000;
var puppeteer = require("puppeteer-extra");
var stealthPlugin = require("puppeteer-extra-plugin-stealth")();

["chrome.runtime", "navigator.languages"].forEach(function (a) {
  return stealthPlugin.enabledEvasions.delete(a);
});

puppeteer.use(stealthPlugin);
var fileExists = function fileExists(filePath) {
  try {
    return fs.statSync(filePath).isFile();
  } catch (err) {
    return false;
  }
};

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
      executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe'
      // , userDataDir: args.userdatadir || "./fdciabdul"
      , disablegpu: true
    };
  }

  _createClass(ScraperBank, [{
    key: "getMandiri",
    value: function () {
      var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
        var message, result, saldo, arrayfilter, i, filtered, arr, _i, potong2, tipe, saldoakhir;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.prev = 0;
                _context.next = 3;
                return puppeteer.launch(this.konfigbrowser);

              case 3:
                this.browser = _context.sent;
                _context.next = 6;
                return this.browser.newPage();

              case 6:
                this.page = _context.sent;
                _context.next = 9;
                return this.page.goto("https://ibank.bankmandiri.co.id/retail3/loginfo/loginRequest", {
                  waitUntil: "networkidle2"

                });

              case 9:
                _context.next = 11;
                return this.page.type("#userid_sebenarnya", this.user, {
                  delay: 100

                });

              case 11:
                _context.next = 13;
                return this.page.type("#pwd_sebenarnya", this.pass, {
                  delay: 100

                });

              case 13:
                _context.next = 15;
                return this.page.click("#btnSubmit");

              case 15:
                _context.next = 17;
                return this.page.waitForNavigation({
                  waitUntil: "networkidle2"

                });

              case 17:
                _context.prev = 17;

                if (!(this.page.$(".ns-box-inner p") !== null)) {
                  _context.next = 25;
                  break;
                }

                _context.next = 21;
                return this.page.$eval('.ns-box-inner p', function (el) {
                  return el.innerText;
                });

              case 21:
                message = _context.sent;
                _context.next = 24;
                return this.browser.close();

              case 24:
                return _context.abrupt("return", {
                  message: message
                });

              case 25:
                _context.next = 29;
                break;

              case 27:
                _context.prev = 27;
                _context.t0 = _context["catch"](17);

              case 29:
                _context.next = 31;
                return this.page.click("div.acc-left");

              case 31:
                _context.next = 33;
                return this.page.waitForSelector("#globalTable > tbody > tr:nth-child(1) > td.desc > div");

              case 33:
                _context.next = 35;
                return this.page.$$eval("#globalTable > tbody > tr", function (rows) {
                  return Array.from(rows, function (row) {
                    var columns = row.querySelectorAll("td");
                    return Array.from(columns, function (column) {
                      return column.innerText;
                    });
                  });
                });

              case 35:
                result = _context.sent;
                _context.next = 38;
                return this.page.$eval('.balance-amount', function (el) {
                  return el.innerText;
                });

              case 38:
                saldo = _context.sent;
                arrayfilter = [];

                for (i = 0; i < result.length; i++) {
                  filtered = result[i].filter(function (el) {
                    return el != "-";
                  });

                  if (filtered.length > 0) {
                    arrayfilter.push(filtered);
                  }
                }
                _context.next = 43;
                return this.page.goto("https://ibank.bankmandiri.co.id/retail3/loginfo/logout");

              case 43:
                _context.next = 45;
                return this.browser.close();

              case 45:
                arr = [];

                for (_i = 1; _i < result.length; _i++) {
                  potong2 = result[_i];
                  saldoakhir = saldo.replace("IDR", "");

                  if (potong2[2].includes("-")) {
                    tipe = "DB";
                  } else {
                    nominal = potong2[2];
                  }
                  if (potong2[3].includes("-")) {
                    tipe = "CR";
                  } else {
                    nominal = potong2[3];
                  }
                  arr.push({
                    tanggal: potong2[0],
                    keterangan: potong2[1],
                    mutasi: tipe,
                    nominal: nominal,
                    saldoakhir: saldoakhir
                  });
                }
                return _context.abrupt("return", arr);

              case 50:
                _context.prev = 50;
                _context.t1 = _context["catch"](0);
                _context.next = 54;
                return this.browser.close();

              case 54:
                return _context.abrupt("return", _context.t1);

              case 55:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, this, [[0, 50], [17, 27]]);
      }));

      function getMandiri() {
        return ref.apply(this, arguments);
      }

      return getMandiri;
    }()
  }, {
    key: "getBCA",
    value: function () {
      var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee4(tglawal, blnawal, tglakhir, blnakhir) {
        var _this = this;

        var browser, page, _ret;

        return regeneratorRuntime.wrap(function _callee4$(_context4) {
          while (1) {
            switch (_context4.prev = _context4.next) {
              case 0:
                _context4.next = 2;
                return puppeteer.launch(this.konfigbrowser);

              case 2:
                browser = _context4.sent;
                _context4.next = 5;
                return browser.newPage();

              case 5:
                page = _context4.sent;
                _context4.next = 8;
                return page.evaluateOnNewDocument(function () {
                  delete navigator.__proto__.webdriver;
                });

              case 8:
                _context4.next = 10;
                return page.setRequestInterception(true);

              case 10:

                page.on('request', function (request) {
                  if (['image', 'stylesheet', 'font'].includes(request.resourceType())) {
                    request.abort();
                  } else {
                    request.continue();
                  }
                });
                _context4.prev = 11;
                return _context4.delegateYield(regeneratorRuntime.mark(function _callee3() {
                  var pesan, pageTarget, newTarget, newPage, result, reg, td, res, okey, i, str, saldo;
                  return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                      switch (_context3.prev = _context3.next) {
                        case 0:
                          _context3.next = 2;
                          return page.goto("https://ibank.klikbca.com/", {
                            waitUntil: "networkidle0"

                          });

                        case 2:
                          _context3.next = 4;
                          return page.setViewport({
                            width: 1366,
                            height: 635

                          });

                        case 4:
                          _context3.next = 6;
                          return page.type("#user_id", _this.user);

                        case 6:
                          _context3.next = 8;
                          return page.type("#pswd", _this.pass);

                        case 8:
                          _context3.next = 10;
                          return page.keyboard.press("Enter");

                        case 10:
                          _context3.next = 12;
                          return page.waitForNavigation({
                            setTimeout: 10000,
                            waitUntil: "networkidle0"

                          });

                        case 12:
                          _context3.next = 14;
                          return page.goto("https://ibank.klikbca.com/nav_bar_indo/account_information_menu.htm", {
                            waitUntil: "networkidle0"

                          });

                        case 14:
                          pesan = new Promise(function (resolve, reject) {
                            var handler = function () {
                              var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(dialog) {
                                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                                  while (1) {
                                    switch (_context2.prev = _context2.next) {
                                      case 0:
                                        _context2.next = 2;
                                        return dialog.dismiss();

                                      case 2:
                                        resolve(dialog.message());

                                      case 3:
                                      case "end":
                                        return _context2.stop();
                                    }
                                  }
                                }, _callee2, _this);
                              }));

                              return function handler(_x6) {
                                return ref.apply(this, arguments);
                              };
                            }();
                            page.once("dialog", handler);
                          });
                          _context3.next = 17;
                          return page.waitForSelector("tbody > tr:nth-child(2) > td > font > a");

                        case 17:
                          _context3.next = 19;
                          return page.click("tbody > tr:nth-child(2) > td > font > a");

                        case 19:
                          pageTarget = page.target();
                          _context3.next = 22;
                          return browser.waitForTarget(function (target) {
                            return target.opener() === pageTarget;
                          });

                        case 22:
                          newTarget = _context3.sent;
                          _context3.next = 25;
                          return newTarget.page();

                        case 25:
                          newPage = _context3.sent;
                          _context3.next = 28;
                          return newPage.waitForTimeout(2000);

                        case 28:
                          _context3.next = 30;
                          return newPage.select("#startDt", tglawal.padStart(2, "0"));

                        case 30:
                          _context3.next = 32;
                          return newPage.select("#startMt", blnawal.toString());

                        case 32:
                          _context3.next = 34;
                          return newPage.select("#endDt", tglakhir.padStart(2, "0"));

                        case 34:
                          _context3.next = 36;
                          return newPage.select("#endMt", blnakhir.toString());

                        case 36:
                          _context3.next = 38;
                          return newPage.waitForSelector("table:nth-child(4) > tbody > tr > td > input:nth-child(1)");

                        case 38:
                          _context3.next = 40;
                          return newPage.click("table:nth-child(4) > tbody > tr > td > input:nth-child(1)");

                        case 40:
                          _context3.next = 42;
                          return newPage.waitForTimeout(2000);

                        case 42:
                          _context3.next = 44;
                          return newPage.evaluate(function () {
                            return document.body.innerHTML;
                          });

                        case 44:
                          result = _context3.sent;
                          reg = result.split("Saldo")[1].split('</table>  </td></tr><tr>  <td colspan="2">    <table border="0" width="70%" cellpadding="0" cellspacing="0" bordercolor="#ffffff">')[0];
                          td = reg.split(/<\/tr>/);
                          res = [];

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
                          okey = [];

                          for (i = 0; i < res.length; i++) {
                            str = convert(res[i].nominal, {
                              wordwrap: 130

                            });
                            saldo = convert(res[i].saldoakhir, {
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
                          _context3.next = 53;
                          return page.goto("https://ibank.klikbca.com/authentication.do?value(actions)=logout", {
                            waitUntil: "domcontentloaded"

                          });

                        case 53:
                          _context3.next = 55;
                          return browser.close();

                        case 55:
                          return _context3.abrupt("return", {
                            v: okey.slice(1, -1)
                          });

                        case 56:
                        case "end":
                          return _context3.stop();
                      }
                    }
                  }, _callee3, _this);
                })(), "t0", 13);

              case 13:
                _ret = _context4.t0;

                if (!((typeof _ret === "undefined" ? "undefined" : _typeof(_ret)) === "object")) {
                  _context4.next = 16;
                  break;
                }

                return _context4.abrupt("return", _ret.v);

              case 16:
                _context4.next = 26;
                break;

              case 18:
                _context4.prev = 18;
                _context4.t1 = _context4["catch"](11);

                console.log(_context4.t1);
                _context4.next = 23;
                return page.goto("https://ibank.klikbca.com/authentication.do?value(actions)=logout", {
                  waitUntil: "networkidle0"

                });

              case 23:
                _context4.next = 25;
                return browser.close();

              case 25:
                return _context4.abrupt("return", _context4.t1);

              case 26:
              case "end":
                return _context4.stop();
            }
          }
        }, _callee4, this, [[11, 18]]);
      }));

      function getBCA(_x2, _x3, _x4, _x5) {
        return ref.apply(this, arguments);
      }

      return getBCA;
    }()
  }, {
    key: "getBNI",
    value: function () {
      var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee5() {
        var browser, page, elements, result, arrayfilter, i, filtered, arr, res, string, potong, _i2, potong2, mutasi;

        return regeneratorRuntime.wrap(function _callee5$(_context5) {
          while (1) {
            switch (_context5.prev = _context5.next) {
              case 0:
                _context5.next = 2;
                return puppeteer.launch(this.konfigbrowser);

              case 2:
                browser = _context5.sent;
                _context5.next = 5;
                return browser.newPage();

              case 5:
                page = _context5.sent;
                _context5.next = 8;
                return page.evaluateOnNewDocument(function () {
                  delete navigator.__proto__.webdriver;
                });

              case 8:
                _context5.prev = 8;
                _context5.next = 11;
                return page.goto("https://ibank.bni.co.id/MBAWeb/FMB");

              case 11:
                _context5.next = 13;
                return page.waitForSelector("#RetailUser_table #RetailUser");

              case 13:
                _context5.next = 15;
                return page.click("#RetailUser_table #RetailUser");

              case 15:
                _context5.next = 17;
                return page.waitForSelector("#s1_table #CorpId");

              case 17:
                _context5.next = 19;
                return page.click("#s1_table #CorpId");

              case 19:
                _context5.next = 21;
                return page.type("#s1_table #CorpId", this.user);

              case 21:
                _context5.next = 23;
                return page.waitForSelector("#s1_table #PassWord");

              case 23:
                _context5.next = 25;
                return page.click("#s1_table #PassWord");

              case 25:
                _context5.next = 27;
                return page.type("#s1_table #PassWord", this.pass);

              case 27:
                _context5.next = 29;
                return page.keyboard.press("Enter");

              case 29:
                _context5.next = 31;
                return page.waitForSelector("#MBMenuList");

              case 31:
                _context5.next = 33;
                return page.click("#MBMenuList");

              case 33:
                _context5.next = 35;
                return page.waitForSelector("#AccountMenuList_table #AccountMenuList");

              case 35:
                _context5.next = 37;
                return page.$x("//*[contains(text(),'MUTASI')]");

              case 37:
                elements = _context5.sent;
                _context5.next = 40;
                return elements[0].click();

              case 40:
                _context5.next = 42;
                return page.waitForSelector("#MAIN_ACCOUNT_TYPE");

              case 42:
                _context5.next = 44;
                return page.select("#MAIN_ACCOUNT_TYPE", "OPR");

              case 44:
                _context5.next = 46;
                return page.click("#AccountIDSelectRq");

              case 46:
                _context5.next = 48;
                return page.waitForSelector("#Search_Option_6");

              case 48:
                _context5.next = 50;
                return page.select("#TxnPeriod", "Today");

              case 50:
                _context5.next = 52;
                return page.click("#FullStmtInqRq");

              case 52:
                _context5.next = 54;
                return page.waitForTimeout(2000);

              case 54:
                _context5.next = 56;
                return page.waitForSelector("table > tbody > tr");

              case 56:
                _context5.next = 58;
                return page.$$eval("table > tbody > tr", function (rows) {
                  return Array.from(rows, function (row) {
                    var columns = row.querySelectorAll("td");
                    return Array.from(columns, function (column) {
                      return column.innerText;
                    });
                  });
                });

              case 58:
                result = _context5.sent;
                arrayfilter = [];

                for (i = 0; i < result.length; i++) {
                  filtered = result[i].filter(function (el) {
                    return el != "-";
                  });

                  if (filtered.length > 0) {
                    arrayfilter.push(filtered);
                  }
                }
                _context5.next = 63;
                return page.waitForTimeout(2000);

              case 63:
                _context5.next = 65;
                return page.waitForSelector("#LogOut");

              case 65:
                _context5.next = 67;
                return page.click("#LogOut");

              case 67:
                _context5.next = 69;
                return page.waitForSelector("#__LOGOUT__");

              case 69:
                _context5.next = 71;
                return page.click("#__LOGOUT__");

              case 71:
                _context5.next = 73;
                return browser.close();

              case 73:
                arr = [];
                res = arrayfilter.slice(6, -7);
                string = res.join("\n");
                potong = string.split("Tanggal Transaksi");

                for (_i2 = 1; _i2 < potong.length; _i2++) {
                  potong2 = potong[_i2].split("\n");
                  mutasi = void 0;

                  if (potong2[5] === "Cr") {
                    mutasi = "CR";
                  } else if (potong2[5] === "Db") {
                    mutasi = "DB";
                  }
                  arr.push({
                    tanggal: potong2[1],
                    keterangan: potong2[3],
                    mutasi: mutasi,
                    nominal: potong2[7],
                    saldoakhir: potong2[9]
                  });
                }
                return _context5.abrupt("return", arr);

              case 81:
                _context5.prev = 81;
                _context5.t0 = _context5["catch"](8);

                console.log(_context5.t0);

              case 84:
              case "end":
                return _context5.stop();
            }
          }
        }, _callee5, this, [[8, 81]]);
      }));

      function getBNI() {
        return ref.apply(this, arguments);
      }

      return getBNI;
    }()
  }, {
    key: "getDanamon",
    value: function () {
      var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee6() {
        var browser, page, result, res;
        return regeneratorRuntime.wrap(function _callee6$(_context6) {
          while (1) {
            switch (_context6.prev = _context6.next) {
              case 0:
                _context6.next = 2;
                return puppeteer.launch(this.konfigbrowser);

              case 2:
                browser = _context6.sent;
                _context6.next = 5;
                return browser.newPage();

              case 5:
                page = _context6.sent;
                _context6.prev = 6;
                _context6.next = 9;
                return page.goto("https://www.danamonline.com/onlinebanking/Login/lgn_new.aspx");

              case 9:
                _context6.next = 11;
                return page.setViewport({
                  width: 1536,
                  height: 731
                });

              case 11:
                _context6.next = 13;
                return page.waitForSelector("#txtAccessCode");

              case 13:
                _context6.next = 15;
                return page.type("#txtAccessCode", "cejuhilen1808@gmail.com");

              case 15:
                _context6.next = 17;
                return page.type("#txtPin", "missyou2");

              case 17:
                _context6.next = 19;
                return page.keyboard.press("Enter");

              case 19:
                _context6.next = 21;
                return page.waitForSelector("#frmDefault > div > div.transaction-area > div.ld-menu");

              case 21:
                _context6.next = 23;
                return page.goto("https://www.danamonline.com/onlinebanking/default.aspx?usercontrol=DepositAcct/dp_TrxHistory_new");

              case 23:
                _context6.next = 25;
                return page.waitForSelector("#_ctl0_btnGetDetails");

              case 25:
                _context6.next = 27;
                return page.select("#_ctl0_ddlTrxPeriod", "10 Hari Terakhir");

              case 27:
                _context6.next = 29;
                return page.click("#_ctl0_btnGetDetails");

              case 29:
                _context6.next = 31;
                return page.waitForTimeout(2000);

              case 31:
                _context6.next = 33;
                return page.evaluate(function () {
                  return document.body.innerHTML;
                });

              case 33:
                result = _context6.sent;
                _context6.next = 36;
                return page.waitForTimeout(2000);

              case 36:
                _context6.next = 38;
                return page.goto("https://www.danamonline.com/onlinebanking/Login/lgn_logout.aspx");

              case 38:
                _context6.next = 40;
                return browser.close();

              case 40:
                if (!result.includes("Tidak ditemukan data")) {
                  _context6.next = 44;
                  break;
                }

                return _context6.abrupt("return", {
                  message: "Tidak ditemukan data"
                });

              case 44:
                _context6.next = 46;
                return page.$$eval("#_ctl0_dgList > tbody > tr", function (rows) {
                  return Array.from(rows, function (row) {
                    var columns = row.querySelectorAll("td");
                    return Array.from(columns, function (column) {
                      return column.innerText;
                    });
                  });
                });

              case 46:
                res = _context6.sent;
                return _context6.abrupt("return", res.slice(1));

              case 48:
                _context6.next = 55;
                break;

              case 50:
                _context6.prev = 50;
                _context6.t0 = _context6["catch"](6);

                console.log(_context6.t0);
                _context6.next = 55;
                return page.goto("https://www.danamonline.com/onlinebanking/Login/lgn_logout.aspx");

              case 55:
              case "end":
                return _context6.stop();
            }
          }
        }, _callee6, this, [[6, 50]]);
      }));

      function getDanamon() {
        return ref.apply(this, arguments);
      }

      return getDanamon;
    }()
  }, {
    key: "getBRI",
    value: function () {
      var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee12(norek) {
        var _this2 = this;

        var browser, page, captchaPath, element, cap, form, recog, token, example, example1, frame, _frame, _frame2, DataMutasi, error_msg, err, _err;

        return regeneratorRuntime.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                _context12.next = 2;
                return puppeteer.launch(this.konfigbrowser);

              case 2:
                browser = _context12.sent;
                _context12.prev = 3;
                _context12.next = 6;
                return browser.newPage();

              case 6:
                page = _context12.sent;

                console.log(page);
                _context12.next = 10;
                return page.setDefaultNavigationTimeout(timeout);

              case 10:
                _context12.next = 12;
                return page.setDefaultTimeout(0);

              case 12:
                _context12.next = 14;
                return page.setUserAgent(randomUseragent.getRandom());

              case 14:
                _context12.next = 16;
                return page.evaluateOnNewDocument(function () {
                  delete navigator.__proto__.webdriver;
                });

              case 16:
                _context12.next = 18;
                return page.goto("https://ib.bri.co.id/", {
                  waitUntil: "networkidle2"

                });

              case 18:
                console.log("LOG : Loading progress");
                captchaPath = "./cache/";
                _context12.prev = 20;
                _context12.next = 23;
                return page.waitForSelector('img[class="alignimg"]').then(function () {
                  return console.log("LOG : all page loaded");
                });

              case 23:
                _context12.next = 25;
                return page.$('img[class="alignimg"]');

              case 25:
                element = _context12.sent;

                console.log("LOG : Screenshoot captcha Images...");
                _context12.next = 29;
                return element.screenshot({
                  path: captchaPath + "captcha.png"
                });

              case 29:
                _context12.next = 36;
                break;

              case 31:
                _context12.prev = 31;
                _context12.t0 = _context12["catch"](20);

                console.log("LOG : " + _context12.t0);
                _context12.next = 36;
                return browser.close();

              case 36:
                cap = captchaPath + "captcha.png";
                form = new FormData();

                form.append('fileName', fs.createReadStream(cap), 'stickers.jpg');
                _context12.next = 41;
                return axios.post('https://www.nyckel.com/v0.9/functions/yduzh0xptiwz8ans/ocr', form, {
                  headers: _extends({}, form.getHeaders(), { Authentication: 'Bearer ...'

                  })

                });

              case 41:
                recog = _context12.sent;
                token = recog.data.text;

                console.log(recog.data);
                _context12.next = 46;
                return page.waitForSelector("#wrapper > div.header-wrap > div > div.logoib.col-1-2 > img");

              case 46:
                console.log("RESULT : Token Captcha : " + token);
                console.log("INPUT : Input username in form..");
                _context12.next = 50;
                return page.$x('//*[@id="loginForm"]/input[3]');

              case 50:
                example = _context12.sent;
                _context12.next = 53;
                return example[0].type(this.user, {
                  delay: 100
                });

              case 53:
                _context12.next = 55;
                return page.keyboard.press("Tab");

              case 55:
                console.log("INPUT : Input password in form..");
                _context12.next = 58;
                return page.$x('//*[@id="loginForm"]/input[6]');

              case 58:
                example1 = _context12.sent;
                _context12.next = 61;
                return example1[0].type(this.pass, {
                  delay: 100
                });

              case 61:
                _context12.next = 63;
                return page.keyboard.press("Tab");

              case 63:
                _context12.next = 65;
                return page.type(".validation > input", token);

              case 65:
                console.log("SUBMIT : Login progress..");
                _context12.next = 68;
                return page.keyboard.press("Enter");

              case 68:
                console.log("LOG : Waiting progress after submit login");

                _context12.next = 71;
                return page.waitForNavigation();

              case 71:
                _context12.next = 73;
                return page.$('a[id="myaccounts"]');

              case 73:
                _context12.t2 = _context12.sent;
                _context12.t1 = _context12.t2 !== null;

                if (_context12.t1) {
                  _context12.next = 80;
                  break;
                }

                _context12.next = 78;
                return page.$('a[href="Logout.html"]');

              case 78:
                _context12.t3 = _context12.sent;
                _context12.t1 = _context12.t3 !== null;

              case 80:
                if (!_context12.t1) {
                  _context12.next = 188;
                  break;
                }

                console.log("LOG : Go to myaccounts menu...");
                _context12.next = 84;
                return page.click('a[id="myaccounts"]');

              case 84:
                console.log("LOG : Loading ajax progress after click myaccounts...");
                _context12.next = 87;
                return page.waitForTimeout({
                  timeout: timeout,
                  waitUntil: "domcontentloaded"

                });

              case 87:
                _context12.prev = 87;
                _context12.next = 90;
                return page.frames().find(function (fr) {
                  return fr.name() === "menus";
                });

              case 90:
                frame = _context12.sent;

                console.log("LOG : Go to mutasi menu...");
                _context12.next = 94;
                return frame.waitForSelector('a[href="AccountStatement.html"]').then(function () {
                  return console.log("LOG : all page loaded for mutasi menu");
                });

              case 94:
                console.log("LOG : Loading ajax progress after click accountStatement menu...");
                _context12.next = 97;
                return frame.click('a[href="AccountStatement.html"]', {
                  timeout: timeout,
                  waitUntil: "domcontentloaded"

                });

              case 97:
                _context12.next = 113;
                break;

              case 99:
                _context12.prev = 99;
                _context12.t4 = _context12["catch"](87);

                console.log("LOG : " + _context12.t4);
                _context12.next = 104;
                return page.$('a[href="Logout.html"]');

              case 104:
                _context12.t5 = _context12.sent;

                if (!(_context12.t5 !== null)) {
                  _context12.next = 113;
                  break;
                }

                _context12.next = 108;
                return page.click('a[href="Logout.html"]');

              case 108:
                _context12.next = 110;
                return page.waitForTimeout();

              case 110:
                console.log("LOG : Logout account from ibri");
                page.on("dialog", function () {
                  var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee7(dialog) {
                    return regeneratorRuntime.wrap(function _callee7$(_context7) {
                      while (1) {
                        switch (_context7.prev = _context7.next) {
                          case 0:
                            console.log(dialog.message());
                            _context7.next = 3;
                            return dialog.accept();

                          case 3:
                            _context7.next = 5;
                            return browser.close();

                          case 5:
                          case "end":
                            return _context7.stop();
                        }
                      }
                    }, _callee7, _this2);
                  }));

                  return function (_x8) {
                    return ref.apply(this, arguments);
                  };
                }());
                return _context12.abrupt("return", {
                  message: "Tidak ditemukan data"
                });

              case 113:
                _context12.next = 115;
                return page.waitForTimeout({
                  timeout: timeout,
                  waitUntil: "domcontentloaded"

                });

              case 115:
                _context12.prev = 115;
                _context12.next = 118;
                return page.frames().find(function (fr) {
                  return fr.name() === "content";
                });

              case 118:
                _frame = _context12.sent;
                _context12.next = 121;
                return _frame.waitForSelector("#ACCOUNT_NO").then(function () {
                  return console.log("LOG : all page loaded");
                });

              case 121:
                _context12.next = 123;
                return _frame.select("#ACCOUNT_NO", norek);

              case 123:
                _context12.next = 125;
                return _frame.waitForTimeout(2000);

              case 125:
                console.log("INPUT : Input rekening in form..");
                _context12.next = 128;
                return _frame.waitForTimeout(2000);

              case 128:
                _context12.next = 130;
                return _frame.click('input[id="VIEW_TYPE0"]');

              case 130:
                console.log("SUBMIT : Submit form..");
                _context12.next = 133;
                return _frame.click('input[name="submitButton"]', {
                  timeout: timeout,
                  waitUntil: "domcontentloaded"

                });

              case 133:
                _context12.next = 148;
                break;

              case 135:
                _context12.prev = 135;
                _context12.t6 = _context12["catch"](115);

                console.log("LOG : " + _context12.t6);
                _context12.next = 140;
                return page.$('a[href="Logout.html"]');

              case 140:
                _context12.t7 = _context12.sent;

                if (!(_context12.t7 !== null)) {
                  _context12.next = 148;
                  break;
                }

                _context12.next = 144;
                return page.click('a[href="Logout.html"]');

              case 144:
                _context12.next = 146;
                return page.waitForTimeout();

              case 146:
                console.log("LOG : Logout account from ibri");
                page.on("dialog", function () {
                  var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee8(dialog) {
                    return regeneratorRuntime.wrap(function _callee8$(_context8) {
                      while (1) {
                        switch (_context8.prev = _context8.next) {
                          case 0:
                            console.log(dialog.message());
                            _context8.next = 3;
                            return dialog.accept();

                          case 3:
                            _context8.next = 5;
                            return browser.close();

                          case 5:
                          case "end":
                            return _context8.stop();
                        }
                      }
                    }, _callee8, _this2);
                  }));

                  return function (_x9) {
                    return ref.apply(this, arguments);
                  };
                }());

              case 148:
                _context12.next = 150;
                return page.waitForTimeout({
                  timeout: timeout,
                  waitUntil: "domcontentloaded"

                });

              case 150:
                _context12.prev = 150;
                _context12.next = 153;
                return page.frames().find(function (fr) {
                  return fr.name() === "content";
                });

              case 153:
                _frame2 = _context12.sent;
                _context12.next = 156;
                return _frame2.waitForSelector("#divToPrint > div > table").then(function () {
                  return console.log("LOG : all page loaded");
                });

              case 156:
                _context12.next = 158;
                return _frame2.evaluate(function () {
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

              case 158:
                DataMutasi = _context12.sent;
                _context12.next = 161;
                return page.click("#main-page > div.headerwrap > div > div.uppernav.col-1-2 > span:nth-child(1) > a:nth-child(4) > b");

              case 161:
                _context12.next = 163;
                return page.waitForTimeout();

              case 163:
                console.log("LOG : Logout account from ibri");
                page.on("dialog", function () {
                  var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee9(dialog) {
                    return regeneratorRuntime.wrap(function _callee9$(_context9) {
                      while (1) {
                        switch (_context9.prev = _context9.next) {
                          case 0:
                            console.log(dialog.message());
                            _context9.next = 3;
                            return dialog.accept();

                          case 3:
                            _context9.next = 5;
                            return browser.close();

                          case 5:
                          case "end":
                            return _context9.stop();
                        }
                      }
                    }, _callee9, _this2);
                  }));

                  return function (_x10) {
                    return ref.apply(this, arguments);
                  };
                }());
                _context12.next = 167;
                return page.keyboard.press("Enter");

              case 167:
                _context12.next = 169;
                return page.waitForTimeout(3000);

              case 169:
                return _context12.abrupt("return", DataMutasi);

              case 172:
                _context12.prev = 172;
                _context12.t8 = _context12["catch"](150);

                console.log("LOG : " + _context12.t8);
                _context12.next = 177;
                return page.$('a[href="Logout.html"]');

              case 177:
                _context12.t9 = _context12.sent;

                if (!(_context12.t9 !== null)) {
                  _context12.next = 185;
                  break;
                }

                _context12.next = 181;
                return page.click('a[href="Logout.html"]');

              case 181:
                _context12.next = 183;
                return page.waitForTimeout();

              case 183:
                console.log("LOG : Logout account from ibri");
                page.on("dialog", function () {
                  var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee10(dialog) {
                    return regeneratorRuntime.wrap(function _callee10$(_context10) {
                      while (1) {
                        switch (_context10.prev = _context10.next) {
                          case 0:
                            console.log(dialog.message());
                            _context10.next = 3;
                            return dialog.accept();

                          case 3:
                            _context10.next = 5;
                            return browser.close();

                          case 5:
                          case "end":
                            return _context10.stop();
                        }
                      }
                    }, _callee10, _this2);
                  }));

                  return function (_x11) {
                    return ref.apply(this, arguments);
                  };
                }());

              case 185:
                return _context12.abrupt("return", _context12.t8);

              case 186:
                _context12.next = 213;
                break;

              case 188:
                _context12.next = 190;
                return page.$("#errormsg-wrap");

              case 190:
                _context12.t10 = _context12.sent;

                if (!(_context12.t10 !== null)) {
                  _context12.next = 201;
                  break;
                }

                _context12.next = 194;
                return page.evaluate(function () {
                  return document.querySelector("h2.errorresp").innerText;
                });

              case 194:
                error_msg = _context12.sent;
                err = {
                  status: "ERROR",
                  error_code: 104,
                  error_message: error_msg

                };

                console.log(err);
                _context12.next = 199;
                return browser.close();

              case 199:
                _context12.next = 213;
                break;

              case 201:
                _context12.next = 203;
                return page.$('a[href="Logout.html"]');

              case 203:
                _context12.t11 = _context12.sent;

                if (!(_context12.t11 !== null)) {
                  _context12.next = 211;
                  break;
                }

                _context12.next = 207;
                return page.click('a[href="Logout.html"]');

              case 207:
                _context12.next = 209;
                return page.waitForTimeout();

              case 209:
                console.log("LOG : Logout account from ibri");
                page.on("dialog", function () {
                  var ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee11(dialog) {
                    return regeneratorRuntime.wrap(function _callee11$(_context11) {
                      while (1) {
                        switch (_context11.prev = _context11.next) {
                          case 0:
                            console.log(dialog.message());
                            _context11.next = 3;
                            return dialog.accept();

                          case 3:
                          case "end":
                            return _context11.stop();
                        }
                      }
                    }, _callee11, _this2);
                  }));

                  return function (_x12) {
                    return ref.apply(this, arguments);
                  };
                }());

              case 211:
                _err = {
                  status: "ERROR",
                  error_code: 105,
                  error_message: "Please try again..."

                };
                return _context12.abrupt("return", _err);

              case 213:
                _context12.next = 219;
                break;

              case 215:
                _context12.prev = 215;
                _context12.t12 = _context12["catch"](3);


                console.log("LOG : cant load the page, maybe server is busy : " + _context12.t12);
                console.log(_context12.t12);

              case 219:
              case "end":
                return _context12.stop();
            }
          }
        }, _callee12, this, [[3, 215], [20, 31], [87, 99], [115, 135], [150, 172]]);
      }));

      function getBRI(_x7) {
        return ref.apply(this, arguments);
      }

      return getBRI;
    }()
  }]);

  return ScraperBank;
}();

module.exports = ScraperBank;
