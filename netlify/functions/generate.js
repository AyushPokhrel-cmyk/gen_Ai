// netlify/functions/generate.js
export async function handler(event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const body = JSON.parse(event.body);
    const topic = body.topic?.trim();

    if (!topic) {
      return { statusCode: 400, body: JSON.stringify({ error: "Topic is required" }) };
    }

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY) {
      return { statusCode: 500, body: JSON.stringify({ error: "Server misconfigured: API key missing" }) };
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a friendly YouTube scriptwriter who writes Hinglish scripts for coding and tech topics. Start with 'Namaste doston!' and end with a call to action." },
          { role: "user", content: `Write a short Hinglish YouTube script about: ${topic}` }
        ]
      })
    });

    const data = await response.json();
    const output = data.choices?.[0]?.message?.content || "No output";

    return { statusCode: 200, body: JSON.stringify({ script: output }) };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
}
