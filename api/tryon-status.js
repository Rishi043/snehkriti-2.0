export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const hfToken = process.env.HF_TOKEN;
  if (!hfToken) return res.status(500).json({ error: 'HF_TOKEN not configured on server' });

  const { session_hash } = req.query;
  if (!session_hash) return res.status(400).json({ error: 'Missing session_hash' });

  const statusRes = await fetch(
    `https://yisol-idm-vton.hf.space/queue/status?session_hash=${session_hash}`,
    { headers: { 'Authorization': `Bearer ${hfToken}` } }
  );

  if (!statusRes.ok) return res.status(502).json({ error: 'Status check failed' });

  const data = await statusRes.json();

  if (data.status === 'complete' && data.output?.data?.[0]) {
    const output = data.output.data[0];
    const imageUrl = typeof output === 'string' ? output : (output.url || output.path);
    return res.status(200).json({ status: 'complete', output: imageUrl });
  }

  if (data.status === 'error') {
    return res.status(200).json({ status: 'error', error: data.output || 'Processing failed' });
  }

  return res.status(200).json({ status: data.status, queue_position: data.queue_size });
}
