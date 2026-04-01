export default async function handler(req, res) {
  // 1. Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;
  
  // 2. Securely grab your API key from Vercel's secret environment variables!
  const apiKey = process.env.GEMINI_API_KEY; 

  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error: API key missing.' });
  }

  // 3. Set up the Google Gemini API endpoint
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  try {
    // 4. Send the request to Google
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        // Keep temperature low for structured JSON and code generation
        generationConfig: { temperature: 0.1 } 
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.message || 'Failed to fetch from Google');
    }

    // 5. Send the successful data back to your frontend
    const data = await response.json();
    res.status(200).json(data);
    
  } catch (error) {
    // Catch any errors and pass them to the frontend to display
    res.status(500).json({ error: error.message });
  }
}