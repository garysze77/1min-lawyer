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
    if (body.includes('開始評估')) {
      results.push('✓ "開始評估" (Start Assessment) button found');
    }
    
    // 2. Click "開始評估" to enter assessment flow
    console.log('=== TEST 2: Enter assessment flow ===');
    const startBtn = await page.$('button:has-text("開始評估")');
    if (startBtn) {
      await startBtn.click();
      await page.waitForTimeout(1500);
      results.push('✓ Clicked "開始評估" button');
    } else {
      results.push('✗ "開始評估" button not found');
    }
    
    // 3. Check for legal categories
    console.log('=== TEST 3: Legal category selection ===');
    const pageAfterStart = await page.textContent('body');
    // Look for category buttons
    const allButtons = await page.$$('button');
    let categoryCount = 0;
    for (const btn of allButtons) {
      const text = await btn.textContent();
      if (text && text.trim().length > 0 && text.trim().length < 60) {
        categoryCount++;
        if (categoryCount <= 10) {
          results.push(`  Button: "${text.trim()}"`);
        }
      }
    }
    results.push(`  Total buttons found: ${categoryCount}`);
    
    // Click first category
    const firstCategory = allButtons[0];
    if (firstCategory) {
      const catText = await firstCategory.textContent();
      await firstCategory.click();
      await page.waitForTimeout(1500);
      results.push(`✓ Clicked first category: "${catText?.trim()}"`);
    }
    
    // 4. Check for subcategories
    console.log('=== TEST 4: Subcategory selection ===');
    const allButtonsAfterCat = await page.$$('button');
    let subcatCount = 0;
    for (const btn of allButtonsAfterCat) {
      const text = await btn.textContent();
      const classes = await btn.getAttribute('class');
      if (text && text.trim().length > 0 && text.trim().length < 60) {
        subcatCount++;
        if (subcatCount <= 10) {
          results.push(`  Subcat button: "${text.trim()}"`);
        }
      }
    }
    if (subcatCount > 3) {
      results.push(`✓ Multiple subcategory buttons found (${subcatCount} buttons)`);
    }
    
    // Click first subcategory
    const firstSubcat = allButtonsAfterCat[0];
    if (firstSubcat) {
      const subcatText = await firstSubcat.textContent();
      await firstSubcat.click();
      await page.waitForTimeout(1500);
      results.push(`✓ Clicked first subcategory: "${subcatText?.trim()}"`);
    }
    
    // 5. Check for question input form
    console.log('=== TEST 5: Question submission form ===');
    const textareas = await page.$$('textarea');
    const inputs = await page.$$('input');
    const forms = await page.$$('form');
    
    if (textareas.length > 0) {
      results.push(`✓ Found ${textareas.length} textarea(s)`);
      await textareas[0].fill('我被公司無故解僱，唔知點算好，請問我應該點做？');
      results.push('✓ Filled question in textarea');
    } else {
      results.push('⚠ No textarea found');
    }
    
    if (inputs.length > 0) {
      results.push(`✓ Found ${inputs.length} input(s)`);
    }
    
    if (forms.length > 0) {
      results.push(`✓ Found ${forms.length} form(s)`);
    }
    
    // Look for submit button
    const submitButtons = await page.$$('button[type="submit"], button:has-text("提交"), button:has-text("送出"), button:has-text("下一步")');
    if (submitButtons.length > 0) {
      const submitText = await submitButtons[0].textContent();
      results.push(`✓ Found submit button: "${submitText?.trim()}"`);
    } else {
      results.push('⚠ No submit button found');
    }
    
    // 6. Submit the question
    console.log('=== TEST 6: Submit question ===');
    const submitBtn = await page.$('button[type="submit"]');
    if (submitBtn) {
      await submitBtn.click();
      results.push('✓ Clicked submit button');
      await page.waitForTimeout(8000); // Wait for AI analysis
      results.push('  Waited 8s for AI response...');
    } else {
      // Try any button with submit-like text
      const anySubmit = await page.$('button:has-text("提交"), button:has-text("送出"), button:has-text("下一步")');
      if (anySubmit) {
        await anySubmit.click();
        results.push('✓ Clicked submit/next button');
        await page.waitForTimeout(8000);
      }
    }
    
    // 7. Check for AI response
    console.log('=== TEST 7: AI analysis response ===');
    const pageAfterSubmit = await page.textContent('body');
    if (pageAfterSubmit.includes('分析') || pageAfterSubmit.includes('AI') || 
        pageAfterSubmit.includes('建議') || pageAfterSubmit.includes('評估') ||
        pageAfterSubmit.includes('法律')) {
      results.push('✓ Legal analysis/recommendation content detected');
    }
    
    // Check for loading or error states
    if (pageAfterSubmit.includes('載入中') || pageAfterSubmit.includes('Loading')) {
      results.push('⚠ Page still loading after 8s');
    }
    
    // 8. Check for lawyer referral form
    console.log('=== TEST 8: Lawyer referral form ===');
    if (pageAfterSubmit.includes('律師') && (pageAfterSubmit.includes('轉介') || pageAfterSubmit.includes(' referral'))) {
      results.push('✓ Lawyer referral content detected');
    }
    
    // Look for referral form fields
    const nameInput = await page.$('input[name*="name"], input[placeholder*="名"], input[placeholder*="姓"]');
    const emailInput = await page.$('input[name*="email"], input[type="email"]');
    const phoneInput = await page.$('input[name*="phone"], input[type="tel"]');
    
    if (nameInput) results.push('✓ Name input found for referral form');
    if (emailInput) results.push('✓ Email input found for referral form');
    if (phoneInput) results.push('✓ Phone input found for referral form');
    
    // 9. Final screenshot
    await page.screenshot({ path: '/Users/ballball/Desktop/1min-lawyer-qa-final.png', fullPage: true });
    results.push('📸 Final screenshot saved');
    
    // 10. Console errors summary
    console.log('=== CONSOLE ERRORS ===');
    if (consoleErrors.length === 0) {
      results.push('✓ No console errors detected');
    } else {
      results.push(`⚠ ${consoleErrors.length} console error(s):`);
      consoleErrors.slice(0, 5).forEach(err => results.push(`  - ${err.substring(0, 150)}`));
    }
    
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
