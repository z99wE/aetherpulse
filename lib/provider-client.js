import { GoogleAuth } from "google-auth-library";
import { memoizeValue } from "./ttl-cache.js";

const VERTEX_URL_BASE = "https://aiplatform.googleapis.com/v1";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models";
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

async function postVertexCompletion({ projectId, location, model, prompt }) {
  const auth = new GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/cloud-platform"]
  });
  const client = await auth.getClient();
  const accessTokenResponse = await client.getAccessToken();
  const accessToken = typeof accessTokenResponse === "string" ? accessTokenResponse : accessTokenResponse?.token;
  if (!accessToken) {
    throw new Error("Vertex access token unavailable");
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);

  try {
    const url = `${VERTEX_URL_BASE}/projects/${projectId}/locations/${location}/publishers/google/models/${model}:generateContent`;
    const response = await fetch(url, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ],
        systemInstruction: {
          parts: [
            {
              text:
                "You write concise civic decision intelligence summaries with clear actions and no hype."
            }
          ]
        },
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 320
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Vertex request failed with ${response.status}`);
    }

    const payload = await response.json();
    const parts = payload?.candidates?.[0]?.content?.parts ?? [];
    return parts.map((part) => part.text || "").join("").trim();
  } finally {
    clearTimeout(timer);
  }
}

async function postGeminiCompletion({ apiKey, model, prompt }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(`${GEMINI_URL}/${model}:generateContent?key=${apiKey}`, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text:
                "You write concise civic decision intelligence summaries with clear actions and no hype."
            }
          ]
        },
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 320
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini request failed with ${response.status}`);
    }

    const payload = await response.json();
    const parts = payload?.candidates?.[0]?.content?.parts ?? [];
    return parts.map((part) => part.text || "").join("").trim();
  } finally {
    clearTimeout(timer);
  }
}

export async function enrichWithProviders({ scenario, question, analysis, recommendation }) {
  const prompt = buildPrompt({ scenario, question, analysis, recommendation });
  const providerStatus = {
    vertex: Boolean(process.env.VERTEX_PROJECT_ID && process.env.VERTEX_LOCATION && process.env.VERTEX_MODEL),
    gemini: Boolean(process.env.GEMINI_API_KEY),
    groq: Boolean(process.env.GROQ_API_KEY),
    nim: Boolean(process.env.NVIDIA_NIM_API_KEY)
  };

  const routing = String(process.env.MODEL_ROUTING || "vertex,gemini,groq,nim,local")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  const cacheKey = [
    scenario.id,
    question,
    analysis?.answer ?? "",
    recommendation?.title ?? "",
    routing.join("|")
  ].join("::");

  return memoizeValue(
    cacheKey,
    async () => {
      for (const provider of routing) {
        try {
          if (provider === "vertex" && providerStatus.vertex) {
            const narrative = await postVertexCompletion({
              projectId: process.env.VERTEX_PROJECT_ID,
              location: process.env.VERTEX_LOCATION,
              model: process.env.VERTEX_MODEL,
              prompt
            });
            if (narrative) {
              return { providerStatus, narrative, source: "vertex", routedBy: "vertex" };
            }
          }

          if (provider === "gemini" && providerStatus.gemini) {
            const narrative = await postGeminiCompletion({
              apiKey: process.env.GEMINI_API_KEY,
              model: process.env.GEMINI_MODEL ?? "gemini-2.0-flash",
              prompt
            });
            if (narrative) {
              return { providerStatus, narrative, source: "gemini", routedBy: "gemini" };
            }
          }

          if (provider === "groq" && providerStatus.groq) {
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
              return { providerStatus, narrative, source: "groq", routedBy: "groq" };
            }
          }

          if (provider === "nim" && providerStatus.nim) {
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
              return { providerStatus, narrative, source: "nim", routedBy: "nim" };
            }
          }
        } catch {
          // Keep trying the next provider.
        }
      }

      return {
        providerStatus,
        narrative: "",
        source: "local",
        routedBy: "local"
      };
    },
    120_000
  );
}

export function getProviderStatus() {
  return {
    vertex: Boolean(process.env.VERTEX_PROJECT_ID && process.env.VERTEX_LOCATION && process.env.VERTEX_MODEL),
    gemini: Boolean(process.env.GEMINI_API_KEY),
    groq: Boolean(process.env.GROQ_API_KEY),
    nim: Boolean(process.env.NVIDIA_NIM_API_KEY)
  };
}
