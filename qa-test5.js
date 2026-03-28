const { chromium } = require('playwright');

async function runQA() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  
  const results = [];
  const consoleMessages = [];
  
  page.on('console', msg => {
    consoleMessages.push({ type: msg.type(), text: msg.text() });
  });
  
  page.on('pageerror', err => {
    consoleMessages.push({ type: 'pageerror', text: err.message });
  });

  try {
    // 1. Home page
    console.log('=== 1. HOME PAGE ===');
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 20000 });
    await page.waitForTimeout(2000);
    results.push('✓ Home page loaded');
    
    // 2. Categories
    console.log('=== 2. CATEGORIES ===');
    const catBtns = await page.$$('button');
    let catTexts = [];
    for (const btn of catBtns) {
      const text = await btn.textContent();
      if (text && !['安裝'].includes(text.trim()) && text.trim().length < 50) {
        catTexts.push(text.trim());
      }
    }
    results.push(`✓ Categories: ${catTexts.join(', ')}`);
    
    // Click Employment
    const empBtn = await page.$('button:has-text("僱傭")');
    if (empBtn) {
      await empBtn.click();
      await page.waitForTimeout(1000);
      results.push('✓ Clicked 僱傭勞工');
    }
    
    // 3. Subcategories
    console.log('=== 3. SUBCATEGORIES ===');
    const subBtns = await page.$$('button');
    let subTexts = [];
    for (const btn of subBtns) {
      const text = await btn.textContent();
      if (text && !['安裝', '返回'].includes(text.trim()) && text.trim().length < 50) {
        subTexts.push(text.trim());
      }
    }
    results.push(`✓ Subcategories: ${subTexts.join(', ')}`);
    
    // Click first real subcategory
    for (const btn of subBtns) {
      const text = await btn.textContent();
      if (text && !['安裝', '返回'].includes(text.trim())) {
        await btn.click();
        await page.waitForTimeout(1000);
        results.push(`✓ Clicked: "${text.trim()}"`);
        break;
      }
    }
    
    // 4. Question form
    console.log('=== 4. QUESTION FORM ===');
    const textarea = await page.$('textarea');
    if (textarea) {
      await textarea.fill('我被公司無故解僱，請問我可以追討咩賠償？');
      results.push('✓ Filled question textarea');
    } else {
      results.push('✗ No textarea found');
    }
    
    const submitBtn = await page.$('button:has-text("提交問題")');
    if (submitBtn) {
      results.push('✓ Submit button found');
      await submitBtn.click();
      results.push('✓ Clicked submit - waiting for AI response...');
    }
    
    // 5. Poll for analysis result (every 2s, up to 30s)
    console.log('=== 5. AI ANALYSIS (polling) ===');
    let foundAnalysis = false;
    let foundReferral = false;
    let foundError = false;
    
    for (let i = 0; i < 15; i++) {
      await page.waitForTimeout(2000);
      const bodyText = await page.textContent('body');
      
      // Check for analysis result
      if (!foundAnalysis && (bodyText.includes('分析結果') || bodyText.includes('建議') || bodyText.includes('評估') || bodyText.includes('Rights'))) {
        results.push(`✓ Analysis result detected at ${(i+1)*2}s`);
        foundAnalysis = true;
      }
      
      // Check for referral form
      if (!foundReferral && bodyText.includes('轉介')) {
        results.push(`✓ Lawyer referral detected at ${(i+1)*2}s`);
        foundReferral = true;
      }
      
      // Check for error
      if (!foundError && (bodyText.includes('錯誤') || bodyText.includes('Error') || bodyText.includes('無法') || bodyText.includes('failed'))) {
        results.push(`⚠ Error detected at ${(i+1)*2}s: ${bodyText.substring(bodyText.indexOf('錯誤'), bodyText.indexOf('錯誤') + 100)}`);
        foundError = true;
      }
      
      // Check if page shows we left question form
      if (!foundAnalysis && !bodyText.includes('請描述') && !bodyText.includes('提交問題')) {
        results.push(`  Page changed at ${(i+1)*2}s (no longer on question form)`);
      }
      
      if (foundAnalysis && foundReferral) break;
    }
    
    if (!foundAnalysis) {
      results.push('✗ AI analysis result NOT found after 30s - possible MiniMax API issue');
    }
    
    // 6. Final state
    console.log('=== 6. FINAL STATE ===');
    const finalText = await page.textContent('body');
    results.push(`Page length: ${finalText.length} chars`);
    
    // Extract any analysis-like content
    if (finalText.includes('分析')) {
      const idx = finalText.indexOf('分析');
      results.push(`Analysis context: "...${finalText.substring(Math.max(0, idx-20), idx+100)}..."`);
    }
    
    // Console messages
    console.log('=== 7. CONSOLE MESSAGES ===');
    const errors = consoleMessages.filter(m => m.type === 'error' || m.type === 'pageerror');
    if (errors.length === 0) {
      results.push('✓ No console errors');
    } else {
      results.push(`⚠ ${errors.length} error(s):`);
      errors.slice(0, 5).forEach(e => results.push(`  [${e.type}] ${e.text.substring(0, 200)}`));
    }
    
    // Check network requests for API errors
    const apiErrors = consoleMessages.filter(m => 
      m.text.includes('api') || m.text.includes('fetch') || m.text.includes('500') || m.text.includes('401') || m.text.includes('403')
    );
    if (apiErrors.length > 0) {
      results.push(`⚠ API-related console messages: ${apiErrors.length}`);
    }
    
    await page.screenshot({ path: '/Users/ballball/Desktop/1min-lawyer-qa-final.png', fullPage: true });
    
  } catch (err) {
    results.push(`✗ FAIL: ${err.message}`);
  }
  
  await browser.close();
  
  console.log('\n========== QA RESULTS ==========');
  results.forEach(r => console.log(r));
  console.log('=================================');
}

runQA().catch(console.error);
