class BNISelector {

    static get LOGIN_PAGE():any {
      return {
        gotologin: "a#RetailUser",
        url: "https://ibank.bni.co.id/MBAWeb/FMB",
        userField: "input#CorpId",
        passField: "input#PassWord",
        submitButton: "#__AUTHENTICATE__",
      };
    }

    static get SETTLEMENT_PAGE():any {
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
  
export default BNISelector;
  