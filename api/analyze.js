// Vercel Serverless Function (Node.js runtime).
// Calls Google's Gemini API (free tier eligible) to read the transaction screenshot.
// Keeps the API key on the server — the browser never sees it.
// Set GEMINI_API_KEY in your Vercel Project Settings → Environment Variables.
// Get a free key (no credit card required) at https://aistudio.google.com/apikey

const MODEL = 'gemini-2.5-flash';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'Server chưa cấu hình GEMINI_API_KEY (xem README).' });
    return;
  }

  const { base64, mediaType, prompt } = req.body || {};
  if (!base64 || !prompt) {
    res.status(400).json({ error: 'Thiếu ảnh hoặc prompt trong request.' });
    return;
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`;
    const apiResp = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [
            { inline_data: { mime_type: mediaType || 'image/jpeg', data: base64 } },
            { text: prompt },
          ],
        }],
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 2000,
        },
      }),
    });

    const data = await apiResp.json();

    if (!apiResp.ok) {
      const msg = (data && data.error && data.error.message) || `Gemini API lỗi (HTTP ${apiResp.status})`;
      res.status(apiResp.status).json({ error: msg });
      return;
    }

    const parts = (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) || [];
    const text = parts.map(p => p.text || '').join('\n');
    const clean = text.replace(/```json|```/g, '').trim();
    const jsonMatch = clean.match(/\[[\s\S]*\]/);

    let transactions = [];
    try {
      transactions = JSON.parse(jsonMatch ? jsonMatch[0] : clean);
    } catch (e) {
      res.status(502).json({ error: 'Không phân tích được kết quả từ AI (không phải JSON hợp lệ).' });
      return;
    }

    res.status(200).json({ transactions });
  } catch (e) {
    res.status(500).json({ error: e.message || 'Lỗi không xác định khi gọi Gemini API.' });
  }
}
