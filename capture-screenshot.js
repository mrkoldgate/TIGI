const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle0' });

    // Allow animations to run
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: '/Users/issamac/.gemini/antigravity/brain/0db29878-a55d-4656-9b48-ee53b0911b1e/verify_collapse_1.png' });

    await page.evaluate(() => window.scrollBy(0, 1080));
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: '/Users/issamac/.gemini/antigravity/brain/0db29878-a55d-4656-9b48-ee53b0911b1e/verify_collapse_2.png' });

    await page.evaluate(() => window.scrollBy(0, 1080));
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: '/Users/issamac/.gemini/antigravity/brain/0db29878-a55d-4656-9b48-ee53b0911b1e/verify_collapse_3.png' });

    await browser.close();
})();
