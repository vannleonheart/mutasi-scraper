const { load } = require("cheerio");
const NameExtractor = require("./getName")


/**
 * Description
 * @param {string} html
 * @param {string} selectors
 * @returns {Array}
 */
class BCAParser {
    constructor(html, selectors) {
        this.$ = load(html);
        this.selectors = selectors;
    }

    parse() {
        let accountNo = this.$(this.selectors.accountNoField).parent().next().next().text().trim();
        let name = this.$(this.selectors.nameField).parent().next().next().text().trim();
        let periode = this.$(this.selectors.periodeField).parent().next().next().text().trim();
        let mataUang = this.$(this.selectors.mataUangField).parent().next().next().text().trim();

        let transactions = [];
        this.$(this.selectors.transactionsTable).find('tr').each((i, elem) => {
            let tanggal = this.$(elem).find('td:nth-child(1)').text().trim();
            if (tanggal === 'PEND') {
                tanggal = periode.split('-')[0].trim();
            }

            let keterangan = this.$(elem).find('td:nth-child(2)').text().trim();
            keterangan = keterangan.replace(/\s+/g, ' ');
            let nama = NameExtractor.extractBCAMutationName(keterangan)

            let cab = this.$(elem).find('td:nth-child(3)').text().trim();
            let mutasi = this.$(elem).find('td:nth-child(4)').text().trim();
            let saldoakhir = this.$(elem).find('td:nth-child(6)').text().trim();

            transactions.push({tanggal, keterangan, nama, cab, mutasi, saldoakhir});
        });

        if (transactions[0].date === 'Tgl.') {
            transactions.shift();
        }

        let settlement = {};
        this.$(this.selectors.settlementTable).find('tr').each((i, elem) => {
            let item = this.$(elem).find('td:nth-child(1)').text().trim();
            let value = this.$(elem).find('td:nth-child(3)').text().trim();
            if (item !== '') {
                settlement[item] = value;
            }
        });

        return {accountNo, name, periode, mataUang, transactions, settlement};
    }
}


module.exports = BCAParser;