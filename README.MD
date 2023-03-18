
# IBANKING
[![NPM](https://nodei.co/npm/mutasi-scraper.png?compact=true)](https://npmjs.org/package/mutasi-bca)


NodeJS Package for scraping settlement (mutasi) in iBank indonesia


![Screenshot 2022-06-02 113138](https://user-images.githubusercontent.com/31664438/171599287-b0048798-064e-436e-8c72-c7ec43d0e29f.png)




# Mutasi-Scraper

Library untuk membantu anda mendapatkan informasi mutasi dari iBanking anda 
banyak fungsi yang akan didapatkan jika kalian bisa mengimplementasikannya kedalam kebutuhan yang ada , semisal auto accept payment , auto transfer , auto cek , dsb

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
const  ScraperBank  = require("mutasi-scraper");
```

## Test

```bash
npm run example
```

### BCA (working)

```javascript

const scraper = new ScraperBank("user", "pass"); // username dan password akun ibanking
(async () => {
    var result = await scraper.getBCA("18","5","30","5");
    console.log(result);
})();
```

### BRI (err)

```javascript

const scraper = new ScraperBank("user", "pass"); // username dan password akun ibanking
(async () => {
    var result = await scraper.getBRI("norek");
    console.log(result);
})();
```

### MANDIRI (err)

```javascript

const scraper = new ScraperBank("user", "pass"); // username dan password akun ibanking
(async () => {
    var result = await scraper.getMandiri();
    console.log(result);
})();
```

### DANAMON (err)

```javascript

const scraper = new ScraperBank("user", "pass"); // username dan password akun ibanking
(async () => {
    var result = await scraper.getDanamon();
    console.log(result);
})();
```

### CONFIGURATION

```javascript

const scraper = new ScraperBank("user", "pass" , {
    headless : false , // set true jika ingin memunculkan browser
```

# License

[MIT](https://github.com/fdciabdul/BCA-Mutasi-Scraper)

# Code By
[Abdul Muttaqin](mailto:abdulmuttaqin456@gmail.com)

# CP 

abdulmuttaqin456@gmail.com