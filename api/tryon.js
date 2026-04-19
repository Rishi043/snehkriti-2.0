export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const hfToken = process.env.HF_TOKEN;
  if (!hfToken) return res.status(500).json({ error: 'HF_TOKEN not configured on server' });

  const { human_img, garm_img, garment_des } = req.body;
  const session_hash = Math.random().toString(36).slice(2);

  const submitRes = await fetch('https://yisol-idm-vton.hf.space/queue/join', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${hfToken}`
    },
    body: JSON.stringify({
      data: [
        { background: human_img, layers: [], composite: null },
        { background: garm_img, layers: [], composite: null },
        garment_des, true, false, 30, 42
      ],
      fn_index: 0,
      session_hash
    })
  });

  if (!submitRes.ok) {
    const err = await submitRes.text();
    return res.status(502).json({ error: `Submit failed: ${err}` });
  }

  return res.status(200).json({ session_hash });
}
