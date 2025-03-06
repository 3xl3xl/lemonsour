export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }
  
  try {
    const { word } = req.body;  // Remove prompt from destructuring
    const API_KEY = process.env.GEMINI_API_KEY;
    
    if (!API_KEY) {
      return res.status(500).json({ error: 'API key not configured' });
    }
    
    const promptText = `英単語「${word}」の意味を日本語で説明してください。`;
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: promptText }]
          }]
        })
      }
    );
    
    if (!response.ok) {
      const errorData = await response.text();
      return res.status(response.status).json({ 
        error: `API Error: ${response.status}`,
        details: errorData 
      });
    }
    
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: error.message });
  }
}