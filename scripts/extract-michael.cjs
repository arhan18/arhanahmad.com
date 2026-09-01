const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '../docs/design-references/michael-lock/root');

async function extract() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('Navigating to michael-lock.com...');
  await page.goto('https://michael-lock.com', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);

  // Screenshot
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'desktop-full.png'), fullPage: true });
  console.log('Screenshot saved');

  // Extract all CSS values
  const cssData = await page.evaluate(() => {
    const data = {
      body: {},
      cards: [],
      buttons: [],
      fonts: [],
      colors: new Set(),
      hero: {},
      nav: {},
      marquee: {},
      grid: {}
    };

    // Body styles
    const bodyStyle = getComputedStyle(document.body);
    data.body = {
      fontFamily: bodyStyle.fontFamily,
      fontSize: bodyStyle.fontSize,
      lineHeight: bodyStyle.lineHeight,
      color: bodyStyle.color,
      backgroundColor: bodyStyle.backgroundColor
    };

    // Extract fonts from link tags
    document.querySelectorAll('link[href*="fonts"]').forEach(link => {
      data.fonts.push(link.href);
    });

    // Extract all unique colors
    document.querySelectorAll('*').forEach(el => {
      const style = getComputedStyle(el);
      if (style.color && style.color !== 'rgba(0, 0, 0, 0)') data.colors.add(style.color);
      if (style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)') data.colors.add(style.backgroundColor);
      if (style.borderColor && style.borderColor !== 'rgba(0, 0, 0, 0)') data.colors.add(style.borderColor);
    });

    // Hero section
    const hero = document.querySelector('section') || document.querySelector('main > div');
    if (hero) {
      const heroStyle = getComputedStyle(hero);
      data.hero = {
        classes: hero.className,
        padding: heroStyle.padding,
        gap: heroStyle.gap,
        display: heroStyle.display
      };
    }

    // Navigation
    const nav = document.querySelector('nav');
    if (nav) {
      const navStyle = getComputedStyle(nav);
      data.nav = {
        classes: nav.className,
        height: navStyle.height,
        padding: navStyle.padding,
        position: navStyle.position,
        backgroundColor: navStyle.backgroundColor,
        backdropFilter: navStyle.backdropFilter
      };
    }

    // Cards (bento grid items)
    document.querySelectorAll('[class*="card"], [class*="bento"], [class*="grid"] > div').forEach((card, i) => {
      if (i > 20) return;
      const style = getComputedStyle(card);
      data.cards.push({
        index: i,
        classes: card.className,
        borderRadius: style.borderRadius,
        padding: style.padding,
        backgroundColor: style.backgroundColor,
        border: style.border,
        boxShadow: style.boxShadow,
        transition: style.transition,
        transform: style.transform,
        width: style.width,
        height: style.height,
        display: style.display,
        flexDirection: style.flexDirection,
        gap: style.gap
      });
    });

    // Buttons
    document.querySelectorAll('button, a[class*="button"], a[class*="cta"]').forEach((btn, i) => {
      if (i > 10) return;
      const style = getComputedStyle(btn);
      data.buttons.push({
        index: i,
        classes: btn.className,
        text: btn.textContent?.trim().substring(0, 50),
        borderRadius: style.borderRadius,
        padding: style.padding,
        backgroundColor: style.backgroundColor,
        color: style.color,
        border: style.border,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        transition: style.transition
      });
    });

    // Marquee
    const marquee = document.querySelector('[class*="marquee"], [class*="scroll"]');
    if (marquee) {
      const style = getComputedStyle(marquee);
      data.marquee = {
        classes: marquee.className,
        overflow: style.overflow,
        display: style.display,
        animation: style.animation
      };
    }

    // Grid layout
    const grid = document.querySelector('[class*="grid"]');
    if (grid) {
      const style = getComputedStyle(grid);
      data.grid = {
        classes: grid.className,
        display: style.display,
        gridTemplateColumns: style.gridTemplateColumns,
        gap: style.gap,
        maxWidth: style.maxWidth,
        margin: style.margin,
        padding: style.padding
      };
    }

    data.colors = [...data.colors];
    return data;
  });

  fs.writeFileSync(path.join(OUTPUT_DIR, 'css-extraction.json'), JSON.stringify(cssData, null, 2));
  console.log('CSS extraction saved');

  // Mobile screenshot
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'mobile-full.png'), fullPage: true });
  console.log('Mobile screenshot saved');

  await browser.close();
  console.log('Done!');
}

extract().catch(console.error);
