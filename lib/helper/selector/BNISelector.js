class BNISelector {
    /**
     *  Login page Selector
    *  Author : @fdciabdul
    *  Email : taqin2731@gmail.com
    *  Web : https://imtaqin.id
    * @returns {String}
    * @memberof BNISelector
    */
    static get LOGIN_PAGE() {
      return {
        gotologin: "a#RetailUser",
        url: "https://ibank.bni.co.id/MBAWeb/FMB",
        userField: "input#CorpId",
        passField: "input#PassWord",
        submitButton: "#__AUTHENTICATE__",
      };
    }

    /**
     * Settlement Page Selector
    *  Author : @fdciabdul
    *  Email : taqin2731@gmail.com
    *  Web : https://imtaqin.id
    * @returns {String}
    * @memberof BNISelector
    */
    static get SETTLEMENT_PAGE() {
      return {
          menuList: "#MBMenuList",
          accountMenuList: "#AccountMenuList_table #AccountMenuList",
          mutasiText: "//*[contains(text(),'MUTASI')]",
          mainAccountType: "#MAIN_ACCOUNT_TYPE",
          accountIDSelectRq: "#AccountIDSelectRq",
          searchOption: "#Search_Option_6",
          txnPeriod: "#TxnPeriod",
          fullStmtInqRq: "#FullStmtInqRq",
          displayMConError: "#Display_MConError",
          tableRows: "table > tbody > tr",
          logout: "#LogOut",
          logoutConfirm: "#__LOGOUT__",
      };
  }
  
  }
  
  module.exports = BNISelector;
  