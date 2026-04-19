export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const hfToken = process.env.HF_TOKEN;
  if (!hfToken) return res.status(500).json({ error: 'HF_TOKEN not configured on server' });

  const { human_img, garm_img, garment_des } = req.body;

  try {
    // Step 1: Submit job to HF IDM-VTON Space
    const submitRes = await fetch(
      'https://yisol-idm-vton.hf.space/queue/join',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${hfToken}`
        },
        body: JSON.stringify({
          data: [
            { background: human_img, layers: [], composite: null }, // human image dict
            { background: garm_img, layers: [], composite: null },  // garment image dict
            garment_des,  // garment description
            true,         // is_checked
            false,        // is_checked_crop
            30,           // denoise_steps
            42            // seed
          ],
          fn_index: 0,
          session_hash: Math.random().toString(36).slice(2)
        })
      }
    );

    if (!submitRes.ok) {
      const err = await submitRes.text();
      return res.status(502).json({ error: `HF submit failed: ${err}` });
    }

    const { event_id, session_hash } = await submitRes.json();

    // Step 2: Poll for result (max 55s to stay within Vercel 60s limit)
    const deadline = Date.now() + 55000;
    while (Date.now() < deadline) {
      await new Promise(r => setTimeout(r, 3000));

      const statusRes = await fetch(
        `https://yisol-idm-vton.hf.space/queue/status?session_hash=${session_hash}`,
        { headers: { 'Authorization': `Bearer ${hfToken}` } }
      );

      if (!statusRes.ok) continue;

      const statusData = await statusRes.json();

      if (statusData.status === 'complete' && statusData.output?.data?.[0]) {
        const output = statusData.output.data[0];
        // output can be a url string or object with url property
        const imageUrl = typeof output === 'string' ? output : output.url || output.path;
        return res.status(200).json({ output: imageUrl });
      }

      if (statusData.status === 'error') {
        return res.status(500).json({ error: statusData.output || 'HF processing failed' });
      }
    }

    return res.status(504).json({ error: 'Timed out. The AI is busy — please try again in a moment.' });

  } catch (err) {
    console.error('HF tryon error:', err);
    return res.status(500).json({ error: err.message || 'Something went wrong' });
  }
}
