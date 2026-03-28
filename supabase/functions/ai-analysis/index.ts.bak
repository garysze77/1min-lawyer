// AI Analysis Edge Function for 1 Minute Lawyer
// Uses MiniMax AI to analyze user questions and provide legal guidance

interface AnalysisRequest {
  question_id: string;
  category: string;
  subcategory: string;
  question_text: string;
}

// --- Rate Limiting ---
// 20 requests per IP per 60 seconds to prevent billing attacks
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;

const kv = await Deno.openKv();
const headers = { 'Content-Type': 'application/json' };

async function isRateLimited(ip: string): Promise<boolean> {
  const key = ['ratelimit', ip];
  const result = await kv.get<{ count: number; resetAt: number }>(key);
  const now = Date.now();

  if (!result.value || now > result.value.resetAt) {
    await kv.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (result.value.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  await kv.set(key, { count: result.value.count + 1, resetAt: result.value.resetAt });
  return false;
}

function getClientIp(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? req.headers.get('cf-connecting-ip')?.trim()
    ?? 'unknown';
}

// --- Input Validation Constants ---
const MAX_QUESTION_TEXT_LENGTH = 2000;
const MAX_SUBCATEGORY_LENGTH = 100;

// Prompts for different legal categories
const CATEGORY_PROMPTS: Record<string, { context: string; laws: string[] }> = {
  family: {
    context: '婚姻家庭法律問題，包括同居關係、婚姻財產、子女監護等。香港婚姻法律主要參考《婚姻條例》、《婚姻法律程序與財產條例》等。',
    laws: ['香港《婚姻條例》', '香港《婚姻法律程序與財產條例》', '香港《父母與子女條例》', '香港《同居關係條例》'],
  },
  property: {
    context: '樓宇地產法律問題，包括買賣合約、租賃糾紛、大廈管理等。香港地產法律主要參考《土地註冊條例》、《印花稅條例》、《業主與租客（綜合）條例》等。',
    laws: ['香港《土地註冊條例》', '香港《印花稅條例》', '香港《業主與租客（綜合）條例》', '香港《建築物管理條例》'],
  },
  employment: {
    context: '僱傭勞工法律問題，包括解僱補償、合約條款、工傷等。香港僱傭法律主要參考《僱傭條例》、《強制性公積金計劃條例》、《工傷補償條例》等。',
    laws: ['香港《僱傭條例》', '香港《強制性公積金計劃條例》', '香港《工傷補償條例》', '香港《最低工資條例》'],
  },
  commercial: {
    context: '商業貿易法律問題，包括商業合約、債項追討、公司註冊等。香港商業法律主要參考《公司條例》、《合約法》、《破產條例》等。',
    laws: ['香港《公司條例》', '香港《合約法》', '香港《破產條例》', '香港《侵權者條例》'],
  },
  injury: {
    context: '個人傷亡法律問題，包括交通意外、醫療疏忽、工傷索償等。香港民事侵權法律主要參考《侵權行為條例》、《交通意外條例》等。',
    laws: ['香港《侵權行為條例》', '香港《交通意外條例》', '香港《工傷補償條例》', '香港《醫療專業條例》'],
  },
  criminal: {
    context: '刑事罪行法律問題。香港刑事法律主要參考《刑事罪行條例》、《警隊條例》等。注意：這裡只提供一般法律資訊，不涉及具體案件辯護。',
    laws: ['香港《刑事罪行條例》', '香港《警隊條例》', '香港《裁判官條例》', '香港《刑事訴訟程序條例》'],
  },
};

const DISCLAIMER = '此為AI分析，不構成法律意見。如有需要，請諮詢合資格律師。';

Deno.serve(async (req) => {
  try {
    // Rate limiting
    const clientIp = getClientIp(req);
    if (await isRateLimited(clientIp)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please wait a moment and try again.' }),
        { status: 429, headers }
      );
    }

    const { question_id, category, subcategory, question_text }: AnalysisRequest = await req.json();

    // Input validation
    if (!category || !subcategory || !question_text) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: category, subcategory, question_text' }),
        { status: 400, headers }
      );
    }

    if (typeof question_text !== 'string' || question_text.length === 0 || question_text.length > MAX_QUESTION_TEXT_LENGTH) {
      return new Response(
        JSON.stringify({ error: `question_text must be 1-${MAX_QUESTION_TEXT_LENGTH} characters` }),
        { status: 400, headers }
      );
    }

    if (typeof subcategory !== 'string' || subcategory.length === 0 || subcategory.length > MAX_SUBCATEGORY_LENGTH) {
      return new Response(
        JSON.stringify({ error: `subcategory must be 1-${MAX_SUBCATEGORY_LENGTH} characters` }),
        { status: 400, headers }
      );
    }

    if (category !== 'general' && !CATEGORY_PROMPTS[category]) {
      return new Response(
        JSON.stringify({ error: 'Invalid category' }),
        { status: 400, headers }
      );
    }

    // Get category-specific context and laws
    const categoryInfo = CATEGORY_PROMPTS[category] || {
      context: '一般法律問題',
      laws: ['香港《基本法》', '香港普通法'],
    };

    // Build prompt for MiniMax
    const prompt = `
你是1分鐘律師的AI法律分析助手，專門為香港用戶提供法律參考意見。

用戶問題類別：${categoryInfo.context}
細分類別：${subcategory}
用戶問題：${question_text}

請根據以上資料，提供以下格式的分析：

1. 情況分析（analysis）：根據用戶描述，分析他們的法律處境
2. 相關法例（relevant_laws）：列出2-4個最相關的香港法例
3. 可能結果（possible_outcomes）：分析如果走法律程序可能的结果
4. 建議下一步（recommendation）：建議用戶下一步應該怎麼做
5. 免責聲明（disclaimer）：提醒用戶這只是AI分析

請用繁體中文回答，語氣專業但易懂。

重要提醒：
- 你的分析僅供參考，不構成法律意見
- 如果問題涉及嚴重刑事罪行，建議用戶立即聘請律師
- 如果問題涉及人身安全，請先提醒用戶注意安全

請以JSON格式返回：
{
  "analysis": "情況分析內容...",
  "relevant_laws": ["法例1", "法例2", "法例3", "法例4"],
  "possible_outcomes": "可能結果...",
  "recommendation": "建議下一步...",
  "disclaimer": "${DISCLAIMER}"
}
`;

    // Call MiniMax API
    const minimaxApiKey = Deno.env.get('MINIMAX_API_KEY');
    if (!minimaxApiKey) {
      console.error('MiniMax API key not configured');
      return new Response(
        JSON.stringify({
          error: 'MiniMax API key not configured',
          analysis: '抱歉，AI分析服務暫時無法使用。請稍後再試或聯繫客服。',
          relevant_laws: categoryInfo.laws,
          possible_outcomes: '無法提供分析',
          recommendation: '請稍後再試，或聯繫我們獲取協助。',
          disclaimer: DISCLAIMER,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const response = await fetch('https://api.minimax.io/v1/text/chatcompletion_pro', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${minimaxApiKey}`,
      },
      body: JSON.stringify({
        model: 'MiniMax-Text-01',
        messages: [
          {
            role: 'system',
            content: '你是一個專業的香港法律諮詢AI助手，擅長分析各種法律問題並提供有用的建議。你的回答應該專業、易懂、且有幫助。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('MiniMax API error:', errorText);
      return new Response(
        JSON.stringify({
          error: 'Failed to call MiniMax API',
          analysis: '抱歉，AI分析服務暫時無法使用。請稍後再試。',
          relevant_laws: categoryInfo.laws,
          possible_outcomes: '無法提供分析',
          recommendation: '請稍後再試，或聯繫我們獲取協助。',
          disclaimer: DISCLAIMER,
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const result = await response.json();
    const aiContent = result.choices?.[0]?.message?.content || '';

    // Parse the JSON response from MiniMax
    let aiResult;
    try {
      // Extract JSON from the response (in case it has markdown code blocks)
      const jsonMatch = aiContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiResult = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse MiniMax response:', parseError);
      // Return a fallback response
      aiResult = {
        analysis: `根據您描述的情況（${subcategory}），這涉及${categoryInfo.context}範疇。`,
        relevant_laws: categoryInfo.laws,
        possible_outcomes: '具體結果需要根據案件的詳細情況和證據來判斷。',
        recommendation: '建議您準備好相關文件和證據，諮詢專業律師以獲得更具體的法律意見。',
        disclaimer: DISCLAIMER,
      };
    }

    // Ensure disclaimer is always present
    if (!aiResult.disclaimer) {
      aiResult.disclaimer = DISCLAIMER;
    }

    // Return the analysis result
    return new Response(
      JSON.stringify({
        success: true,
        data: aiResult,
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        analysis: '抱歉，系統發生錯誤。請稍後再試。',
        relevant_laws: [],
        possible_outcomes: '無法提供',
        recommendation: '請稍後再試。',
        disclaimer: DISCLAIMER,
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
