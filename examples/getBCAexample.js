const ScraperBank = require("../lib/scraper.class");

module.exports = async function (app) {
  app.get("/", function (req, res) {
 
  });

  app.post("/check/:bank", async function (req, res) {
    const scraper = new ScraperBank(req.body.username, req.body.password);
    switch (req.params.bank) {
      case "bri":
        var result = await scraper.getBRI(req.body.norek);
        res.json(result);
        break;
      case "bca":
        var result = await scraper.getBCA(
          req.body.tglawal,
          req.body.blnawal,
          req.body.tglakhir,
          req.body.blnakhir
        );
        res.json(result);
        break;
      case "bni":
        var result = await scraper.getBNI();
        res.json(result);
        break;
      case "danamon":
        var result = await scraper.getDanamon();
        res.json(result);
        break;
      case "mandiri":
        var result = await scraper.getBNI();
        res.json(result);
        break;
      default:
        break;
    }
  });
};
