// Netlify Function — proxy vers un modèle OpenAI-compatible
// Supporte : OpenAI, OpenRouter, Groq, DeepSeek, Together, etc.

export default async (req, context) => {
  // CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: corsHeaders() });
  }

  const apiKey = process.env.LLM_API_KEY;
  const baseUrl = process.env.LLM_BASE_URL || 'https://openrouter.ai/api/v1';
  const model = process.env.LLM_MODEL || 'openai/gpt-4o-mini';

  if (!apiKey) {
    return jsonResponse({ error: 'LLM_API_KEY non configurée sur Netlify' }, 500);
  }

  let body;
  try { body = await req.json(); }
  catch { return jsonResponse({ error: 'JSON invalide' }, 400); }

  const { system, messages } = body;
  if (!Array.isArray(messages)) {
    return jsonResponse({ error: 'messages doit être un tableau' }, 400);
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
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.URL || 'https://ined-buddy.netlify.app',
        'X-Title': 'INED Buddy'
      },
      body: JSON.stringify(payload)
    });

    if (!upstream.ok) {
      const errText = await upstream.text();
      return jsonResponse({ error: 'Erreur API', details: errText }, upstream.status);
    }

    // Streaming SSE : on retransmet tel quel au client
    return new Response(upstream.body, {
      headers: {
        ...corsHeaders(),
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });

  } catch (e) {
    return jsonResponse({ error: e.message }, 500);
  }
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };
}
function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' }
  });
}