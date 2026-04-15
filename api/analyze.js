export default async function handler(req, res) {
  // 1. Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;
  
  // 2. Securely grab your API key from Vercel's secret environment variables
  const apiKey = process.env.GEMINI_API_KEY; 

  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error: API key missing.' });
  }

  /**
   * 3. Updated Model Endpoint
   * Switched to gemini-2.5-flash-preview-09-2025 for better stability 
   * and to avoid 'High Demand' routing issues.
   */
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

  try {
    // 4. Send the request to Google
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        // Keeping temperature low (0.1) ensures the AI gives consistent code/JSON
        generationConfig: { 
          temperature: 0.1,
          topP: 0.95,
          topK: 40
        } 
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      // Handle Google's specific error messages (like High Demand or Rate Limit)
      const message = errData.error?.message || 'Failed to fetch from Google';
      return res.status(response.status).json({ error: message });
    }

    // 5. Send the successful data back to your frontend
    const data = await response.json();
    res.status(200).json(data);
    
  } catch (error) {
    // General error catching for network issues or timeouts
    res.status(500).json({ error: error.message });
  }
}
