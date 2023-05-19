class BCASelectors {
    static get LOGIN_PAGE() {
      return {
        url: "https://ibank.klikbca.com/",
        userField: "#user_id",
        passField: "#pswd",
        submitButton: "input[value='LOGIN']",
      };
    }
  
    /**
     * SELECTOR FOR SETTLEMENT PAGE
     * @date 2023-04-17
     * @returns {Array}
     */
    static get SETTLEMENT_PAGE() {
      return {
        url: "https://ibank.klikbca.com/nav_bar_indo/account_information_menu.htm",
        settlementLink: "tr:nth-child(2) a",
        startDateField: "#startDt",
        startMonthField: "#startMt",
        endDateField: "#endDt",
        endMonthField: "#endMt",
        submitButton:
          "table:nth-child(4) > tbody > tr > td > input:nth-child(1)",
        settlementTable: 'table[bordercolor="#ffffff"] tr',
      };
    }
  
    /**
     * SELECTOR FOR SETTLEMENT TABLE
     * @returns {Array}
     */
    static get PARSING_FIELD() {
      return {
          accountNoField: 'font:contains("Nomor Rekening")',
          nameField: 'font:contains("Nama")',
          periodeField: 'font:contains("Periode")',
          mataUangField: 'font:contains("Mata Uang")',
          transactionsTable: 'table[border="1"]',
          settlementTable: 'table[border="0"][width="70%"]',
      }
  }
  /**
     * url LOGOUT
     * @returns {String}
     */
    static get LOGOUT_PAGE() {
      return {
        url:
          "https://ibank.klikbca.com/authentication.do?value(actions)=logout",
      };
    }
  }
  
  module.exports = BCASelectors;
  