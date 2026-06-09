import { db } from "@/db/client";
import { getOpenRouterKey } from "@/services/secrets";
import { useSettingsStore } from "@/store/settingsStore";
import * as Crypto from "expo-crypto";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_AUTH_URL = "https://openrouter.ai/api/v1/auth/key";

// --- error type ----------------------------------------------------------

export type AiErrorCode =
  | "MISSING_KEY"
  | "INVALID_RESPONSE"
  | "PROVIDER_ERROR"
  | "NETWORK_ERROR";

export class AiError extends Error {
  code: AiErrorCode;
  constructor(code: AiErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = "AiError";
  }
}

// `instanceof AiError` can return false after Metro fast-refresh because two
// copies of the class end up in memory. Match by name+code as a safety net.
export function isAiError(err: unknown): err is AiError {
  if (err instanceof AiError) return true;
  return (
    typeof err === "object" &&
    err !== null &&
    "name" in err &&
    (err as { name: unknown }).name === "AiError" &&
    "code" in err &&
    typeof (err as { code: unknown }).code === "string"
  );
}

// --- prompts -------------------------------------------------------------

const SYSTEM_PROMPT =
  "You are a precise code review assistant. ALWAYS respond with valid JSON only — no markdown fences, no commentary outside the JSON object. Match the requested schema exactly.";

function buildMessages(snippet: Snippet, kind: AiKind) {
  const code = snippet.code;
  const lang = snippet.language;

  const user =
    kind === "explain"
      ? `Explain the following ${lang} code. Return ONLY a JSON object matching this schema:
{
  "explanation": "step-by-step explanation of what the code does",
  "summary": "one short sentence summarizing the code",
  "suggestions": ["short actionable improvement", "..."]
}

---CODE---
${code}
---END CODE---`
      : `Suggest improvements to the following ${lang} code and provide the improved version. Return ONLY a JSON object matching this schema:
{
  "summary": "one short sentence describing what changed",
  "improvedCode": "the complete improved code that should replace the original",
  "notes": ["bullet describing one specific change", "..."]
}

The improvedCode field MUST contain runnable ${lang} code. Do not include markdown fences inside the JSON string values.

---CODE---
${code}
---END CODE---`;

  return [
    { role: "system" as const, content: SYSTEM_PROMPT },
    { role: "user" as const, content: user },
  ];
}

// --- JSON parsing --------------------------------------------------------

// Parses the model's response defensively. Free models often add preambles
// ("Here is the JSON: ...") or omit code fences inconsistently, so we try
// three strategies before giving up.
function parseJsonResponse(raw: string): unknown {
  const trimmed = raw.trim();

  // 1) Direct parse — the model honored "JSON only".
  try {
    return JSON.parse(trimmed);
  } catch {
    // fall through
  }

  // 2) Strip ```json / ``` fences if the WHOLE thing is fenced.
  const unfenced = trimmed
    .replace(/^```(?:json)?\s*\n?/i, "")
    .replace(/\n?```\s*$/i, "")
    .trim();
  if (unfenced !== trimmed) {
    try {
      return JSON.parse(unfenced);
    } catch {
      // fall through
    }
  }

  // 3) Pluck the largest {...} span out of the text (handles preambles).
  const first = trimmed.indexOf("{");
  const last = trimmed.lastIndexOf("}");
  if (first >= 0 && last > first) {
    try {
      return JSON.parse(trimmed.slice(first, last + 1));
    } catch {
      // fall through
    }
  }

  throw new AiError(
    "INVALID_RESPONSE",
    `Model did not return valid JSON. Preview: ${trimmed.slice(0, 120)}`,
  );
}

function validateExplain(value: unknown): AiExplainContent {
  const v = value as Partial<AiExplainContent>;
  if (
    typeof v?.explanation !== "string" ||
    typeof v?.summary !== "string" ||
    !Array.isArray(v?.suggestions)
  ) {
    throw new AiError("INVALID_RESPONSE", "Explain JSON missing fields.");
  }
  return {
    explanation: v.explanation,
    summary: v.summary,
    suggestions: v.suggestions.filter(
      (s): s is string => typeof s === "string",
    ),
  };
}

function validateImprove(value: unknown): AiImproveContent {
  const v = value as Partial<AiImproveContent>;
  if (
    typeof v?.summary !== "string" ||
    typeof v?.improvedCode !== "string" ||
    !Array.isArray(v?.notes)
  ) {
    throw new AiError("INVALID_RESPONSE", "Improve JSON missing fields.");
  }
  return {
    summary: v.summary,
    improvedCode: v.improvedCode,
    notes: v.notes.filter((n): n is string => typeof n === "string"),
  };
}

// --- OpenRouter HTTP -----------------------------------------------------

type Message = { role: "system" | "user"; content: string };

async function callOpenRouter(
  model: string,
  key: string,
  messages: Message[],
): Promise<string> {
  let res: Response;
  try {
    res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "X-Title": "DevSnippets AI",
      },
      body: JSON.stringify({ model, messages }),
    });
  } catch (e) {
    throw new AiError(
      "NETWORK_ERROR",
      e instanceof Error ? e.message : "Network request failed",
    );
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new AiError(
      "PROVIDER_ERROR",
      `OpenRouter ${res.status}: ${body.slice(0, 200)}`,
    );
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = data.choices?.[0]?.message?.content;
  if (typeof content !== "string" || content.length === 0) {
    throw new AiError("INVALID_RESPONSE", "Empty response from model.");
  }
  return content;
}

// --- public: generate + history ------------------------------------------

const rowToGeneration = (row: AiGenerationRow): AiGeneration => ({
  id: row.id,
  snippetId: row.snippet_id,
  kind: row.kind,
  content: JSON.parse(row.content) as AiContent,
  model: row.model,
  createdAt: row.created_at,
});

export async function generate(
  snippet: Snippet,
  kind: AiKind,
): Promise<AiGeneration> {
  const key = await getOpenRouterKey();
  if (!key) throw new AiError("MISSING_KEY", "No OpenRouter API key set.");

  const model = useSettingsStore.getState().aiModel;
  const responseText = await callOpenRouter(
    model,
    key,
    buildMessages(snippet, kind),
  );

  const parsed = parseJsonResponse(responseText);
  const content: AiContent =
    kind === "explain" ? validateExplain(parsed) : validateImprove(parsed);

  const gen: AiGeneration = {
    id: Crypto.randomUUID(),
    snippetId: snippet.id,
    kind,
    content,
    model,
    createdAt: Date.now(),
  };

  await db.runAsync(
    `INSERT INTO ai_generations (id, snippet_id, kind, content, model, created_at)
     VALUES ($id, $sid, $kind, $content, $model, $created)`,
    {
      $id: gen.id,
      $sid: snippet.id,
      $kind: kind,
      $content: JSON.stringify(content),
      $model: model,
      $created: gen.createdAt,
    },
  );

  return gen;
}

export async function latestGeneration(
  snippetId: string,
  kind: AiKind,
): Promise<AiGeneration | null> {
  const row = await db.getFirstAsync<AiGenerationRow>(
    `SELECT * FROM ai_generations
     WHERE snippet_id = $sid AND kind = $kind
     ORDER BY created_at DESC LIMIT 1`,
    { $sid: snippetId, $kind: kind },
  );
  return row ? rowToGeneration(row) : null;
}

export async function listGenerations(
  snippetId: string,
): Promise<AiGeneration[]> {
  const rows = await db.getAllAsync<AiGenerationRow>(
    `SELECT * FROM ai_generations WHERE snippet_id = $sid ORDER BY created_at DESC`,
    { $sid: snippetId },
  );
  return rows.map(rowToGeneration);
}

export async function deleteGeneration(id: string): Promise<void> {
  await db.runAsync("DELETE FROM ai_generations WHERE id = $id", { $id: id });
}

// --- key validation ------------------------------------------------------

// Cheap call to confirm the key works — used by the Settings "Validate" button.
export async function validateOpenRouterKey(key: string): Promise<boolean> {
  try {
    const res = await fetch(OPENROUTER_AUTH_URL, {
      headers: { Authorization: `Bearer ${key.trim()}` },
    });
    return res.ok;
  } catch {
    return false;
  }
}
