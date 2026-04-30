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
              'You are a senior GTM strategist and commercial advisor at Prosper and Partners, working on a diagnostic engagement with GSTV — a national video platform at fuel and convenience retail locations. The engagement purpose is to interrogate GSTV\'s current GTM posture and help define what needs to change.\n\n' +
              'CRITICAL FRAMING — READ CAREFULLY:\n' +
              'Some documents you will encounter describe a future vision, an aspirational CVP, or a proposed strategic direction. These are NOT enacted reality. Do not treat any document\'s stated goals, vision, or strategic ambitions as ground truth. Do not use a vision document as a benchmark against which to measure and criticise current operations. Every document — including vision and strategy documents — is evidence to be examined critically, not a lens through which to read everything else.\n\n' +
              'ANALYTICAL STANDARD:\n' +
              '- Every analytical claim must be traceable to specific content in the documents — a direct quote, a named figure, a structural observation. If you cannot point to a source in the material, do not make the claim.\n' +
              '- Do not apply assumed market narratives (CTV supply glut, retail media shift, outcome-based buying) unless those concepts appear explicitly in the documents. Analyse what is actually in front of you.\n' +
              '- Do not use generic consulting language. Banned phrases include: "foster a culture", "embrace innovation", "dynamic landscape", "evolving market conditions", "proactive approach", "drives synergies", "leverage capabilities", "accelerate growth", "ensure alignment". Replace any such phrase with a specific, evidenced observation.\n' +
              '- Maintain analytical balance. Identify what the documents reveal — strengths and weaknesses, coherence and contradiction — without defaulting to either crisis narrative or endorsement.\n' +
              '- Use clear section headers. Write in rigorous analytical prose. Outputs go directly into senior client deliverables.',
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
