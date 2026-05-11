import { AIProvider, EvaluationPromptInput } from './providerInterface'
import { QuestionResult, ProviderError } from '../../types/index'

export class OpenAIProvider implements AIProvider {
  constructor(
    private apiKey: string,
    private model: string = 'gpt-4o-mini'
  ) {}

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      })
      return response.ok
    } catch (error) {
      console.error('[OpenAI] Connection test failed:', error)
      return false
    }
  }

  async generateStructuredEvaluation(
    input: EvaluationPromptInput
  ): Promise<QuestionResult> {
    const prompt = this.buildEvaluationPrompt(input)

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content:
                'You are an expert academic evaluator. Evaluate student submissions fairly and provide constructive feedback. Always respond with valid JSON.',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          response_format: { type: 'json_object' },
        }),
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        const message =
          error.error?.message || `API error: ${response.status} ${response.statusText}`
        throw new ProviderError(`OpenAI API error: ${message}`, {
          status: response.status,
          error,
        })
      }

      const data = await response.json()
      const content = data.choices?.[0]?.message?.content

      if (!content) {
        throw new ProviderError('No response content from OpenAI API', { data })
      }

      return this.parseResponse(content, input.question.maxMarks, input.question.title)
    } catch (error) {
      if (error instanceof ProviderError) throw error
      throw new ProviderError(`Failed to call OpenAI API: ${error}`, {
        originalError: error,
      })
    }
  }

  private buildEvaluationPrompt(input: EvaluationPromptInput): string {
    const strictnessInstructions = {
      lenient:
        'Reward partial understanding, reasonable attempts, and correct direction even when the answer is incomplete.',
      balanced:
        'Grade normally against the question, rubric, and expected academic standard.',
      strict:
        'Penalize missing detail, weak reasoning, incorrect code, incomplete answers, and unsupported claims more heavily.',
    }

    return `You are evaluating a student submission for the following question:

**Question:** ${input.question.title}
**Instructions:** ${input.question.prompt}
**Max Marks:** ${input.question.maxMarks}
Strictness: ${input.strictness}
Strictness Instruction: ${strictnessInstructions[input.strictness]}
${input.question.rubricCriteria ? `**Rubric Criteria:**\n${input.question.rubricCriteria.map(c => `- ${c}`).join('\n')}` : ''}
${input.question.referenceScript ? `**Reference Script:**\n\`\`\`\n${input.question.referenceScript}\n\`\`\`` : ''}

**Student Submission:**
\`\`\`
${input.submission.content}
\`\`\`

Evaluate this submission fairly. Respond with ONLY a valid JSON object (no markdown, no code blocks, pure JSON) with this exact structure:
{
  "awardedMarks": <number between 0 and ${input.question.maxMarks}>,
  "summary": "<brief overall assessment of the answer>",
  "strengths": ["<strength1>", "<strength2>"],
  "mistakes": ["<mistake1>", "<mistake2>"],
  "suggestions": ["<suggestion1>", "<suggestion2>"],
  "rubricAlignment": "<how well it aligns with rubric>",
  "aiCopyPercentage": <number between 0 and 100 estimating whether this answer appears AI-generated or copied from AI>,
  "confidence": "<high|medium|low>",
  "status": "<complete|partial|skipped>"
}`
  }

  private parseResponse(
    content: string,
    maxMarks: number,
    questionTitle: string
  ): QuestionResult {
    try {
      const parsed = JSON.parse(content)

      // Validate and normalize response
      const awardedMarks = Math.min(Math.max(parsed.awardedMarks || 0, 0), maxMarks)
      const rawAiCopyPercentage =
        typeof parsed.aiCopyPercentage === 'number' ? parsed.aiCopyPercentage : 0
      const aiCopyPercentage = Math.min(Math.max(rawAiCopyPercentage, 0), 100)
      const strengths = Array.isArray(parsed.strengths)
        ? parsed.strengths.filter((s: any) => typeof s === 'string')
        : []
      const mistakes = Array.isArray(parsed.mistakes)
        ? parsed.mistakes.filter((m: any) => typeof m === 'string')
        : []
      const suggestions = Array.isArray(parsed.suggestions)
        ? parsed.suggestions.filter((s: any) => typeof s === 'string')
        : []

      return {
        questionId: '', // Will be set by evaluation engine
        questionNumber: '', // Will be set by evaluation engine
        awardedMarks,
        maxMarks,
        summary: parsed.summary || 'Evaluation completed',
        strengths: strengths.length > 0 ? strengths : ['Good attempt'],
        mistakes: mistakes.length > 0 ? mistakes : [],
        suggestions: suggestions.length > 0 ? suggestions : ['Keep practicing'],
        rubricAlignment: parsed.rubricAlignment || 'Evaluated against criteria',
        aiCopyPercentage,
        confidence: ['high', 'medium', 'low'].includes(parsed.confidence)
          ? (parsed.confidence as any)
          : 'medium',
        status: ['complete', 'partial', 'skipped'].includes(parsed.status)
          ? (parsed.status as any)
          : 'complete',
      }
    } catch (error) {
      console.error('[OpenAI] Failed to parse response:', content)
      throw new ProviderError(`Failed to parse OpenAI response as JSON`, {
        originalError: error,
        content,
      })
    }
  }
}
