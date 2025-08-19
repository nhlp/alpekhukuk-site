// api/auth.js  — Vercel Serverless GitHub OAuth for Decap
const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));

const clientId = process.env.GITHUB_CLIENT_ID;
const clientSecret = process.env.GITHUB_CLIENT_SECRET;

// site origin'in — zorunlu değil ama CORS için iyi
const ORIGIN = process.env.SITE_ORIGIN || 'https://www.alpekhukuk.com.tr';

module.exports = async (req, res) => {
  // CORS (Decap paneli ile API aynı origin’de ama yine de güvenli)
  res.setHeader('Access-Control-Allow-Origin', ORIGIN);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  // /api/auth  → GitHub'a yönlendir
  if (!req.url.includes('callback')) {
    const redirectUri = `${ORIGIN}/api/auth/callback`;
    const url = new URL('https://github.com/login/oauth/authorize');
    url.searchParams.set('client_id', clientId);
    url.searchParams.set('redirect_uri', redirectUri);
    url.searchParams.set('scope', 'repo,user:email');
    return res.writeHead(302, { Location: url.toString() }).end();
  }

  // /api/auth/callback?code=...
  const code = new URL(req.url, ORIGIN).searchParams.get('code');
  if (!code) return res.status(400).json({ error: 'Missing code' });

  // Token al
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: `${ORIGIN}/api/auth/callback`,
    }),
  });
  const data = await tokenRes.json();

  if (!data.access_token) {
    return res.status(400).json({ error: 'No token', details: data });
  }

  // Decap bu formatı bekler
  res.setHeader('Content-Type', 'application/json');
  return res.status(200).end(JSON.stringify({ token: data.access_token }));
};
