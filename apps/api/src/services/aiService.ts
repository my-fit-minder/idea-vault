import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn('GEMINI_API_KEY not set. AI report generation will not work.');
}

// Initialize Gemini AI
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

export interface GenerateReportInput {
  title: string;
  content?: string | null;
  ai_context?: string | null;
  tags?: string[];
}

export class AIService {
  async generateReport(input: GenerateReportInput): Promise<string> {
    if (!genAI) {
      throw new Error('Gemini API key not configured. Please set GEMINI_API_KEY in your environment variables.');
    }

    // Placeholder prompt - you can customize this later
    const prompt = this.buildPrompt(input);

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const report = response.text();

      return report;
    } catch (error: any) {
      console.error('Error generating AI report:', error);
      throw new Error(`Failed to generate AI report: ${error.message}`);
    }
  }

  private buildPrompt(input: GenerateReportInput): string {
    // Placeholder prompt - customize this based on your needs
    const prompt = `Generate a detailed report about the following idea in markdown format.

Title: ${input.title}

${input.content ? `Description: ${input.content}` : ''}

${input.ai_context ? `Additional Context: ${input.ai_context}` : ''}

${input.tags && input.tags.length > 0 ? `Tags: ${input.tags.join(', ')}` : ''}

Please generate a comprehensive markdown report that includes:
1. An executive summary
2. Key features and benefits
3. Potential use cases
4. Implementation considerations
5. Any relevant insights or recommendations

Format the response as clean markdown with proper headings, lists, and formatting.`;

    return prompt;
  }
}

export const aiService = new AIService();
