export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Missing url' });
  const response = await fetch(url);
  if (!response.ok) return res.status(502).json({ error: 'Failed to fetch image' });
  const buffer = await response.arrayBuffer();
  const contentType = response.headers.get('content-type') || 'image/jpeg';
  res.setHeader('Content-Type', contentType);
  res.send(Buffer.from(buffer));
}
