// /api/auth.js  (Vercel Serverless Function)
// Gerekli ENV: GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, SITE_URL=https://www.alpekhukuk.com.tr

export default async function handler(req, res) {
  const SITE_URL = process.env.SITE_URL?.replace(/\/+$/, '') || 'https://www.alpekhukuk.com.tr';
  const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

  // Yardımcılar
  const redirectUri = `${SITE_URL}/api/auth/callback`;
  const html = (body) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(200).send(`<!doctype html><meta charset="utf-8">
      <style>body{font:14px/1.4 system-ui;margin:24px}</style>
      ${body}`);
  };

  // /api/auth  → GitHub'a yönlendir
  if (!req.url.includes('/callback')) {
    const authURL = new URL('https://github.com/login/oauth/authorize');
    authURL.searchParams.set('client_id', CLIENT_ID);
    authURL.searchParams.set('scope', 'repo,user');         // repo private istemiyorsan "public_repo,user"
    authURL.searchParams.set('allow_signup', 'false');
    authURL.searchParams.set('redirect_uri', redirectUri);

    res.writeHead(302, { Location: authURL.toString() });
    return res.end();
  }

  // /api/auth/callback?code=XYZ
  const code = req.query.code || req.query?.get?.('code');
  if (!code) {
    return html(`<p><b>Hata:</b> GitHub <code>code</code> yok.</p>`);
  }

  try {
    // Kodu token'la değiştir
    const ghRes = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        redirect_uri: redirectUri
      })
    });
    const data = await ghRes.json();

    if (!data.access_token) {
      return html(`<p><b>GitHub OAuth hatası:</b> ${escapeHtml(JSON.stringify(data))}</p>`);
    }

    // Token'ı üst pencereye gönder ve pencereyi kapat
    return html(`
      <p>Giriş tamamlandı. Bu pencere otomatik kapanacak.</p>
      <script>
        (function(){
          try {
            const payload = { token: ${JSON.stringify(data.access_token)}, provider: 'github' };
            window.opener && window.opener.postMessage(payload, ${JSON.stringify(SITE_URL)});
          } catch(e) {}
          setTimeout(function(){ window.close(); }, 50);
        })();
      </script>
    `);
  } catch (e) {
    return html(`<p><b>Sunucu hatası:</b> ${escapeHtml(String(e))}</p>`);
  }
}

function escapeHtml(s){return s.replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
