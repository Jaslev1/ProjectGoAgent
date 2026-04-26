import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, context } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'prompt is required' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content:
            'You are a senior GTM strategist and commercial advisor at Prosper and Partners. ' +
            'You are working on a high-priority engagement with GSTV, a national video platform ' +
            'at fuel and convenience retail locations. Your outputs are used directly in client ' +
            'deliverables — be specific, structured, commercially sharp, and write in professional ' +
            'prose. No fluff, no filler. Use clear section headers where appropriate.',
        },
        {
          role: 'user',
          content: context ? `${prompt}\n\n---\n${context}` : prompt,
        },
      ],
      max_tokens: 2500,
      temperature: 0.7,
    });

    const text = completion.choices[0].message.content;
    return res.status(200).json({ text });
  } catch (err) {
    console.error('OpenAI error:', err);
    return res.status(500).json({ error: err.message || 'OpenAI request failed' });
  }
}
