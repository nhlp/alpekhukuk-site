// Vercel Serverless Function: /api/auth  → GitHub authorize’a yönlendirir
module.exports = async (req, res) => {
  const ORIGIN = process.env.SITE_ORIGIN || `https://${req.headers.host}`;
  const clientId = process.env.GITHUB_CLIENT_ID;

  // CORS (ihtiyaten)
  res.setHeader('Access-Control-Allow-Origin', ORIGIN);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const redirectUri = `${ORIGIN}/api/auth/callback`;
  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('scope', 'repo,user:email');

  res.writeHead(302, { Location: url.toString() }).end();
};
