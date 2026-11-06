// Vercel Node.js Function
export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.LLM_API_KEY;
  const baseUrl = process.env.LLM_BASE_URL || 'https://api.groq.com/openai/v1';
  const model = process.env.LLM_MODEL || 'llama-3.3-70b-versatile';

  if (!apiKey) {
    return res.status(500).json({ error: 'LLM_API_KEY non configurée' });
  }

  let body;
  try {
    body = req.body;
  } catch {
    return res.status(400).json({ error: 'JSON invalide' });
  }

  const { system, messages } = body;
  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages doit être un tableau' });
  }

  const payload = {
    model,
    stream: true,
    messages: [
      { role: 'system', content: system || 'Tu es un assistant utile.' },
      ...messages
    ],
    temperature: 0.7,
    max_tokens: 2048
  };

  try {
    const upstream = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      return res.status(upstream.status).json({ error: `Groq error: ${errText}` });
    }

    // Stream la réponse de Groq directement au client
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      res.write(chunk);
    }

    res.end();
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({ error: 'Erreur serveur: ' + error.message });
  }
}