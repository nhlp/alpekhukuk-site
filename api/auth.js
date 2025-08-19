// api/auth.js
export default async function handler(req, res) {
  const { query, method, url } = req;
  const baseUrl = `https://${req.headers.host}`; // alpekhukuk.com.tr ile eşleşir
  const client_id = process.env.GITHUB_CLIENT_ID;
  const client_secret = process.env.GITHUB_CLIENT_SECRET;

  // 1) /api/auth => GitHub yetkilendirmesine yönlendir
  if (url.startsWith('/api/auth?') || url === '/api/auth') {
    const redirect_uri = `${baseUrl}/api/auth/callback`;
    const state = Math.random().toString(36).slice(2); // basit state

    const gh = new URL('https://github.com/login/oauth/authorize');
    gh.searchParams.set('client_id', client_id);
    gh.searchParams.set('redirect_uri', redirect_uri);
    gh.searchParams.set('scope', 'repo,user'); // read/write repo’ya gerek yoksa 'public_repo user:email' de olur
    gh.searchParams.set('state', state);

    res.setHeader('Cache-Control', 'no-store');
    return res.redirect(302, gh.toString());
  }

  // 2) /api/auth/callback?code=... => access_token al ve CMS'e gönder
  if (url.startsWith('/api/auth/callback')) {
    const code = query.code;
    if (!code) {
      return res.status(400).send('Missing code');
    }

    try {
      // GitHub’dan token al
      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id, client_secret, code }),
      });
      const data = await tokenRes.json();

      if (!data.access_token) {
        return res
          .status(400)
          .send(`<pre>GitHub token alınamadı:\n${JSON.stringify(data, null, 2)}</pre>`);
      }

      const token = data.access_token;

      // ↓↓↓ Decap’ın beklediği format: postMessage('authorization:github:success:' + JSON.stringify({token}), '*')
      const html = `<!doctype html><html><body>
<script>
  (function() {
    try {
      var payload = 'authorization:github:success:' + JSON.stringify({ token: '${token}' });
      window.opener && window.opener.postMessage(payload, '*');
    } catch (e) { console.error(e); }
    window.close();
  })();
</script>
Giriş tamamlandı. Bu pencere kapanabilir.
</body></html>`;

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      return res.status(200).send(html);
    } catch (e) {
      return res.status(500).send(String(e));
    }
  }

  // Diğer istekler
  res.status(404).send('Not found');
}
