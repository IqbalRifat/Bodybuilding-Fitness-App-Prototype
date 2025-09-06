import OpenAI from 'openai';

class CoachGPTService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',
    });
  }

  async initialize() {
    // No longer needed since API key is from environment
    return true;
  }

  async generateResponse(messages: { role: 'user' | 'assistant' | 'system', content: string }[]): Promise<string> {
    if (!process.env.EXPO_PUBLIC_OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const systemPrompt = {
      role: 'system' as const,
      content: `You are CoachGPT, an AI fitness and bodybuilding coach. You provide expert advice on:

- Workout programming and exercise selection
- Progressive overload and training principles
- Nutrition and meal planning for muscle building and fat loss
- Supplement recommendations (evidence-based only)
- Recovery and injury prevention
- Motivation and goal setting

Guidelines:
- Always prioritize safety and proper form
- Base recommendations on scientific evidence
- Ask clarifying questions when needed
- Provide specific, actionable advice
- Encourage consistency and patience
- Recommend consulting professionals for medical concerns
- Be supportive and motivating

Keep responses concise but comprehensive. Use bullet points when appropriate.`
    };

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4.1-nano',
      messages: [systemPrompt, ...messages],
      max_tokens: 500,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.';
  }

  isConfigured(): boolean {
    return !!process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  }
}

export const coachGPTService = new CoachGPTService();