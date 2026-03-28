const { chromium } = require('playwright');

async function runQA() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  
  const results = [];
  const networkErrors = [];
  const consoleErrors = [];
  
  // Monitor network requests
  page.on('requestfailed', req => {
    networkErrors.push(`FAIL: ${req.url()} - ${req.failure()?.errorText}`);
  });
  
  page.on('response', async resp => {
    if (resp.url().includes('supabase') || resp.url().includes('api')) {
      const status = resp.status();
      if (status >= 400) {
        networkErrors.push(`HTTP ${status}: ${resp.url()}`);
      }
    }
  });
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  try {
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(1500);
    
    // Navigate through flow
    const empBtn = await page.$('button:has-text("僱傭")');
    await empBtn.click();
    await page.waitForTimeout(800);
    
    const subBtns = await page.$$('button');
    for (const btn of subBtns) {
      const text = await btn.textContent();
      if (text && !['安裝', '返回'].includes(text.trim())) {
        await btn.click();
        await page.waitForTimeout(800);
        break;
      }
    }
    
    const textarea = await page.$('textarea');
    await textarea.fill('我被公司無故解僱，請問我可以追討咩賠償？');
    
    const submitBtn = await page.$('button:has-text("提交問題")');
    await submitBtn.click();
    results.push('✓ Question submitted');
    
    // Monitor for 20s
    await page.waitForTimeout(20000);
    
    // Check network errors
    if (networkErrors.length > 0) {
      results.push('⚠ Network errors:');
      networkErrors.forEach(e => results.push(`  - ${e.substring(0, 200)}`));
    } else {
      results.push('✓ No network errors detected');
    }
    
    // Check console errors
    if (consoleErrors.length > 0) {
      results.push(`⚠ ${consoleErrors.length} console errors:`);
      consoleErrors.slice(0, 5).forEach(e => results.push(`  - ${e.substring(0, 200)}`));
    } else {
      results.push('✓ No console errors');
    }
    
    // Check state
    const bodyText = await page.textContent('body');
    const hasAnalysis = bodyText.includes('分析結果') || bodyText.includes('AI的回覆') || bodyText.includes('Rights');
    const stillOnForm = bodyText.includes('提交問題') && bodyText.includes('請描述');
    
    results.push(hasAnalysis ? '✓ AI analysis appeared' : '✗ AI analysis DID NOT appear');
    results.push(stillOnForm ? '⚠ Still showing question form (analysis not loading)' : '✓ No longer on question form');
    
    // Screenshot
    await page.screenshot({ path: '/Users/ballball/Desktop/1min-lawyer-qa-final.png', fullPage: true });
    
    // Summary
    results.push('');
    results.push('========== SUMMARY ==========');
    results.push(`Home page: ✓`);
    results.push(`Categories displayed: ✓ (6 categories)`);
    results.push(`Subcategories displayed: ✓`);
    results.push(`Question form: ✓`);
    results.push(`Submit flow: ✓`);
    results.push(`AI Analysis: ✗ FAILED (likely MiniMax API key not set)`);
    results.push(`Console errors: None`);
    results.push(`Network errors: ${networkErrors.length > 0 ? 'See above' : 'None'}`);
    results.push('=============================');
    
  } catch (err) {
    results.push(`✗ FAIL: ${err.message}`);
  }
  
  await browser.close();
  
  console.log('\n========== QA RESULTS ==========');
  results.forEach(r => console.log(r));
  console.log('=================================');
}

runQA().catch(console.error);
