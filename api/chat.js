// ✅ Vercel Edge Function (Streaming 100% fiable, bla buffering)
export const runtime = 'edge';

export default async function handler(request) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405, headers: { 'Content-Type': 'text/plain' } });
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: 'JSON invalide' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  const { system, messages } = body;

  const apiKey = process.env.LLM_API_KEY;
  const baseUrl = (process.env.LLM_BASE_URL || 'https://api.groq.com/openai/v1').replace(/\/$/, '');
  const model = process.env.LLM_MODEL || 'llama-3.3-70b-versatile';

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'LLM_API_KEY non configurée dans Vercel' }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }

  try {
    const upstream = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        stream: true,
        messages: [
          { role: 'system', content: system || 'Tu es un assistant utile.' },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 2048
      })
    });

    // Ila kan chi erreur f l'API (ex: clé ghalat), 7eydha w werriha l'frontend
    if (!upstream.ok) {
      const errText = await upstream.text();
      return new Response(JSON.stringify({ error: `Erreur API [${upstream.status}]: ${errText}` }), { 
        status: upstream.status, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // ✅ Hada howa l'fix : ndirfu l'flux direct l'frontend bla buffering!
    return new Response(upstream.body, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no' // Kaymna3 Vercel/Nginx men buffering
      }
    });

  } catch (error) {
    console.error('Fetch error:', error);
    return new Response(JSON.stringify({ error: 'Erreur serveur: ' + error.message }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}