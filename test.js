const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 420, height: 860 } });
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });

  await page.goto('file:///root/tell/index.html');
  await page.waitForTimeout(400);
  await page.click('#startbtn');
  await page.waitForTimeout(300);

  const box = await page.locator('canvas').boundingBox();
  const ended = () => page.locator('#over').evaluate(e => !e.classList.contains('hidden'));

  for (let run = 0; run < 4; run++) {
    for (let i = 0; i < 12; i++) {
      if (await ended()) break;
      await page.mouse.click(
        box.x + box.width * (0.15 + Math.random() * 0.7),
        box.y + box.height * (0.15 + Math.random() * 0.7));
      await page.waitForTimeout(650);
    }
    // habit: always head for the north gate
    for (let i = 0; i < 5; i++) {
      if (await ended()) break;
      await page.mouse.click(box.x + box.width * 0.5, box.y + box.height * 0.03);
      await page.waitForTimeout(1100);
    }
    const st = await page.evaluate(() => ({
      run: P.runs, d: P.deaths, x: P.extractions, know: knowledge(),
      traits: traits().map(t => t.s), bank
    }));
    console.log(`run ${run + 1}:`, JSON.stringify(st));
    if (!(await ended())) await page.evaluate(() => { S.endReason = 'death'; endRun(); });
    await page.waitForTimeout(1800);
    if (run === 1) await page.screenshot({ path: '/root/tell/card.png' });
    await page.click('#againbtn');
    await page.waitForTimeout(300);
  }

  // toast paths
  await page.evaluate(() => toast('nothing to bank — go and get something'));
  await page.waitForTimeout(400);
  await page.screenshot({ path: '/root/tell/toast.png' });

  const fps = await page.evaluate(() => new Promise(r => {
    let n = 0; const t0 = performance.now();
    (function f() { n++; performance.now() - t0 < 1000 ? requestAnimationFrame(f) : r(n); })();
  }));
  console.log('FPS ~', fps, '| ERRORS:', errs.length ? errs : 'none');
  await browser.close();
})();
