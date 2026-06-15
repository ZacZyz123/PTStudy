import Anthropic from '@anthropic-ai/sdk'

export const CLAUDE_MODEL = 'claude-sonnet-4-6'

/** How many times to retry a call when the API is overloaded/rate-limited. */
const MAX_RETRIES = 4

let anthropicClient: Anthropic | null = null

/** Server-side Anthropic client (lazy so builds don't require the key). */
export function getAnthropic(): Anthropic {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      // SDK-level retries (exponential backoff + jitter) for transient errors,
      // including 429 rate limits and 529 "Overloaded".
      maxRetries: MAX_RETRIES,
      timeout: 120_000,
    })
  }
  return anthropicClient
}

/** True for transient errors worth retrying: overloaded, rate-limited, 5xx, or network. */
export function isOverloadError(err: unknown): boolean {
  if (err instanceof Anthropic.APIError) {
    const status = err.status
    return status === 429 || status === 529 || (typeof status === 'number' && status >= 500)
  }
  return (
    err instanceof Anthropic.APIConnectionError ||
    err instanceof Anthropic.APIConnectionTimeoutError
  )
}

/**
 * Run a streaming completion and return its text, retrying the whole call on
 * overload/rate-limit/5xx errors (these can also occur mid-stream, which the
 * SDK's per-request retry does not cover). Uses exponential backoff + jitter.
 */
export async function completeWithRetry(
  params: Anthropic.MessageStreamParams,
  maxRetries = MAX_RETRIES
): Promise<string> {
  let attempt = 0
  for (;;) {
    try {
      const stream = getAnthropic().messages.stream(params)
      const message = await stream.finalMessage()
      return message.content
        .filter((block) => block.type === 'text')
        .map((block) => (block as { text: string }).text)
        .join('')
    } catch (err) {
      attempt += 1
      if (attempt > maxRetries || !isOverloadError(err)) throw err
      const backoff = Math.min(1000 * 2 ** (attempt - 1), 16_000) + Math.random() * 400
      await new Promise((resolve) => setTimeout(resolve, backoff))
    }
  }
}


/* ---------- prompt builders ---------- */

export function studyGuidePrompt(rawText: string): string {
  return `You are an expert physical therapy educator at Mayo Clinic.
Create a comprehensive study guide for first-year DPT students based on this lecture.

Format in clean markdown:
- Overview (2-3 sentences)
- Key Concepts (clinical explanations)
- Anatomical Structures / Physiology
- Clinical Relevance & Patient Application
- Common Pathologies (if applicable)
- Assessment & Treatment Principles (if applicable)
- **Bold** the most exam-critical topics
- 5 Key Takeaways

Lecture content: ${rawText}`
}

export function flashcardsPrompt(rawText: string): string {
  return `You are an expert PT educator. Generate exactly 15 flashcards for DPT students.
Return ONLY a valid JSON array, no markdown, no extra text:
[{"front": "term or question", "back": "definition or answer"}]
Focus on: key terms, anatomy, clinical tests, pathologies, treatment principles.
Lecture content: ${rawText}`
}

export function quizPrompt(rawText: string): string {
  return `You are an expert PT educator at Mayo Clinic. Generate exactly 10 multiple choice questions for first-year DPT students.
Return ONLY a valid JSON array, no markdown, no extra text:
[{"question":"...","option_a":"...","option_b":"...","option_c":"...","option_d":"...","correct_answer":"A","explanation":"..."}]
Include scenario-based, clinical reasoning, and anatomical recall questions.
Lecture content: ${rawText}`
}

export function chatSystemPrompt(topic: string, rawText: string): string {
  return `You are Flex, an enthusiastic PT study assistant at Mayo Clinic PT School.
You specialize in ${topic} for first-year DPT students.
Keep answers concise, clinically accurate, with proper anatomical terminology.
Add one short encouraging sentence at the end of each response.
Only answer PT and lecture-related questions.
Lecture content: ${rawText}`
}

/**
 * Extract a JSON array from a model response, tolerating accidental
 * markdown fences or surrounding prose.
 */
export function parseJsonArray<T>(text: string): T[] {
  const trimmed = text.trim()
  try {
    const direct = JSON.parse(trimmed)
    if (Array.isArray(direct)) return direct as T[]
  } catch {
    // fall through to bracket extraction
  }
  const start = trimmed.indexOf('[')
  const end = trimmed.lastIndexOf(']')
  if (start === -1 || end === -1 || end <= start) {
    throw new Error('No JSON array found in model response')
  }
  const parsed = JSON.parse(trimmed.slice(start, end + 1))
  if (!Array.isArray(parsed)) throw new Error('Parsed JSON is not an array')
  return parsed as T[]
}
