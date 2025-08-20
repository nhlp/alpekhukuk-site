// api/auth.js
export default async function handler(req, res) {
  const host = req.headers.host;
  const baseUrl = `https://${host}`;
  const u = new URL(req.url, baseUrl);
  const path = u.pathname.replace(/\/+$/, "");
  const provider = u.searchParams.get("provider") || "github";
  const code = u.searchParams.get("code");

  const client_id = process.env.GITHUB_CLIENT_ID;
  const client_secret = process.env.GITHUB_CLIENT_SECRET;

  if (path === "/api/auth") {
    const url = new URL("https://github.com/login/oauth/authorize");
    url.searchParams.set("client_id", client_id);
    url.searchParams.set("redirect_uri", `${baseUrl}/api/auth/callback`);
    url.searchParams.set("scope", "repo");
    url.searchParams.set("allow_signup", "true");
    return res.redirect(302, url.toString());
  }

  if (path === "/api/auth/callback") {
    if (!code) return res.status(400).send("Missing code");
    const r = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ client_id, client_secret, code }),
    });
    const j = await r.json();
    if (!j.access_token) return res.status(400).send("token error: " + JSON.stringify(j));
    const token = j.access_token;

    const html = `<!doctype html><meta charset="utf-8">
      <script>
        try {
          var payload = 'authorization:${provider}:success:' + JSON.stringify({ token: '${token}' });
          window.opener && window.opener.postMessage(payload, '*');
        } catch(e) { console.error(e); }
        window.close();
      </script>Başarılı, pencere kapanabilir.`;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(html);
  }

  res.status(404).send("Not found");
}
