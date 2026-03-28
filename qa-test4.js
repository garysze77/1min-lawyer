const { chromium } = require('playwright');

async function runQA() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
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
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle', timeout: 20000 });
    
    // Go through the flow: category -> subcategory -> question
    const empBtn = await page.$('button:has-text("僱傭")');
    await empBtn.click();
    await page.waitForTimeout(800);
    
    // Click first subcategory
    const subcatBtns = await page.$$('button');
    for (const btn of subcatBtns) {
      const text = await btn.textContent();
      if (text && !['安裝', '返回'].includes(text.trim())) {
        await btn.click();
        await page.waitForTimeout(800);
        break;
      }
    }
    
    // Fill and submit question
    const textarea = await page.$('textarea');
    await textarea.fill('我被公司無故解僱，唔知點算，請問我可以追討咩賠償？');
    const submitBtn = await page.$('button:has-text("提交問題")');
    await submitBtn.click();
    
    // Wait for response
    await page.waitForTimeout(12000);
    
    // Get full page text and scroll through
    const fullText = await page.evaluate(() => document.body.innerText);
    
    console.log('======== PAGE CONTENT AFTER SUBMIT ========');
    console.log(fullText.substring(0, 3000));
    console.log('==========================================');
    
    // Check for specific content
    results.push('--- Content Analysis ---');
    
    // AI analysis section
    const hasAnalysis = fullText.includes('分析') || fullText.includes('建議') || fullText.includes('評估') || fullText.includes('Rights');
    results.push(hasAnalysis ? '✓ Analysis content present' : '✗ No analysis content found');
    
    // Check for actual analysis text vs just section headers
    const analysisKeywords = ['僱傭', '解僱', '補償', '賠償', '條例', '不合理解僱', '傭', '雇'];
    const foundAnalysisKeywords = analysisKeywords.filter(kw => fullText.includes(kw));
    if (foundAnalysisKeywords.length > 0) {
      results.push(`✓ Legal analysis keywords found: ${foundAnalysisKeywords.join(', ')}`);
    } else {
      results.push('⚠ No specific legal analysis keywords found in response');
    }
    
    // Check for error indicators
    const errorIndicators = ['Error', 'error', '錯誤', '失敗', 'failed', '無法', 'not found', 'API'];
    const foundErrors = errorIndicators.filter(e => fullText.includes(e));
    if (foundErrors.length > 0) {
      results.push(`⚠ Potential error indicators: ${foundErrors.join(', ')}`);
    }
    
    // Lawyer referral
    const hasReferral = fullText.includes('轉介') || fullText.includes('referral');
    results.push(hasReferral ? '✓ Lawyer referral section found' : '✗ No referral section found');
    
    // Referral form fields
    const nameField = await page.$('input[name*="name"], [placeholder*="名稱"], [placeholder*="姓名"]');
    const emailField = await page.$('input[type="email"], [placeholder*="電郵"]');
    const phoneField = await page.$('input[type="tel"], [placeholder*="電話"]');
    
    if (nameField) results.push('✓ Name field present in referral form');
    if (emailField) results.push('✓ Email field present in referral form');
    if (phoneField) results.push('✓ Phone field present in referral form');
    
    // Try submitting referral form (empty)
    if (nameField && emailField && phoneField) {
      await nameField.fill('測試用戶');
      await emailField.fill('test@example.com');
      await phoneField.fill('91234567');
      results.push('✓ Filled referral form fields');
      
      const referralSubmit = await page.$('button:has-text("轉介"), button:has-text("提交"), button:has-text("確認")');
      if (referralSubmit) {
        const referralSubmitText = await referralSubmit.textContent();
        await referralSubmit.click();
        await page.waitForTimeout(3000);
        results.push(`✓ Clicked referral submit: "${referralSubmitText?.trim()}"`);
        
        // Check if success message appeared
        const afterReferral = await page.textContent('body');
        if (afterReferral.includes('成功') || afterReferral.includes('已完成') || afterReferral.includes('確認')) {
          results.push('✓ Referral submission appeared to succeed');
        }
      }
    }
    
    // Console errors
    if (consoleErrors.length === 0) {
      results.push('✓ No console errors');
    } else {
      results.push(`⚠ ${consoleErrors.length} console error(s):`);
      consoleErrors.slice(0, 5).forEach(err => results.push(`  - ${err.substring(0, 200)}`));
    }
    
    await page.screenshot({ path: '/Users/ballball/Desktop/1min-lawyer-qa-final.png', fullPage: true });
    
  } catch (err) {
    results.push(`✗ FAIL: ${err.message}`);
  }
  
  await browser.close();
  
  console.log('\n========== FINAL QA RESULTS ==========');
  results.forEach(r => console.log(r));
  console.log('======================================');
}

runQA().catch(console.error);
