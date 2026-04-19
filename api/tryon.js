export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const hfToken = process.env.HF_TOKEN;
  if (!hfToken) return res.status(500).json({ error: 'HF_TOKEN not configured on server' });

  const { human_img, garm_img, garment_des } = req.body;
  const session_hash = Math.random().toString(36).slice(2);

  try {
    // Use Gradio API format for IDM-VTON on HF
    const submitRes = await fetch('https://yisol-idm-vton.hf.space/run/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${hfToken}`
      },
      body: JSON.stringify({
        data: [
          human_img,    // human image as base64
          garm_img,     // garment image as URL
          garment_des,  // garment description
          true,         // is_checked
          false,        // is_checked_crop
          30,           // denoise_steps
          42            // seed
        ]
      })
    });

    if (!submitRes.ok) {
      const err = await submitRes.text();
      // Try queue/join as fallback
      const joinRes = await fetch('https://yisol-idm-vton.hf.space/queue/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${hfToken}`
        },
        body: JSON.stringify({
          data: [human_img, garm_img, garment_des, true, false, 30, 42],
          fn_index: 0,
          session_hash
        })
      });
      if (!joinRes.ok) return res.status(502).json({ error: `HF Space unavailable: ${err}` });
      return res.status(200).json({ session_hash, mode: 'queue' });
    }

    const result = await submitRes.json();
    if (result.data?.[0]) {
      const output = result.data[0];
      const imageUrl = typeof output === 'string' ? output : (output.url || output.path);
      return res.status(200).json({ output: imageUrl, mode: 'direct' });
    }

    return res.status(200).json({ session_hash, mode: 'queue' });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
