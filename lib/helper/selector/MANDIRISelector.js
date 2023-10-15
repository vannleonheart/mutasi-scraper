class MANDIRISelector {
  static get LOGIN_PAGE() {
    return {
      url: "https://mcm2.bankmandiri.co.id/corporate/",
      userInput:  "#content > div > ng-include > div > div > div.col-md-4.col-sm-5 > div > form > div:nth-child(2) > div > div > input",
      passInput: "#content > div > ng-include > div > div > div.col-md-4.col-sm-5 > div > form > div.form-group.clearfix > div > div > input",
      corpIdInput: "#content > div > ng-include > div > div > div.col-md-4.col-sm-5 > div > form > div:nth-child(1) > div > div > input",
      submitButton: "#content > div > ng-include > div > div > div.col-md-4.col-sm-5 > div > form > button",
      error_message : "//div[contains(@class, 'alert-danger') and contains(., 'User still login')]"
    };
  }

  static get DASHBOARD_PAGE(){
    return {
        navbar : '//a[contains(text(), "Accounts")]',
        statementLink : '//span[contains(text(), "Account Statement")]'
    }
}
   
static get STATEMENT_PAGE(){
    return {
        dropdown : '#content > ng-include:nth-child(2) > div.container.custom-container.ng-scope > div > section.no-print > div.content.p_20 > ng-include:nth-child(2) > form > div:nth-child(1) > div > div > div > a > span.select2-chosen.ng-binding',
        statement_day : 'select[name="postingDate"].form-control',
        norek : '//span[contains(text()',
        submit_statement : '#content > ng-include:nth-child(2) > div.container.custom-container.ng-scope > div > section.no-print > div.content.p_20 > ng-include:nth-child(2) > form > div:nth-child(4) > div > div > button:nth-child(1)',
        nav_log : '#content > ng-include:nth-child(2) > div.container.custom-container.ng-scope > div > section:nth-child(2) > section.content.p_20 > form:nth-child(1) > div:nth-child(1) > div > button',

    }
}
static get LOGOUT_PAGE(){
 return {
    button_logout : '#header > header > div.navbar.navbar-static-top > div > ul > li.nav-logout > button',
    comfirm_logout : ''
 }
}

}

module.exports = MANDIRISelector;
