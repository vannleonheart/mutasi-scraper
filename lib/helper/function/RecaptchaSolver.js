const axios = require('axios');

function rdn(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

async function RecaptchaSolver(page, apiKey) {
  try {
    await page.waitForFunction(() => {
      const iframe = document.querySelector('iframe[src*="api2/anchor"]');
      return iframe && !!iframe.contentWindow.document.querySelector('#recaptcha-anchor');
    });

    let frames = await page.frames();
    const recaptchaFrame = frames.find(frame => frame.url().includes('api2/anchor'));

    const checkbox = await recaptchaFrame.$('#recaptcha-anchor');
    await checkbox.click({ delay: rdn(30, 150) });

    await page.waitForFunction(() => {
      const iframe = document.querySelector('iframe[src*="api2/bframe"]');
      const img = iframe?.contentWindow.document.querySelector('.rc-image-tile-wrapper img');
      return img && img.complete;
    }, { timeout: 5000 });

    frames = await page.frames();
    const imageFrame = frames.find(frame => frame.url().includes('api2/bframe'));
    const audioButton = await imageFrame.$('#recaptcha-audio-button');
    await audioButton.click({ delay: rdn(30, 150) });

    while (true) {
      try {
        await page.waitForFunction(() => {
          const iframe = document.querySelector('iframe[src*="api2/bframe"]');
          return !!iframe.contentWindow.document.querySelector('.rc-audiochallenge-tdownload-link');
        }, { timeout: 5000 });
      } catch (e) {
        console.error(e);
        continue;
      }

      const audioLink = await page.evaluate(() => {
        const iframe = document.querySelector('iframe[src*="api2/bframe"]');
        return iframe.contentWindow.document.querySelector('#audio-source').src;
      });

      const audioBytes = await page.evaluate(audioLink => {
        return (async () => {
          const response = await window.fetch(audioLink);
          const buffer = await response.arrayBuffer();
          return Array.from(new Uint8Array(buffer));
        })();
      }, audioLink);

      const response = await axios.post('https://api.wit.ai/speech?v=20220622', new Uint8Array(audioBytes), {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'audio/mpeg3'
        }
      });

      let audioTranscript = null;
      try {
        audioTranscript = [...response.data.matchAll(/"text": "(.*?)",/g)].pop()?.[1];
      } catch (e) {
        const reloadButton = await imageFrame.$('#recaptcha-reload-button');
        await reloadButton.click({ delay: rdn(30, 150) });
        continue;
      }

      const input = await imageFrame.$('#audio-response');
      await input.click({ delay: rdn(30, 150) });
      await input.type(audioTranscript, { delay: rdn(30, 75) });

      const verifyButton = await imageFrame.$('#recaptcha-verify-button');
      await verifyButton.click({ delay: rdn(30, 150) });

      try {
        await page.waitForFunction(() => {
          const iframe = document.querySelector('iframe[src*="api2/anchor"]');
          return iframe && !!iframe.contentWindow.document.querySelector('#recaptcha-anchor[aria-checked="true"]');
        }, { timeout: 5000 });

        return page.evaluate(() => document.getElementById('g-recaptcha-response').value);
      } catch (e) {
        console.error(e);
        continue;
      }
    }
  } catch (e) {
    console.error(e);
  }
}

module.exports = RecaptchaSolver;
