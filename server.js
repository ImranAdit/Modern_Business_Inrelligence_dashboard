const express = require('express');
const path = require('path');
const crypto = require('crypto');
const session = require('express-session');
const { OAuth2Client } = require('google-auth-library');

const app = express();
const PORT = process.env.PORT || 3000;

const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,       // optional override, e.g. https://your-app.up.railway.app/auth/google/callback
  SESSION_SECRET,
  ALLOWED_EMAIL_DOMAIN = 'adit.com',
} = process.env;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.warn('WARNING: GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are not set — login will not work.');
}
if (!SESSION_SECRET) {
  console.warn('WARNING: SESSION_SECRET is not set — using an insecure default. Set it in Railway variables.');
}

// Railway sits behind a proxy/load balancer; this is required for secure cookies to work.
app.set('trust proxy', 1);

app.use(session({
  secret: SESSION_SECRET || 'insecure-dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: true,       // Railway serves everything over HTTPS
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 12, // 12 hours
  },
}));

function getRedirectUri(req) {
  return GOOGLE_REDIRECT_URI || `${req.protocol}://${req.get('host')}/auth/google/callback`;
}

function oauthClient(req) {
  return new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, getRedirectUri(req));
}

function accessDeniedPage(email) {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Access restricted — DataPulse</title>
  <style>body{background:#070d1a;color:#dce6f5;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0}
  .card{max-width:420px;text-align:center;padding:36px;border:1px solid rgba(255,255,255,.1);border-radius:14px;background:#0e1624}
  h2{color:#e05c7a;margin-bottom:10px}p{color:#7a92b4;font-size:14px;line-height:1.6}
  a{color:#e8c96a;text-decoration:none}a:hover{text-decoration:underline}</style></head>
  <body><div class="card"><h2>Access restricted</h2>
  <p>DataPulse is only available to <b>@${ALLOWED_EMAIL_DOMAIN}</b> accounts.</p>
  <p>You signed in as <b>${email || 'an unknown account'}</b>.</p>
  <p><a href="/auth/google">Try a different account</a></p></div></body></html>`;
}

// ───────────────── Auth routes (no auth required) ─────────────────

app.get('/login.html', (req, res) => {
  if (req.session.user) return res.redirect('/');
  res.sendFile(path.join(__dirname, 'login.html'));
});

app.get('/auth/google', (req, res) => {
  const client = oauthClient(req);
  const state = crypto.randomBytes(16).toString('hex');
  req.session.oauthState = state;
  const url = client.generateAuthUrl({
    access_type: 'online',
    scope: ['openid', 'email', 'profile'],
    hd: ALLOWED_EMAIL_DOMAIN, // hints Google's picker; the real check happens below on callback
    prompt: 'select_account',
    state,
  });
  res.redirect(url);
});

app.get('/auth/google/callback', async (req, res) => {
  try {
    const { code, state } = req.query;
    if (!code || !state || state !== req.session.oauthState) {
      return res.status(400).send('Login attempt expired or invalid. <a href="/auth/google">Try again</a>.');
    }
    delete req.session.oauthState;

    const client = oauthClient(req);
    const { tokens } = await client.getToken(code);
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = (payload.email || '').toLowerCase();
    const domain = email.split('@')[1];

    // Server-side domain check — this is the actual access control, not the `hd` hint above.
    if (!payload.email_verified || domain !== ALLOWED_EMAIL_DOMAIN.toLowerCase()) {
      return res.status(403).send(accessDeniedPage(email));
    }

    req.session.user = {
      email,
      name: payload.name || email,
      picture: payload.picture || null,
    };
    res.redirect('/');
  } catch (err) {
    console.error('OAuth callback error:', err);
    res.status(500).send('Something went wrong during login. <a href="/auth/google">Try again</a>.');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login.html'));
});

app.get('/me', (req, res) => {
  res.json({ user: req.session.user || null });
});

// ───────────────── Everything below requires login ─────────────────

app.use((req, res, next) => {
  if (req.session.user) return next();
  res.redirect('/login.html');
});

app.use(express.static(path.join(__dirname)));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`DataPulse BI running on port ${PORT}`);
});
