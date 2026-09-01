const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUTPUT_DIR = path.join(__dirname, '../docs/design-references/michael-lock/root');

async function extractAll() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  console.log('1. Navigating to michael-lock.com...');
  await page.goto('https://michael-lock.com', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(3000);

  // Screenshot desktop
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'desktop-full.png'), fullPage: true });
  console.log('   Desktop screenshot saved');

  // 2. Extract FULL DOM tree
  console.log('2. Extracting DOM tree...');
  const domTree = await page.evaluate(() => {
    function walk(el, depth) {
      if (depth > 6) return null;
      const cs = getComputedStyle(el);
      const children = [...el.children];
      const text = el.childNodes.length === 1 && el.childNodes[0].nodeType === 3
        ? el.textContent.trim().slice(0, 300) : null;
      
      return {
        tag: el.tagName.toLowerCase(),
        id: el.id || undefined,
        classes: el.className?.toString() || undefined,
        text: text || undefined,
        attrs: Object.fromEntries(
          [...el.attributes].filter(a => !['class','id','style'].includes(a.name))
            .map(a => [a.name, a.value])
        ),
        styles: {
          display: cs.display,
          position: cs.position,
          flexDirection: cs.flexDirection,
          justifyContent: cs.justifyContent,
          alignItems: cs.alignItems,
          gap: cs.gap,
          gridTemplateColumns: cs.gridTemplateColumns !== 'none' ? cs.gridTemplateColumns : undefined,
          padding: cs.padding !== '0px' ? cs.padding : undefined,
          margin: cs.margin !== '0px' ? cs.margin : undefined,
          width: cs.width,
          height: cs.height,
          maxWidth: cs.maxWidth !== 'none' ? cs.maxWidth : undefined,
          borderRadius: cs.borderRadius !== '0px' ? cs.borderRadius : undefined,
          border: cs.border !== '0px none rgb(0, 0, 0)' ? cs.border : undefined,
          backgroundColor: cs.backgroundColor !== 'rgba(0, 0, 0, 0)' ? cs.backgroundColor : undefined,
          color: cs.color,
          fontSize: cs.fontSize,
          fontWeight: cs.fontWeight,
          fontFamily: cs.fontFamily,
          lineHeight: cs.lineHeight,
          letterSpacing: cs.letterSpacing,
          opacity: cs.opacity !== '1' ? cs.opacity : undefined,
          transform: cs.transform !== 'none' ? cs.transform : undefined,
          transition: cs.transition !== 'all 0s ease 0s' ? cs.transition : undefined,
          overflow: cs.overflow !== 'visible' ? cs.overflow : undefined,
          boxShadow: cs.boxShadow !== 'none' ? cs.boxShadow : undefined,
          backdropFilter: cs.backdropFilter !== 'none' ? cs.backdropFilter : undefined,
          zIndex: cs.zIndex !== 'auto' ? cs.zIndex : undefined,
          cursor: cs.cursor !== 'auto' ? cs.cursor : undefined,
          maskImage: cs.maskImage !== 'none' ? cs.maskImage : undefined,
          WebkitMaskImage: cs.WebkitMaskImage !== 'none' ? cs.WebkitMaskImage : undefined,
        },
        images: el.tagName === 'IMG' ? { src: el.src, alt: el.alt, width: el.naturalWidth, height: el.naturalHeight } : undefined,
        childCount: children.length,
        children: children.slice(0, 30).map(c => walk(c, depth + 1)).filter(Boolean)
      };
    }
    return walk(document.body, 0);
  });
  fs.writeFileSync(path.join(OUTPUT_DIR, 'dom-tree.json'), JSON.stringify(domTree, null, 2));
  console.log('   DOM tree saved');

  // 3. Extract ALL unique CSS values from key elements
  console.log('3. Extracting CSS tokens...');
  const cssTokens = await page.evaluate(() => {
    const tokens = { colors: new Set(), fonts: new Set(), sizes: new Set(), spacings: new Set() };
    document.querySelectorAll('*').forEach(el => {
      const cs = getComputedStyle(el);
      if (cs.color) tokens.colors.add(cs.color);
      if (cs.backgroundColor && cs.backgroundColor !== 'rgba(0, 0, 0, 0)') tokens.colors.add(cs.backgroundColor);
      if (cs.borderColor && cs.borderColor !== 'rgb(0, 0, 0)') tokens.colors.add(cs.borderColor);
      tokens.fonts.add(cs.fontFamily);
      if (cs.fontSize) tokens.sizes.add(cs.fontSize);
    });
    return {
      colors: [...tokens.colors],
      fonts: [...tokens.fonts],
      sizes: [...tokens.sizes]
    };
  });
  fs.writeFileSync(path.join(OUTPUT_DIR, 'css-tokens.json'), JSON.stringify(cssTokens, null, 2));
  console.log('   CSS tokens saved');

  // 4. Extract ALL text content
  console.log('4. Extracting text content...');
  const textContent = await page.evaluate(() => {
    const texts = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    let node;
    while (node = walker.nextNode()) {
      const text = node.textContent.trim();
      if (text && text.length > 1) {
        const parent = node.parentElement;
        const cs = parent ? getComputedStyle(parent) : null;
        texts.push({
          text: text.slice(0, 500),
          tag: parent?.tagName?.toLowerCase(),
          classes: parent?.className?.toString()?.split(' ').slice(0, 5).join(' '),
          fontSize: cs?.fontSize,
          fontWeight: cs?.fontWeight,
          color: cs?.color,
          href: parent?.tagName === 'A' ? parent.href : undefined
        });
      }
    }
    return texts;
  });
  fs.writeFileSync(path.join(OUTPUT_DIR, 'text-content.json'), JSON.stringify(textContent, null, 2));
  console.log('   Text content saved');

  // 5. Extract ALL images and assets
  console.log('5. Extracting assets...');
  const assets = await page.evaluate(() => {
    const imgs = [...document.querySelectorAll('img')].map(img => ({
      src: img.src,
      alt: img.alt,
      width: img.naturalWidth,
      height: img.naturalHeight,
      loading: img.loading,
      parentClasses: img.parentElement?.className?.toString()?.split(' ').slice(0, 5).join(' ')
    }));
    const svgs = [...document.querySelectorAll('svg')].map((svg, i) => ({
      index: i,
      viewBox: svg.getAttribute('viewBox'),
      classes: svg.className?.baseVal || svg.className?.toString(),
      parentClasses: svg.parentElement?.className?.toString()?.split(' ').slice(0, 3).join(' '),
      innerHTML: svg.outerHTML.slice(0, 500)
    }));
    const videos = [...document.querySelectorAll('video')].map(v => ({
      src: v.src || v.querySelector('source')?.src,
      poster: v.poster,
      autoplay: v.autoplay,
      loop: v.loop
    }));
    return { images: imgs, svgs: svgs.slice(0, 50), videos };
  });
  fs.writeFileSync(path.join(OUTPUT_DIR, 'assets.json'), JSON.stringify(assets, null, 2));
  console.log('   Assets saved');

  // 6. Extract animation keyframes and transitions
  console.log('6. Extracting animations...');
  const animations = await page.evaluate(() => {
    const sheets = [...document.styleSheets];
    const keyframes = [];
    const transitions = [];
    
    sheets.forEach(sheet => {
      try {
        [...sheet.cssRules].forEach(rule => {
          if (rule.type === CSSRule.KEYFRAMES_RULE) {
            keyframes.push({
              name: rule.name,
              steps: [...rule.cssRules].map(r => ({
                keyText: r.keyText,
                cssText: r.cssText
              }))
            });
          }
        });
      } catch(e) {}
    });

    document.querySelectorAll('*').forEach(el => {
      const cs = getComputedStyle(el);
      if (cs.animation && cs.animation !== 'none') {
        transitions.push({
          element: el.tagName + '.' + (el.className?.toString()?.split(' ')[0] || ''),
          animation: cs.animation,
          animationName: cs.animationName,
          animationDuration: cs.animationDuration,
          animationTimingFunction: cs.animationTimingFunction,
          animationIterationCount: cs.animationIterationCount
        });
      }
    });

    return { keyframes, transitions: transitions.slice(0, 30) };
  });
  fs.writeFileSync(path.join(OUTPUT_DIR, 'animations.json'), JSON.stringify(animations, null, 2));
  console.log('   Animations saved');

  // 7. Extract computed styles for specific key elements
  console.log('7. Extracting key element styles...');
  const keyStyles = await page.evaluate(() => {
    const selectors = [
      'nav', 'header', 'main', 'footer',
      '[class*="bento"]', '[class*="card"]', '[class*="grid"]',
      '[class*="marquee"]', '[class*="scroll"]',
      '[class*="avatar"]', '[class*="badge"]',
      '[class*="button"]', '[class*="cta"]',
      'h1', 'h2', 'h3', 'p', 'a'
    ];
    const results = {};
    selectors.forEach(sel => {
      const els = document.querySelectorAll(sel);
      if (els.length > 0) {
        results[sel] = [...els].slice(0, 3).map(el => {
          const cs = getComputedStyle(el);
          return {
            classes: el.className?.toString()?.split(' ').slice(0, 8).join(' '),
            text: el.textContent?.trim()?.slice(0, 100),
            styles: {
              display: cs.display,
              position: cs.position,
              flexDirection: cs.flexDirection,
              gap: cs.gap,
              padding: cs.padding,
              margin: cs.margin,
              width: cs.width,
              height: cs.height,
              maxWidth: cs.maxWidth,
              borderRadius: cs.borderRadius,
              border: cs.border,
              backgroundColor: cs.backgroundColor,
              color: cs.color,
              fontSize: cs.fontSize,
              fontWeight: cs.fontWeight,
              fontFamily: cs.fontFamily,
              lineHeight: cs.lineHeight,
              letterSpacing: cs.letterSpacing,
              boxShadow: cs.boxShadow,
              backdropFilter: cs.backdropFilter,
              transition: cs.transition,
              transform: cs.transform,
              opacity: cs.opacity,
              overflow: cs.overflow,
              maskImage: cs.maskImage,
              cursor: cs.cursor
            }
          };
        });
      }
    });
    return results;
  });
  fs.writeFileSync(path.join(OUTPUT_DIR, 'key-styles.json'), JSON.stringify(keyStyles, null, 2));
  console.log('   Key styles saved');

  // 8. Mobile screenshot
  console.log('8. Mobile viewport...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(OUTPUT_DIR, 'mobile-full.png'), fullPage: true });
  console.log('   Mobile screenshot saved');

  // 9. Extract responsive behavior
  console.log('9. Extracting responsive behavior...');
  const responsive = {};
  for (const width of [1440, 1024, 768, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForTimeout(500);
    const data = await page.evaluate(() => {
      const grid = document.querySelector('[class*="grid"]');
      const nav = document.querySelector('nav');
      return {
        gridClasses: grid?.className?.toString(),
        gridColumns: grid ? getComputedStyle(grid).gridTemplateColumns : null,
        navClasses: nav?.className?.toString(),
        bodyWidth: document.body.scrollWidth
      };
    });
    responsive[width + 'px'] = data;
  }
  fs.writeFileSync(path.join(OUTPUT_DIR, 'responsive.json'), JSON.stringify(responsive, null, 2));
  console.log('   Responsive behavior saved');

  await browser.close();
  console.log('\nDone! All extraction files saved to:', OUTPUT_DIR);
}

extractAll().catch(console.error);
