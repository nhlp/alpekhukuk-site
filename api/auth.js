// api/auth.js
export default async function handler(req, res) {
  const { url, query } = req;
  const baseUrl = `https://${req.headers.host}`;
  const client_id = process.env.GITHUB_CLIENT_ID;
  const client_secret = process.env.GITHUB_CLIENT_SECRET;

  // /api/auth → GitHub authorize
  if (url === '/api/auth' || url.startsWith('/api/auth?')) {
    const redirect_uri = `${baseUrl}/api/auth/callback`;
    const gh = new URL('https://github.com/login/oauth/authorize');
    gh.searchParams.set('client_id', client_id);
    gh.searchParams.set('redirect_uri', redirect_uri);
    gh.searchParams.set('scope', 'repo,user');
    res.setHeader('Cache-Control', 'no-store');
    return res.redirect(302, gh.toString());
  }

  // /api/auth/callback?code=...
  if (url.startsWith('/api/auth/callback')) {
    const code = query.code;
    if (!code) return res.status(400).send('Missing code');

    const r = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({ client_id, client_secret, code }),
    });
    const data = await r.json();
    if (!data.access_token) {
      return res
        .status(400)
        .send(`<pre>GitHub token alınamadı:\n${JSON.stringify(data, null, 2)}</pre>`);
    }

    const token = data.access_token;
    const html = `<!doctype html><html><body><script>
      try {
        var payload = 'authorization:github:success:' + JSON.stringify({ token: '${token}' });
        window.opener && window.opener.postMessage(payload, '*');
      } catch (e) { console.error(e); }
      window.close();
    </script>Giriş tamamlandı.</body></html>`;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).send(html);
  }

  res.status(404).send('Not found');
}
