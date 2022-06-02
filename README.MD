# IBANKING
[![NPM](https://nodei.co/npm/mutasi-scraper.png?compact=true)](https://npmjs.org/package/mutasi-bca)


NodeJS Package for scraping statement (mutasi) in iBank indonesia


![Screenshot 2022-06-02 113138](https://user-images.githubusercontent.com/31664438/171599287-b0048798-064e-436e-8c72-c7ec43d0e29f.png)




# Mutasi-Scraper

Plugin untuk membantu anda mendapatkan informasi mutasi dari iBanking anda 

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

### BCA

```javascript

const scraper = new ScraperBank("user", "pass"); // username dan password akun ibanking
(async () => {
    var result = await scraper.getBCA("18","5","30","5");
    console.log(result);
})();
```

### BRI

```javascript

const scraper = new ScraperBank("user", "pass"); // username dan password akun ibanking
(async () => {
    var result = await scraper.getBRI("norek");
    console.log(result);
})();
```

### MANDIRI

```javascript

const scraper = new ScraperBank("user", "pass"); // username dan password akun ibanking
(async () => {
    var result = await scraper.getMandiri();
    console.log(result);
})();
```

### DANAMON

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
    headless : true , // set false jika ingin memunculkan browser
    apikey : "GOOGLE-VISION-API-KEY" // set google vision apikey disini,
    userdatadir: "fdciabdul" // folder data 
```

# License

[MIT](https://github.com/fdciabdul/BCA-Mutasi-Scraper)

# Code By
[Abdul Muttaqin](mailto:abdulmuttaqin456@gmail.com)

# CP 

abdulmuttaqin456@gmail.com
