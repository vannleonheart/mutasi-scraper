const ScraperBank = require("./lib/module.scraper.class.js");
const scraper = new ScraperBank("devi0572", "145678" , {
    headless : false
}); // username dan password akun ibanking
(async () => {
    var result = await scraper.getBCA("11","3","16","3");
    console.log(result);
})();