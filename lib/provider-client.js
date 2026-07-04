const GROQ_URL = process.env.GROQ_BASE_URL ?? "https://api.groq.com/openai/v1/chat/completions";
const NIM_URL =
  process.env.NVIDIA_NIM_BASE_URL ?? "https://integrate.api.nvidia.com/v1/chat/completions";

function buildPrompt({ scenario, question, analysis, recommendation }) {
  return [
    `Scenario: ${scenario.title} (${scenario.ward}, ${scenario.domain})`,
    `Question: ${question}`,
    `Risk score: ${scenario.riskScore}`,
    `Forecast window: ${scenario.forecastWindowHours}h`,
    `Primary signal: ${scenario.primarySignal}`,
    `Analysis: ${analysis?.answer ?? ""}`,
    `Recommendation: ${recommendation?.title ?? scenario.action}`,
    `Impact: ${scenario.summary}`
  ].join("\n");
}

async function postChatCompletion({ url, apiKey, model, messages }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(url, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.2,
        max_tokens: 320
      })
    });

    if (!response.ok) {
      throw new Error(`LLM request failed with ${response.status}`);
    }

    const payload = await response.json();
    return payload?.choices?.[0]?.message?.content?.trim() ?? "";
  } finally {
    clearTimeout(timer);
  }
}

export async function enrichWithProviders({ scenario, question, analysis, recommendation }) {
  const prompt = buildPrompt({ scenario, question, analysis, recommendation });
  const providerStatus = {
    groq: Boolean(process.env.GROQ_API_KEY),
    nim: Boolean(process.env.NVIDIA_NIM_API_KEY)
  };

  if (providerStatus.groq) {
    try {
      const narrative = await postChatCompletion({
        url: GROQ_URL,
        apiKey: process.env.GROQ_API_KEY,
        model: process.env.GROQ_MODEL ?? "llama-3.1-70b-versatile",
        messages: [
          {
            role: "system",
            content:
              "You write concise civic decision intelligence summaries with clear actions and no hype."
          },
          { role: "user", content: prompt }
        ]
      });

      if (narrative) {
        return {
          providerStatus,
          narrative,
          source: "groq"
        };
      }
    } catch {
      // Fall through to NIM or local logic.
    }
  }

  if (providerStatus.nim) {
    try {
      const narrative = await postChatCompletion({
        url: NIM_URL,
        apiKey: process.env.NVIDIA_NIM_API_KEY,
        model: process.env.NVIDIA_NIM_MODEL ?? "meta/llama-3.1-70b-instruct",
        messages: [
          {
            role: "system",
            content:
              "You write concise civic decision intelligence summaries with clear actions and no hype."
          },
          { role: "user", content: prompt }
        ]
      });

      if (narrative) {
        return {
          providerStatus,
          narrative,
          source: "nim"
        };
      }
    } catch {
      // Fall through to local logic.
    }
  }

  return {
    providerStatus,
    narrative: "",
    source: "local"
  };
}

