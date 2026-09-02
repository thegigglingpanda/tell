const { chromium } = require('playwright');

// Drives TELL with a deliberately consistent habit — work the perimeter, always
// leave north — and captures the run-end card each run. Nothing is mocked up:
// every line on these cards was generated from the bot's actual behaviour.

const goTo = (page, tx, ty) => page.evaluate(([x, y]) => {
  const p = path(Math.floor(S.px), Math.floor(S.py), x, y);
  if (p && p.length > 1) { S.path = p; S.pi = 1; }
}, [tx, ty]);

const over = page => page.locator('#over').evaluate(e => !e.classList.contains('hidden'));

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 420, height: 900 }, deviceScaleFactor: 2 });
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));

  await page.goto('file:///root/tell/index.html');
  await page.waitForTimeout(500);
  await page.click('#startbtn');
  await page.waitForTimeout(250);

  for (let run = 1; run <= 8; run++) {
    // 1. work the perimeter: the four untaken crates furthest from the centre
    const targets = await page.evaluate(() => S.crates
      .filter(c => !c.taken)
      .map(c => ({ c, d: Math.hypot(c.x - W / 2, c.y - H / 2) }))
      .sort((a, b) => b.d - a.d).slice(0, 4)
      .map(o => [o.c.x, o.c.y]));

    for (const [tx, ty] of targets) {
      if (await over(page)) break;
      await goTo(page, tx, ty);
      for (let w = 0; w < 22; w++) {
        await page.waitForTimeout(180);
        const done = await page.evaluate(() => !S.path || S.pi >= S.path.length);
        if (done || await over(page)) break;
      }
    }

    // 2. always leave through the north gate
    if (!(await over(page))) {
      const g = await page.evaluate(() => extracts[0]);
      await goTo(page, g[0], g[1]);
      for (let w = 0; w < 40; w++) {
        await page.waitForTimeout(180);
        if (await over(page)) break;
        const done = await page.evaluate(() => !S.path || S.pi >= S.path.length);
        if (done) { await goTo(page, g[0], g[1]); }
      }
    }
    if (!(await over(page))) await page.evaluate(() => { S.endReason = 'death'; endRun(); });

    await page.waitForTimeout(2100);           // let the card lines finish fading in
    const st = await page.evaluate(() => ({
      run: P.runs, know: knowledge(), traits: traits().slice(0, 3).map(t => t.s), bank
    }));
    console.log(`run ${run}: ${st.know}%  ${JSON.stringify(st.traits)}`);
    await page.locator('#over').screenshot({ path: `/root/tell/card_r${run}.png` });

    await page.click('#againbtn');
    await page.waitForTimeout(300);
  }

  console.log('errors:', errs.length ? errs : 'none');
  await browser.close();
})();
