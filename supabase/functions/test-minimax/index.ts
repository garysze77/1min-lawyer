Deno.serve(async (req) => {
  try {
    const minimaxApiKey = Deno.env.get('MINIMAX_API_KEY');
    console.error('MINIMAX_API_KEY:', minimaxApiKey ? 'present (length: ' + minimaxApiKey.length + ')' : 'MISSING');
    
    if (!minimaxApiKey) {
      return new Response(JSON.stringify({ error: 'No API key' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    console.error('Calling MiniMax chatcompletion_v2 API...');
    const response = await fetch('https://api.minimax.io/v1/text/chatcompletion_v2', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${minimaxApiKey}`,
      },
      body: JSON.stringify({
        model: "MiniMax-M2.7",
        messages: [
          { role: 'system', name: 'MiniMax AI', content: '你是1分鐘律師的AI法律分析助手，專門為香港用戶提供法律參考意見。' },
          { role: 'user', name: 'User', content: 'Hello' }
        ],
        max_tokens: 100,
      }),
    });
    
    console.error('Response status:', response.status);
    const text = await response.text();
    console.error('Response body:', text);
    
    return new Response(text, {
      status: response.status,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});