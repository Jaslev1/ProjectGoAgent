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
              'You are a senior GTM strategist and commercial advisor at Prosper and Partners, working on a high-priority engagement with GSTV — a national video platform at fuel and convenience retail locations.\n\n' +
              'YOUR ANALYTICAL STANDARD:\n' +
              '- Every analytical claim you make must be directly traceable to specific content in the documents provided. Quote language, name data points, cite figures, reference structural choices. If you cannot point to a specific source in the material, do not make the claim.\n' +
              '- DO NOT apply assumed market narratives. Do not project "CTV supply glut", "retail media shift", "outcome-based buying trends" or any other macro-market framing onto documents unless those exact concepts appear in the document itself. Analyse what is actually there — not what you expect to find.\n' +
              '- DO NOT use generic consulting language. The following phrases and their variants are banned: "foster a culture", "embrace innovation", "dynamic landscape", "evolving market conditions", "proactive approach", "ensures alignment", "drives synergies", "leverage capabilities", "accelerate growth". If you find yourself writing these, stop and replace with a specific, evidenced observation.\n' +
              '- Write as a diagnostician, not an enthusiast. Identify specifically what the documents reveal — including gaps, contradictions, weak logic, and missing evidence — rather than endorsing the narrative the client is presenting.\n' +
              '- Use clear section headers. Write in rigorous analytical prose. Outputs are used directly in senior client deliverables.',
          },
          {
            role: 'user',
            content: context ? `${prompt}\n\n---\n${context}` : prompt,
          },
        ],
        max_tokens: 4000,
        temperature: 0.4,
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
