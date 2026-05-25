// /api/analyse — Anthropic API proxy (key server-side only)
// Handles: AI sparring on digistiel.be + dashboard analysis panels

export default async (req) => {
  if (req.method !== 'POST') return new Response(JSON.stringify({error:'Method not allowed'}),{status:405,headers:{'Content-Type':'application/json'}});
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return new Response(JSON.stringify({error:'API key not configured'}),{status:500,headers:{'Content-Type':'application/json'}});
  let body;
  try { body = await req.json(); } catch { return new Response(JSON.stringify({error:'Invalid JSON'}),{status:400,headers:{'Content-Type':'application/json'}}); }
  const { prompt } = body;
  if (!prompt || typeof prompt !== 'string' || prompt.length > 8000) return new Response(JSON.stringify({error:'Invalid prompt'}),{status:400,headers:{'Content-Type':'application/json'}});
  try {
    const r = await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{'Content-Type':'application/json','x-api-key':apiKey,'anthropic-version':'2023-06-01'},
      body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:600,messages:[{role:'user',content:prompt}]})
    });
    if (!r.ok) return new Response(JSON.stringify({error:'Upstream error'}),{status:502,headers:{'Content-Type':'application/json'}});
    const data = await r.json();
    const text = data.content?.find(b=>b.type==='text')?.text ?? '';
    return new Response(JSON.stringify({text}),{status:200,headers:{'Content-Type':'application/json','Access-Control-Allow-Origin':'*','Cache-Control':'no-store'}});
  } catch(err) {
    return new Response(JSON.stringify({error:'Internal error'}),{status:500,headers:{'Content-Type':'application/json'}});
  }
};
export const config = { path: '/api/analyse' };
