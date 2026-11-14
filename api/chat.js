// api/chat.js — NON-STREAM (Edge, robuste)
export const runtime = 'edge';
export const maxDuration = 30;
const H = { 'Content-Type': 'application/json' };

export default async function handler(req) {
  if (req.method !== 'POST')
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: H });

  const apiKey  = process.env.LLM_API_KEY;
  const baseUrl = process.env.LLM_BASE_URL || 'https://api.groq.com/openai/v1';
  const model   = process.env.LLM_MODEL   || 'llama-3.3-70b-versatile';

  if (!apiKey)
    return new Response(JSON.stringify({ error: 'LLM_API_KEY non configurée dans Vercel (pas seulement .env local !)' }), { status: 500, headers: H });

  let body;
  try { body = await req.json(); }
  catch { return new Response(JSON.stringify({ error: 'JSON invalide' }), { status: 400, headers: H }); }

  const { system, messages } = body;
  if (!Array.isArray(messages))
    return new Response(JSON.stringify({ error: 'messages doit être un tableau' }), { status: 400, headers: H });

  try {
    const upstream = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        stream: false,                      // ⬅️ LE FIX : plus de SSE
        temperature: 0.7,
        max_tokens: 2048,
        messages: [{ role: 'system', content: system || 'Tu es un assistant utile.' }, ...messages],
      }),
      signal: AbortSignal.timeout(25000),
    });

    if (!upstream.ok) {
      const t = await upstream.text().catch(() => '');
      return new Response(JSON.stringify({ error: `API [${upstream.status}] : ${t.slice(0, 300)}` }), { status: upstream.status || 500, headers: H });
    }

    const data  = await upstream.json();
    const reply = data.choices?.[0]?.message?.content || '';
    return new Response(JSON.stringify({ reply }), { status: 200, headers: H });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Erreur serveur : ' + e.message }), { status: 502, headers: H });
  }
}