

# IBANKING
[![NPM](https://nodei.co/npm/mutasi-scraper.png?compact=true)](https://npmjs.org/package/mutasi-scraper) 

[![All Contributors](https://img.shields.io/github/all-contributors/fdciabdul/mutasi-scraper?color=ee8449&style=flat-square)](#contributors)

NodeJS Package for scraping settlement (mutasi) in iBank indonesia

![Screenshot 2022-06-02 113138](https://github.com/fdciabdul/mutasi-scraper/assets/31664438/2dca4544-f1b6-46fd-9daa-bd97114bf203)


# Mutasi Scraper

  Silahkan memberikan Star (⭐) pada repo ini jika anda menyukai ini 
 atau beri dukungan untuk project ini [dukungan](#dukungan)

Library untuk membantu anda mendapatkan informasi mutasi dari iBanking anda 
banyak fungsi yang akan didapatkan jika kalian bisa mengimplementasikannya kedalam kebutuhan yang ada , semisal auto accept payment , auto transfer , auto cek , dsb

# Pre requirements

 - Windows / Linux
 - Nodejs 16+
 - Google chrome

## Cara Install

```bash
npm install --save mutasi-scraper
```

atau

```bash
npm install https://github.com/fdciabdul/mutasi-Scraper
```


## Penggunaan

```javascript
const {ScrapBCA} = require('mutasi-scraper');
```

Fungsi untuk Scraping bank dipisah dari setiap bank , kalian bisa cek apa saja bank yang work untuk di scrap 
disini [Index File](https://github.com/fdciabdul/mutasi-scraper/blob/main/index.js)

## Test

```bash
npm run example
```
## List 
| Bank Name | Status |
| --- | --- | 
|BCA| ✅|
|BNI|✅|
|Mandiri Cash Management|✅|
|newBiz BRI|✅|
| BNI Direct |✅|


# Example

## BCA

```javascript

const {ScrapBCA} = require('mutasi-scraper');

const user = 'USER';
const pass = 'PASS';

const scraper = new ScrapBCA(user, pass, {
  headless: false, // true if needed
  args: [
    '--log-level=3', 
    '--no-default-browser-check',
    '--disable-infobars',
    '--disable-web-security',
    '--disable-site-isolation-trials',
  ],
 // executablePath: 'google-chrome', path google chrome  (uncomment line ini jika tidak diperlukan)  tapi direkomendasikan menggunakan google chrome 
});
  const tglawal = "1 "; // tanggal 1
  const blnawal = "4"; // bulan 4
  const tglakhir = "30"; //ke tanggal 30
  const blnakhir = "4 "; // bulan 4

  var result = await scraper.getStatement(tglawal, blnawal, tglakhir, blnakhir);
  console.log(result);
```

## BNI

```javascript
const {ScrapBBNI} = require('mutasi-scraper');
const user = 'USER';
const pass = 'PASS';
const scraper = new ScrapBCA(user, pass, {
  headless: false, // true if needed
  args: [
    '--log-level=3', 
    '--no-default-browser-check',
    '--disable-infobars',
    '--disable-web-security',
    '--disable-site-isolation-trials',
  ],
 // executablePath: 'google-chrome', path google chrome  (uncomment line ini jika tidak diperlukan)  tapi direkomendasikan menggunakan google chrome 
});

  var result = await scraper.getStatement();
  console.log(result);
```

## BRI

```javascript

const ScrapBRI = require("./lib/bank/BRI.js");

(async () => {
    const bca = new ScrapBRI("corpID", "userID","password","nomor rekening","wit.ai apikey");
    const result = await bca.getStatement();
    console.log(result);
})();
```
## Mandiri Cash Management

```javascript

const ScrapBRI = require("./lib/bank/BRI.js");

(async () => {
    const mandiri = new ScrapMCM("corpID", "userID","password","nomor rekening");
    const res = await mandiri.getStatement();
    console.log(res)
})();
```


### NOTE 

guys karna saya tidak punya akun ibanking dari beberapa bank yang error , jika kalian ingin bank lain ditambahkan atau di fix silahkan email saya :)

## Contributors

<!-- readme: contributors -start -->
<!-- readme: contributors -end -->
### All Supporter 

| Donor's Image                                      |Date       |
|---------------------------------------------------|--------------|
| ![Regerta](https://avatars.githubusercontent.com/u/19641375?s=96&v=4) | Regerta     | 



# License

[GPL-3.0 license](https://github.com/fdciabdul/mutasi-scraper/blob/main/LICENSE)

# Code By
 Abdul Muttaqin
# CP 
taqin2731@gmail.com



