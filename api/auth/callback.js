// /api/auth/callback  → GitHub code'u access_token'a çevirir ve Decap'e postMessage ile iletir
module.exports = async (req, res) => {
  const ORIGIN = process.env.SITE_ORIGIN || `https://${req.headers.host}`;
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  // CORS (ihtiyaten)
  res.setHeader('Access-Control-Allow-Origin', ORIGIN);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const url = new URL(req.url, ORIGIN);
  const code = url.searchParams.get('code');
  if (!code) return res.status(400).json({ error: 'Missing code' });

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

  // XSS güvenliği için '<' kaçır
  const safe = JSON.stringify({ token: data.access_token }).replace(/</g, '\\u003c');

  // Decap CMS beklediği şekilde token'ı üst pencereye postMessage ederek gönder
  const html = `<!doctype html>
<html><body>
<script>
(function() {
  try {
    if (window.opener && window.opener.postMessage) {
      window.opener.postMessage('authorization:github:success:${safe}', '*');
    }
  } catch (e) {}
  window.close();
})();
</script>
Giriş tamamlandı. Bu pencere otomatik kapanacaktır.
</body></html>`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).end(html);
};
