export default async function handler(req, res) {

  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Block requests not coming from your website
  const origin = req.headers.origin || "";
  const allowedOrigins = [
    "https://www.dspcybersecurity.com",
    "https://dspcybersecurity.com"
  ];
  if (!allowedOrigins.includes(origin)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  // Set CORS headers so your GoDaddy site can call this
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Missing prompt" });
    }

    // Call Anthropic — key lives here on the server, never in the browser
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,  // stored in Vercel dashboard
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || "Anthropic API error" });
    }

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: "Server error. Please try again." });
  }
}
