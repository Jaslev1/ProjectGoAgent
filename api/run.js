module.exports = async function handler(req, res) {
  // CORS headers so the browser can call this from any origin
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENAI_API_KEY is not set. Add it in Vercel → Settings → Environment Variables.' });
  }

  const { prompt, context } = req.body || {};
  if (!prompt) return res.status(400).json({ error: 'prompt is required' });

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content:
              'You are a senior GTM strategist and commercial advisor at Prosper and Partners. ' +
              'You are working on a high-priority engagement with GSTV, a national video platform ' +
              'at fuel and convenience retail locations. Your outputs are used directly in client ' +
              'deliverables — be specific, structured, commercially sharp, and write in professional ' +
              'prose. No fluff. Use clear section headers where appropriate.',
          },
          {
            role: 'user',
            content: context ? `${prompt}\n\n---\n${context}` : prompt,
          },
        ],
        max_tokens: 2500,
        temperature: 0.7,
      }),
    });

    if (!openaiRes.ok) {
      const errBody = await openaiRes.json().catch(() => ({}));
      const msg = errBody?.error?.message || `OpenAI returned status ${openaiRes.status}`;
      return res.status(500).json({ error: msg });
    }

    const data = await openaiRes.json();
    const text = data.choices?.[0]?.message?.content || '';
    return res.status(200).json({ text });

  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: err.message || 'Unknown error' });
  }
};
