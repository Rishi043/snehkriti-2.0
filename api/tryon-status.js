export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.REPLICATE_API_KEY || process.env.VITE_REPLICATE_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured on server' });

  const { id } = req.query;
  if (!id) return res.status(400).json({ error: 'Missing prediction id' });

  const response = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
    headers: { 'Authorization': `Token ${apiKey}` }
  });

  const data = await response.json();
  res.status(200).json({ status: data.status, output: data.output, error: data.error });
}
