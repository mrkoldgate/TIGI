const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle0' });
    const rects = await page.evaluate(() => {
        const sections = Array.from(document.querySelectorAll('section'));
        return sections.map((s, i) => {
            const r = s.getBoundingClientRect();
            // also get the rect of the inner auto container
            const inner = s.querySelector('.max-w-7xl, .max-w-none');
            const innerRect = inner ? inner.getBoundingClientRect() : null;
            return {
                index: i,
                className: s.className,
                top: r.top,
                bottom: r.bottom,
                height: r.height,
                innerWidth: innerRect ? innerRect.width : 0,
                innerHeight: innerRect ? innerRect.height : 0
            };
        });
    });
    console.log(JSON.stringify(rects, null, 2));
    await browser.close();
})();
