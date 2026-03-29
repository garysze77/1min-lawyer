Deno.serve(async (req) => {
  const { name, contact, question } = await req.json();
  
  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN')!;
  const adminChatId = Deno.env.get('TELEGRAM_ADMIN_CHAT_ID')!;
  
  const message = `🔔 律師轉介查詢

👤 姓名: ${name}
📞 聯絡: ${contact}
❓ 咨詢內容: ${question || 'N/A'}
⏰ 時間: ${new Date().toLocaleString('zh-HK', { timeZone: 'Asia/Hong_Kong' })}`;
  
  const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: adminChatId,
      text: message
    })
  });
  
  const result = await response.json();
  return new Response(JSON.stringify(result), { status: 200 });
});
