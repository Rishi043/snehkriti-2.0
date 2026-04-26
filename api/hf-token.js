export default function handler(req, res) {
  const token = process.env.HF_TOKEN;
  const backup = process.env.HF_TOKEN_BACKUP;
  const backup2 = process.env.HF_TOKEN_BACKUP2;
  if (!token) return res.status(500).json({ error: 'HF_TOKEN not set' });
  res.status(200).json({ token, backup: backup || '', backup2: backup2 || '' });
}
