# IBANKING
[![NPM](https://nodei.co/npm/mutasi-scraper.png?compact=true)](https://npmjs.org/package/mutasi-bca)


NodeJS Package for scraping statement (mutasi) in iBank indonesia

![image](https://user-images.githubusercontent.com/31664438/130382645-3763dd51-3867-48b9-b671-7cf103507904.png)



Kenapa saya modif ? karna file originalnya  adalah internet banking versi mobile dan tidak ada nilai saldo akhir pada mutasi nya


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


# License

[MIT](https://github.com/fdciabdul/BCA-Mutasi-Scraper)

# Code By
[Abdul Muttaqin](mailto:abdulmuttaqin456@gmail.com)

# CP 

abdulmuttaqin456@gmail.com