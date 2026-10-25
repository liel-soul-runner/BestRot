export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Use POST"
    });
  }

  const token = process.env.HF_TOKEN;

  if (!token) {
    return res.status(500).json({
      error: "HF_TOKEN is not configured in Vercel"
    });
  }

  const prompt = req.body?.prompt;

  if (
    typeof prompt !== "string" ||
    !prompt.trim() ||
    prompt.length > 3000
  ) {
    return res.status(400).json({
      error: "Enter a prompt up to 3000 characters"
    });
  }

  try {
    const response = await fetch(
      "https://router.huggingface.co/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "openai/gpt-oss-120b:cheapest",
          messages: [
            {
              role: "system",
              content:
                "You are BestRot, a creative short-video writer. Return a catchy hook, a short narration, and five scene descriptions for a vertical Brainrot-style video. Keep it original and suitable for a general audience."
            },
            {
              role: "user",
              content: prompt.trim()
            }
          ],
          max_tokens: 900,
          temperature: 0.8,
          stream: false
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error(
        "Hugging Face API error:",
        response.status
      );

      return res.status(502).json({
        error:
          "AI provider request failed. Check model availability and account quota."
      });
    }

    const result = data.choices?.[0]?.message?.content;

    if (!result) {
      return res.status(502).json({
        error: "The AI returned no text"
      });
    }

    return res.status(200).json({ result });
  } catch (error) {
    console.error("BestRot AI request failed");

    return res.status(500).json({
      error: "Could not reach the AI provider"
    });
  }
}
