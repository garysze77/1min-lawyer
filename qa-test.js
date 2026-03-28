const { chromium } = require('playwright');

async function runQA() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
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
    await page.goto('http://localhost:3002', { waitUntil: 'networkidle', timeout: 15000 });
    const title = await page.title();
    results.push(`✓ Home page loaded. Title: "${title}"`);
    
    // Check main UI elements
    const body = await page.textContent('body');
    if (body.includes('律師') || body.includes('法律')) {
      results.push('✓ Chinese legal content detected on home page');
    }
    
    // 2. Check for legal category selection
    console.log('=== TEST 2: Legal category selection ===');
    // Look for buttons/elements that could be categories
    const categoryButtons = await page.$$('button');
    let foundCategory = false;
    for (const btn of categoryButtons) {
      const text = await btn.textContent();
      if (text && text.trim().length > 0) {
        results.push(`  Found button: "${text.trim().substring(0, 50)}"`);
        foundCategory = true;
        break;
      }
    }
    
    // 3. Try clicking first available button to see categories
    console.log('=== TEST 3: Category/subcategory flow ===');
    const allClickable = await page.$$('button, [role="button"], a');
    if (allClickable.length > 0) {
      const firstBtn = allClickable[0];
      const btnText = await firstBtn.textContent();
      await firstBtn.click();
      await page.waitForTimeout(1000);
      results.push(`  Clicked: "${btnText?.trim().substring(0, 40)}"`);
      
      // Check if new content appeared
      const newBody = await page.textContent('body');
      if (newBody !== body) {
        results.push('  ✓ UI changed after category click (subcategories may have appeared)');
      }
    }
    
    // 4. Look for question input
    console.log('=== TEST 4: Question submission ===');
    const textareas = await page.$$('textarea');
    const inputs = await page.$$('input');
    if (textareas.length > 0) {
      await textareas[0].fill('我被公司解僱了，應該點算？');
      results.push('✓ Filled question textarea');
    } else if (inputs.length > 0) {
      await inputs[0].fill('我被公司解僱了，應該點算？');
      results.push('✓ Filled question input');
    } else {
      results.push('⚠ No text input found for question');
    }
    
    // Find submit button
    const submitBtn = await page.$('button[type="submit"], button:has-text("提交"), button:has-text("送出"), button:has-text("Submit")');
    if (submitBtn) {
      await submitBtn.click();
      results.push('✓ Clicked submit button');
      await page.waitForTimeout(5000); // Wait for AI response
      results.push('  Waited 5s for AI response...');
    }
    
    // 5. Check for AI response
    console.log('=== TEST 5: AI analysis ===');
    const pageContent = await page.textContent('body');
    if (pageContent.includes('分析') || pageContent.includes('AI') || pageContent.includes('建議') || pageContent.includes('律師')) {
      results.push('✓ Legal analysis content detected');
    }
    
    // 6. Check for lawyer referral form
    if (pageContent.includes('律師') && pageContent.includes('轉介')) {
      results.push('✓ Lawyer referral form/content detected');
    }
    
    // 7. Check console errors
    console.log('=== CONSOLE ERRORS ===');
    if (consoleErrors.length === 0) {
      results.push('✓ No console errors detected');
    } else {
      consoleErrors.forEach(err => results.push(`✗ ERROR: ${err}`));
    }
    
    // Take a screenshot
    await page.screenshot({ path: '/Users/ballball/Desktop/1min-lawyer-qa.png', fullPage: true });
    results.push('📸 Screenshot saved: /Users/ballball/Desktop/1min-lawyer-qa.png');
    
  } catch (err) {
    results.push(`✗ TEST FAILED: ${err.message}`);
  }
  
  await browser.close();
  
  console.log('\n========== QA RESULTS ==========');
  results.forEach(r => console.log(r));
  console.log('=================================');
  
  return results;
}

runQA().catch(console.error);
