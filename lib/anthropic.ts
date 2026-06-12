import Anthropic from '@anthropic-ai/sdk'

export const CLAUDE_MODEL = 'claude-sonnet-4-6'

let anthropicClient: Anthropic | null = null

/** Server-side Anthropic client (lazy so builds don't require the key). */
export function getAnthropic(): Anthropic {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return anthropicClient
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
