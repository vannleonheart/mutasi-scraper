declare module 'puppeteer-recaptcha-bypass' {
    // Define the module's exports here. For example:
    function RecaptchaSolver(page: any, apiKey: string): Promise<void>;
  
    export = RecaptchaSolver;
  }