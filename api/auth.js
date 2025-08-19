// /api/auth.js
export default async function handler(req, res) {
  const SITE_URL = (process.env.SITE_URL || 'https://www.alpekhukuk.com.tr').replace(/\/+$/,'');
  const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
  const redirectUri = `${SITE_URL}/api/auth/callback`;

  const sendHtml = (html) => {
    res.setHeader('Content-Type','text/html; charset=utf-8');
    res.status(200).send(`<!doctype html><meta charset="utf-8"><style>body{font:14px system-ui;margin:24px}</style>${html}`);
  };

  if (!req.url.includes('/callback')) {
    const u = new URL('https://github.com/login/oauth/authorize');
    u.searchParams.set('client_id', CLIENT_ID);
    u.searchParams.set('scope', 'repo,user'); // <-- kapsam
    u.searchParams.set('allow_signup','false');
    u.searchParams.set('redirect_uri', redirectUri);
    res.writeHead(302, { Location: u.toString() });
    return res.end();
  }

  const code = req.query.code;
  if (!code) return sendHtml('<p><b>Hata:</b> code yok.</p>');

  try {
    const r = await fetch('https://github.com/login/oauth/access_token', {
      method:'POST',
      headers:{ 'Accept':'application/json', 'Content-Type':'application/json' },
      body: JSON.stringify({ client_id: CLIENT_ID, client_secret: CLIENT_SECRET, code, redirect_uri: redirectUri })
    });
    const data = await r.json();

    if (!data.access_token) {
      return sendHtml(`<p><b>GitHub OAuth hatası:</b> ${escapeHtml(JSON.stringify(data))}</p>`);
    }

    return sendHtml(`
      <p>Giriş tamamlandı. Pencere kapanacak…</p>
      <script>
        (function(){
          var token = ${JSON.stringify(data.access_token)};
          try { window.opener && window.opener.postMessage('authorization:github:success:' + token, '*'); } catch(e){}
          try { window.opener && window.opener.postMessage({ token: token, provider: 'github' }, '*'); } catch(e){}
          try { window.opener && window.opener.postMessage('authorization:github:success:' + JSON.stringify({token: token}), '*'); } catch(e){}
          setTimeout(function(){ window.close(); }, 120);
        })();
      </script>
    `);
  } catch (e) {
    return sendHtml(`<p><b>Sunucu hatası:</b> ${escapeHtml(String(e))}</p>`);
  }
}

function escapeHtml(s){return String(s).replace(/[&<>"]/g,c=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[c]));}
