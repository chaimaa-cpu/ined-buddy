// api/chat.js — Node.js Runtime (compatible Vercel)
export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });

  const apiKey  = process.env.LLM_API_KEY;
  const baseUrl = process.env.LLM_BASE_URL || 'https://api.groq.com/openai/v1';
  const model   = process.env.LLM_MODEL   || 'llama-3.3-70b-versatile';

  console.log('🔑 Clé API présente:', !!apiKey);
  console.log('🌐 Base URL:', baseUrl);
  console.log('🤖 Modèle:', model);

  if (!apiKey) {
    console.error('❌ LLM_API_KEY manquante !');
    return res.status(500).json({ error: 'LLM_API_KEY manquante dans Vercel Settings → Environment Variables' });
  }

  let body;
  try { body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body; }
  catch { return res.status(400).json({ error: 'JSON invalide' }); }

  const { system, messages } = body;
  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages doit être un tableau' });
  }

  const payload = {
    model,
    stream: false,
    temperature: 0.7,
    max_tokens: 2048,
    messages: [
      { role: 'system', content: system || 'Tu es un assistant utile.' },
      ...messages
    ]
  };

  console.log('📤 Envoi à Groq...', payload.messages.length, 'messages');

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000); // 20s max

    const upstream = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeout);

    console.log('📥 Réponse Groq status:', upstream.status);

    if (!upstream.ok) {
      const errText = await upstream.text();
      console.error('❌ Erreur Groq:', errText);
      return res.status(upstream.status).json({ error: `API [${upstream.status}]: ${errText.slice(0, 300)}` });
    }

    const data = await upstream.json();
    const reply = data.choices?.[0]?.message?.content || '';
    console.log('✅ Réponse OK, longueur:', reply.length);

    return res.status(200).json({ reply });
  } catch (error) {
    console.error('💥 Erreur fetch:', error.message);
    if (error.name === 'AbortError') {
      return res.status(504).json({ error: 'Timeout: Groq n\'a pas répondu en 20s' });
    }
    return res.status(502).json({ error: 'Erreur serveur: ' + error.message });
  }
}