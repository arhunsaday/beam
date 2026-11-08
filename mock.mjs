// Dev-only stand-in for ntfy: logs what it receives. `node mock.mjs` then set Server to http://localhost:8787
import http from 'node:http';
const DELAY = +(process.env.DELAY || 0);
http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT');
  if (req.method === 'OPTIONS') return res.end();
  let size = 0, body = '';
  req.on('data', (c) => { size += c.length; if (body.length < 200) body += c; });
  req.on('end', () => {
    const u = new URL(req.url, 'http://x');
    const h = Object.fromEntries(['title', 'click', 'tags', 'filename', 'message', 'authorization'].filter((k) => req.headers[k]).map((k) => [k, req.headers[k]]));
    console.log(JSON.stringify({ method: req.method, topic: u.pathname.slice(1), query: Object.fromEntries(u.searchParams), headers: h, size, body: req.method === 'PUT' ? `<${size} bytes>` : body }));
    res.setHeader('Content-Type', 'application/json');
    setTimeout(() => res.end(JSON.stringify({ id: 'mock', event: 'message' })), DELAY);
  });
}).listen(8787, () => console.log('mock ntfy on :8787'));
