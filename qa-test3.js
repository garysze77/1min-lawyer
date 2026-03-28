const { chromium } = require('playwright');

async function runQA() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  
  const results = [];
  const consoleErrors = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  
  page.on('pageerror', err => {
    consoleErrors.push(`PAGE ERROR: ${err.message}`);
  });

  try {
    // 1. Test home page loads
    console.log('=== TEST 1: Home page loads ===');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 20000 });
    const title = await page.title();
    results.push(`✓ Home page loaded. Title: "${title}"`);
    
    const body = await page.textContent('body');
    if (body.includes('律師') || body.includes('法律')) {
      results.push('✓ Chinese legal content detected on home page');
    }
    
    // Check if landing page or already on categories
    const startBtn = await page.$('button:has-text("開始評估")');
    if (startBtn) {
      results.push('  (Landing page detected - will click "開始評估")');
      await startBtn.click();
      await page.waitForTimeout(1000);
    }
    
    // 2. Check for legal categories
    console.log('=== TEST 2: Legal category selection ===');
    const allButtons = await page.$$('button');
    for (const btn of allButtons) {
      const text = await btn.textContent();
      if (text && text.trim().length > 0 && text.trim().length < 60) {
        results.push(`  Category: "${text.trim()}"`);
      }
    }
    
    // Click "僱傭勞工Employment" category (more likely to have AI response issue tested)
    const empBtn = await page.$('button:has-text("僱傭")');
    if (empBtn) {
      await empBtn.click();
      results.push('✓ Clicked "僱傭勞工Employment" category');
      await page.waitForTimeout(1000);
    }
    
    // 3. Check for subcategories
    console.log('=== TEST 3: Subcategory selection ===');
    const subcatBtns = await page.$$('button');
    for (const btn of subcatBtns) {
      const text = await btn.textContent();
      if (text && text.trim().length > 0 && !['安裝', '返回'].includes(text.trim())) {
        results.push(`  Subcategory: "${text.trim()}"`);
      }
    }
    
    // Click first non-back/non-install subcategory
    let clickedSubcat = false;
    for (const btn of subcatBtns) {
      const text = await btn.textContent();
      if (text && !['安裝', '返回'].includes(text.trim())) {
        await btn.click();
        results.push(`✓ Clicked subcategory: "${text.trim()}"`);
        await page.waitForTimeout(1000);
        clickedSubcat = true;
        break;
      }
    }
    
    if (!clickedSubcat) {
      results.push('✗ No valid subcategory found to click');
    }
    
    // 4. Check for question input form
    console.log('=== TEST 4: Question submission form ===');
    const pageContent = await page.textContent('body');
    
    const textareas = await page.$$('textarea');
    const inputs = await page.$$('input');
    const forms = await page.$$('form');
    
    if (textareas.length > 0) {
      results.push(`✓ Found ${textareas.length} textarea(s)`);
      await textareas[0].fill('我被公司無故解僱，唔知點算，請問我可以追討咩賠償？');
      results.push('✓ Filled question in textarea');
    } else {
      results.push(`⚠ No textarea found. Current page content snippet: "${pageContent.substring(0, 200)}"`);
    }
    
    // Look for submit button
    let submitBtn = await page.$('button[type="submit"]');
    if (!submitBtn) {
      submitBtn = await page.$('button:has-text("提交"), button:has-text("送出"), button:has-text("下一步")');
    }
    if (submitBtn) {
      const submitText = await submitBtn.textContent();
      results.push(`✓ Found submit button: "${submitText?.trim()}"`);
    }
    
    // 5. Submit the question
    console.log('=== TEST 5: Submit question ===');
    if (submitBtn) {
      await submitBtn.click();
      results.push('✓ Clicked submit button');
      await page.waitForTimeout(10000); // Wait for AI analysis
      results.push('  Waited 10s for AI response...');
    } else {
      results.push('⚠ No submit button to click');
    }
    
    // 6. Check for AI response
    console.log('=== TEST 6: AI analysis response ===');
    const pageAfterSubmit = await page.textContent('body');
    
    if (pageAfterSubmit.includes('分析') || pageAfterSubmit.includes('AI') || 
        pageAfterSubmit.includes('建議') || pageAfterSubmit.includes('評估') ||
        pageAfterSubmit.includes('法律') || pageAfterSubmit.includes('Rights')) {
      results.push('✓ Legal analysis/recommendation content detected');
    }
    
    // Check for error/failure messages
    if (pageAfterSubmit.includes('錯誤') || pageAfterSubmit.includes('Error') || 
        pageAfterSubmit.includes('失敗') || pageAfterSubmit.includes('failed')) {
      results.push('⚠ Error-related content detected');
    }
    
    // Check if it shows loading or stuck
    if (pageAfterSubmit.includes('載入中') || pageAfterSubmit.includes('Loading') || 
        pageAfterSubmit.includes('分析中')) {
      results.push('⚠ Page appears to still be loading');
    }
    
    // 7. Check for lawyer referral form
    console.log('=== TEST 7: Lawyer referral form ===');
    if (pageAfterSubmit.includes('律師')) {
      results.push('✓ "律師" (lawyer) text found on page');
    }
    if (pageAfterSubmit.includes('轉介')) {
      results.push('✓ "轉介" (referral) text found on page');
    }
    
    // Check for form fields
    const referralFields = ['name', 'email', 'phone', '電話', '姓名', '電郵'];
    for (const field of referralFields) {
      const el = await page.$(`[placeholder*="${field}"], [name*="${field}"]`);
      if (el) results.push(`✓ Referral form field found: "${field}"`);
    }
    
    // 8. Console errors
    console.log('=== CONSOLE ERRORS ===');
    if (consoleErrors.length === 0) {
      results.push('✓ No console errors detected');
    } else {
      results.push(`⚠ ${consoleErrors.length} console error(s):`);
      consoleErrors.slice(0, 5).forEach(err => results.push(`  - ${err.substring(0, 200)}`));
    }
    
    // 9. Take final screenshot
    await page.screenshot({ path: '/Users/ballball/Desktop/1min-lawyer-qa-final.png', fullPage: true });
    results.push('📸 Final screenshot saved: /Users/ballball/Desktop/1min-lawyer-qa-final.png');
    
  } catch (err) {
    results.push(`✗ TEST FAILED: ${err.message}`);
    await page.screenshot({ path: '/Users/ballball/Desktop/1min-lawyer-qa-error.png' }).catch(() => {});
  }
  
  await browser.close();
  
  console.log('\n========== QA RESULTS ==========');
  results.forEach(r => console.log(r));
  console.log('=================================');
  
  return results;
}

runQA().catch(console.error);
