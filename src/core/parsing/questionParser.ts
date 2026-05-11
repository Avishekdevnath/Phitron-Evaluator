import { Question } from '../../types/index'
import { OpenAIProvider } from '../providers/openaiProvider'
import { settingsService } from '../../services/settings/settingsService'

export interface QuestionParserService {
  parseQuestionsFromText(rawText: string, totalMarks: number): Promise<Question[]>
}

export class QuestionParserImpl implements QuestionParserService {
  async parseQuestionsFromText(rawText: string, totalMarks: number): Promise<Question[]> {
    // Get provider settings
    const settings = await settingsService.getProviderSettings()
    if (!settings.apiKey) {
      throw new Error('OpenAI API key is not configured. Please set it in Settings.')
    }

    const provider = new OpenAIProvider(settings.apiKey)

    // Test connection
    const connected = await provider.testConnection()
    if (!connected) {
      throw new Error('Failed to connect to OpenAI API. Check your API key.')
    }

    // Call OpenAI to parse questions
    const prompt = `You are an expert at extracting and structuring exam questions from raw text.

Given the following raw assignment text, extract all questions and return them as a JSON array.
Each question should have:
- number: the question number (e.g., "1", "2a", "3.1")
- title: a short title/label for the question
- prompt: the full question text
- maxMarks: estimated marks for this question (based on context clues like "10 marks", "[10]", etc.)

If marks are not specified, distribute them evenly. The total of all maxMarks should equal ${totalMarks}.

Raw Assignment Text:
${rawText}

Return ONLY a valid JSON array of question objects. Example format:
[
  {
    "number": "1",
    "title": "Photosynthesis",
    "prompt": "Explain the process of photosynthesis in plants.",
    "maxMarks": 10
  },
  {
    "number": "2",
    "title": "Respiration",
    "prompt": "What is cellular respiration?",
    "maxMarks": 5
  }
]`

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${settings.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo',
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.3,
          response_format: { type: 'json_object' },
        }),
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`)
      }

      const data = await response.json()
      const content = data.choices[0].message.content

      // Parse the JSON response
      let parsed: any
      try {
        // Try parsing as JSON array directly
        parsed = JSON.parse(content)
      } catch {
        // Try extracting JSON from markdown code blocks
        const jsonMatch = content.match(/```(?:json)?\s*(\[[\s\S]*?\])\s*```/)
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[1])
        } else {
          throw new Error('Invalid JSON response from OpenAI')
        }
      }

      // Ensure it's an array
      if (!Array.isArray(parsed)) {
        throw new Error('Expected array of questions')
      }

      // Validate and transform questions
      const questions: Question[] = parsed.map((q: any, index: number) => ({
        id: `q-${Date.now()}-${index}`,
        number: String(q.number || index + 1),
        title: String(q.title || `Question ${q.number || index + 1}`),
        prompt: String(q.prompt || ''),
        maxMarks: Math.max(1, Math.min(totalMarks, Number(q.maxMarks) || 5)),
      }))

      // Adjust marks to match total if needed
      const currentTotal = questions.reduce((sum, q) => sum + q.maxMarks, 0)
      if (currentTotal !== totalMarks && questions.length > 0) {
        const difference = totalMarks - currentTotal
        const perQuestion = difference / questions.length
        questions.forEach(q => {
          q.maxMarks = Math.max(1, q.maxMarks + Math.round(perQuestion))
        })
        // Fix rounding errors
        const newTotal = questions.reduce((sum, q) => sum + q.maxMarks, 0)
        if (newTotal !== totalMarks && questions.length > 0) {
          questions[0].maxMarks += totalMarks - newTotal
        }
      }

      return questions
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to parse questions: ${error.message}`)
      }
      throw error
    }
  }
}

export const questionParser = new QuestionParserImpl()
