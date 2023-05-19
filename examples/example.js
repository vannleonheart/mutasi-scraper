// promisifying readline
const readline = require('readline');
const {ScrapBCA} = require("../");
const { promisify } = require('util');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
rl.question[promisify.custom] = (question) => {
  return new Promise(resolve => {
    rl.question(question, resolve);
  });
};
const questionAsync = promisify(rl.question).bind(rl);

(async () => {
  const username = await questionAsync("BCA Username: ");
  const password = await questionAsync("BCA Password: ");
  const tglawal = await questionAsync("Tanggal awal: ");
  const blnawal = await questionAsync("Bulan awal: ");
  const tglakhir = await questionAsync("Tanggal akhir: ");
  const blnakhir = await questionAsync("Bulan akhir: ");

  const scraper = new ScrapBCA(username, password , {
    headless : false
  });

  var result = await scraper.getSettlement(tglawal, blnawal, tglakhir, blnakhir);
  console.log(result);

  // close readline interface
  rl.close();
})();
