export default function handler(req, res) {
  const token = process.env.HF_TOKEN;
  if (!token) return res.status(500).json({ error: 'HF_TOKEN not set' });
  res.status(200).json({ token });
}
