const { load } = require("cheerio");
const NameExtractor = require("./getName")


/**
 * Description
 * @param {string} html
 * @param {string} selectors
 * @returns {Array}
 * @memberof utils
 */
class BCAParser {
    constructor(html, selectors) {
        this.$ = load(html);
        this.selectors = selectors;
    }

    /**
     * Parses raw BCA data.
     * @param {Array} data - Raw data to be parsed.
     * @returns {Array} - Parsed data.
     */
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
            let mutasi = this.$(elem).find('td:nth-child(5)').text().trim();
            let nominal = this.$(elem).find('td:nth-child(4)').text().trim();
            let saldoakhir = this.$(elem).find('td:nth-child(6)').text().trim();
            if(tanggal === "Tgl."){
            }else if(tanggal === "Date"){

            }else{
                transactions.push({tanggal, keterangan, nama, cab, mutasi, nominal,saldoakhir});
            }
        });



        let settlement = {};
        this.$(this.selectors.settlementTable).find('tr').each((i, elem) => {
            let item = this.$(elem).find('td:nth-child(1)').text().trim();
            let value = this.$(elem).find('td:nth-child(3)').text().trim();
            if (item !== '') {
                settlement[item] = value;
            }
        });

        return { data: [{accountNo, name, periode, mataUang}], 
            mutasi: transactions};
    }
}

class BNIParser{
    /**
     * Parses raw BNI data.
     * @param {Array} data - Raw data to be parsed.
     * @returns {Array} - Parsed data.
     */
    parse(data) {
        const arrayFilter = data.map(item => item.filter(el => el !== "-")).filter(filtered => filtered.length > 0);

        const arr = arrayFilter.slice(6, -7).map(entry => {
            const [tanggal, , , keterangan, , , , , , mutasi, , nominal, , , , , saldoakhir] = entry;
            const mutasiType = (mutasi === "Cr") ? "CR" : ((mutasi === "Db") ? "DB" : undefined);
            const name = NameExtractor.extractBNIMutationName(keterangan);

            return {
                tanggal,
                keterangan,
                mutasi: mutasiType,
                nominal,
                saldoakhir,
                nama: name
            };
        });

        return arr;
    }
}


module.exports = {
    BNIParser,
    BCAParser
};