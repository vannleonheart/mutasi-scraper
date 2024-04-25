class BRISelectors {
    static get LOGIN_PAGE() {
      return {
        url: "https://newbiz.bri.co.id/accountinformation",
        corpID: "#corpid",
        userID: "#userid",
        passwordField: "#password",
        submitButton: "#btn-submit",
        debitAccountView: "span#select2-debitaccountview-container",
        selectResultsOptions: "ul.select2-results__options > li",
        periodeView: "#periodeview",
        applyDateButton:
          "body > div:nth-child(45) > div.drp-buttons > button.applyBtn.btn.btn-sm.btn-primary",
        submitViewButton: "#btnSubmitView",
        tokenInput: 'input[name="_token"]',
      };
    }
  }
  
 export default BRISelectors