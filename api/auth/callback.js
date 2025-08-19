// Vercel Serverless Function: /api/auth/callback  → code'u token'a çevirir
module.exports = async (req, res) => {
  const ORIGIN = process.env.SITE_ORIGIN || `https://${req.headers.host}`;
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  // CORS
  res.setHeader('Access-Control-Allow-Origin', ORIGIN);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const url = new URL(req.url, ORIGIN);
  const code = url.searchParams.get('code');
  if (!code) return res.status(400).json({ error: 'Missing code' });

  // GitHub token isteği (Node 18+ native fetch)
  const ghRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: `${ORIGIN}/api/auth/callback`,
    }),
  });
  const data = await ghRes.json();

  if (!data.access_token) {
    return res.status(400).json({ error: 'No token', details: data });
  }

  res.setHeader('Content-Type', 'application/json');
  res.status(200).end(JSON.stringify({ token: data.access_token }));
};
