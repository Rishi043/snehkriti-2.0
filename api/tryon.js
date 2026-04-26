export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const hfToken = process.env.HF_TOKEN;
  if (!hfToken) return res.status(500).json({ error: 'HF_TOKEN not configured on server' });

  const { human_img, garm_img, garment_des } = req.body;
  const session_hash = Math.random().toString(36).slice(2);
  const BASE = 'https://yisol-idm-vton.hf.space';

  try {
    // Step 1: Upload human image (base64) to HF Space
    const humanBlob = Buffer.from(human_img.split(',')[1], 'base64');
    const humanForm = new FormData();
    humanForm.append('files', new Blob([humanBlob], { type: 'image/jpeg' }), 'human.jpg');

    const humanUpload = await fetch(`${BASE}/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${hfToken}` },
      body: humanForm
    });
    if (!humanUpload.ok) return res.status(502).json({ error: 'Failed to upload human image' });
    const [humanPath] = await humanUpload.json();

    // Step 2: Upload garment image (fetch from URL then upload)
    const garmFetch = await fetch(garm_img);
    const garmBuffer = Buffer.from(await garmFetch.arrayBuffer());
    const garmForm = new FormData();
    garmForm.append('files', new Blob([garmBuffer], { type: 'image/jpeg' }), 'garment.jpg');

    const garmUpload = await fetch(`${BASE}/upload`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${hfToken}` },
      body: garmForm
    });
    if (!garmUpload.ok) return res.status(502).json({ error: 'Failed to upload garment image' });
    const [garmPath] = await garmUpload.json();

    // Step 3: Queue the tryon job with correct FileData format
    const joinRes = await fetch(`${BASE}/queue/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${hfToken}`
      },
      body: JSON.stringify({
        fn_index: 2, // "tryon" function
        session_hash,
        data: [
          // human image as ImageEditor format
          { background: { path: humanPath, url: `${BASE}/file=${humanPath}`, meta: { _type: 'gradio.FileData' } }, layers: [], composite: null },
          // garment image as FileData
          { path: garmPath, url: `${BASE}/file=${garmPath}`, meta: { _type: 'gradio.FileData' } },
          garment_des, // description
          true,        // is_checked (auto-mask)
          false,       // is_checked_crop
          30,          // denoise_steps
          42           // seed
        ]
      })
    });

    if (!joinRes.ok) {
      const err = await joinRes.text();
      return res.status(502).json({ error: `Queue join failed: ${err}` });
    }

    return res.status(200).json({ session_hash });

  } catch (err) {
    console.error('tryon error:', err);
    return res.status(500).json({ error: err.message });
  }
}
