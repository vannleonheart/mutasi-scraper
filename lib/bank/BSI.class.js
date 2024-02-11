const { load } = require("cheerio");
const { spawn } = require('child_process');
const fs = require('fs');
const { BSIParser } = require("../helper/utils/Parser");
const ScraperBank = require("../BrowserClasses");
const log = require("../helper/utils/Logger");

/**
 * ScrapBSI class for scraping BSI (Bank Syariah Indonesia) data.
 * @class ScrapBSI
 * @extends ScraperBank
 */

class ScrapBSI extends ScraperBank{
    constructor(username,password,norek,useFingerprintInjector){
        super(username,password,useFingerprintInjector);
        this.norek = norek;
        this.log = log;
        this.user = username;
        this.pass = password;
    }

    /**
     * Launches the browser and navigates to a specific webpage.
     *
     * @return {Promise<void>} A promise that resolves once the navigation is complete.
     */
    async launchAndNavigate() {
        const bca = new ScraperBank();
        this.page = await bca.launchBrowser();
        await this.page.goto("https://bsinet.bankbsi.co.id/cms/index.php", {
            waitUntil: "domcontentloaded"
        });

        await this.page.click("#form > p:nth-child(3) > a");
        await this.page.waitForSelector("#name");
    }

    async passCaptcha() {
        let captchaPassed = false;
        while (!captchaPassed) {
            await this.page.type("#name", this.user);
            await this.page.type("#exampleInputPassword1", this.pass);
            await this.page.waitForSelector("#captchaimg");
            const captchaElement = await this.page.$('#captchaimg');
            if (captchaElement) {
                await captchaElement.screenshot({ path: 'captcha.png' });
            }
    
            const captchaText = await this.readCaptcha('captcha.png');
            const ocrOutputLines = captchaText.split('\n');
            const filteredTextLines = ocrOutputLines
                .map(line => {
                    const match = line.match(/\[\[\[.*?\]\], \('(.+?)', (\d.\d+)\)\]/);
                    return match && match[1] && match[2] ? match[1] : '';
                })
                .filter(text => text.length > 0 && !text.startsWith('Tulis nama') && !text.includes('You typed'));
    
            const captchaResult = filteredTextLines.join(' ');
            console.log(`Captcha Text: ${captchaResult}`);
            await this.page.type("#capcha", captchaResult);  // This line was missing
            await this.page.click("#mysubmit");
            await this.page.waitForNavigation({ waitUntil: 'networkidle0' });
          
            captchaPassed = await this.checkCaptchaPassed();
      
        }
        await this.page.waitForSelector("body > div.side-nav");
        (await this.page.$x("//li/a/span[contains(text(), 'Mutasi Rekening')]"))[0]?.click();
        await this.page.waitForSelector("#MY_ACC");
        await this.page.select('#MY_ACC', this.norek);
    }
    
    

    async checkCaptchaPassed() {
        try {
            await this.page.waitForSelector(".custom-alert", { timeout: 2000 });
            console.log("Captcha Failed, retrying...");
            await this.page.click("#form > p > input");
            return false;
        } catch (error) {
            console.log("Captcha Passed");
            return true;
        }
    }

    async getStatement(startDate, endDate) 
   {
        await this.launchAndNavigate();
        await this.passCaptcha();
        await this.page.waitForSelector('#DATE_FROM');
        await this.page.waitForSelector('#DATE_UNTIL');

        await this.page.evaluate((startDate, endDate) => {
            document.querySelector('#DATE_FROM').value = startDate;
            document.querySelector('#DATE_UNTIL').value = endDate;
        }, startDate, endDate);
    
        await this.page.click("#mysubmit");
        await this.page.waitForSelector("#form > div.table.table-show.table-0");
        const content = await this.page.content();
        fs.writeFileSync('mutasi.html', content, 'utf-8');
        const result = new BSIParser().parse(content);
        return result;
    }

    async closeBrowser() {
        await this.page.browser().close();
    }

     async readCaptcha(imagePath) {
        return new Promise((resolve, reject) => {
            const ocr = spawn('paddleocr', ['--image_dir', imagePath, '--use_angle_cls', 'true', '--lang', 'en', '--use_gpu', 'true']);
            let result = '';
    
            ocr.stdout.on('data', (data) => {
                result += data.toString();
            });
    
            ocr.stderr.on('data', (data) => {
                console.error(`stderr: ${data}`);
            });
    
            ocr.on('close', (code) => {
                if (code === 0) {
                    resolve(result);
                } else {
                    reject('An error occurred while reading the captcha.');
                }
            });
        });
    }
    
}

module.exports = ScrapBSI;