import { GoogleGenerativeAI } from '@google/generative-ai';
import { IDEA_REPORT_PROMPT, IDEA_PRODUCT_ROADMAP_PROMPT, IDEA_ROADMAP_PROMPT } from '../prompts/ideaReportPrompt.js';

// Lazy initialization to ensure env vars are loaded
let genAI: GoogleGenerativeAI | null = null;

function getGenAI(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not set. Please set it in your environment variables.');
    }
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export interface GenerateReportInput {
  title: string;
  content?: string | null;
  ai_context?: string | null;
  tags?: string[];
}

export class AIService {
  async generateReport(input: GenerateReportInput): Promise<string> {
    // Get Gemini AI instance (lazy initialization ensures env vars are loaded)
    const ai = getGenAI();

    // Build prompt by replacing placeholders
    let prompt = IDEA_REPORT_PROMPT;
    
    // Replace title
    prompt = prompt.replace('<TITLE>', input.title);
    
    // Replace description
    const description = input.content || '';
    prompt = prompt.replace('<DESCRIPTION>', description);
    
    // Replace tags
    if (input.tags && input.tags.length > 0) {
      const tagsText = input.tags.join(', ');
      prompt = prompt.replace('<TAGS>', tagsText);
    } else {
      prompt = prompt.replace('<TAGS>', '(none)');
    }
    
    // Replace additional context
    const additionalContext = input.ai_context || '';
    prompt = prompt.replace('<ADDITIONAL CONTEXT>', additionalContext);

    try {
      const model = ai.getGenerativeModel({ model: 'gemini-3-flash-preview' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const report = response.text();

      return report;
    } catch (error: any) {
      console.error('Error generating AI report:', error);
      
      // Check if the error is due to model being overloaded or unavailable
      const isServiceUnavailable = 
        error.status === 503 || 
        error.statusText === 'Service Unavailable' ||
        error.message?.includes('overloaded') ||
        error.message?.includes('not available') ||
        error.message?.includes('503');
      
      if (isServiceUnavailable) {
        throw new Error('Google Gemini model is currently unavailable. Please try again in a few moments.');
      }
      
      throw new Error(`Failed to generate AI report: ${error.message}`);
    }
  }

  async generateRoadmap(input: GenerateReportInput): Promise<string> {
    // Get Gemini AI instance (lazy initialization ensures env vars are loaded)
    const ai = getGenAI();

    // Build prompt by replacing placeholders
    let prompt = IDEA_PRODUCT_ROADMAP_PROMPT;
    
    // Replace title
    prompt = prompt.replace('<TITLE>', input.title);
    
    // Replace description
    const description = input.content || '';
    prompt = prompt.replace('<DESCRIPTION>', description);
    
    // Replace tags
    if (input.tags && input.tags.length > 0) {
      const tagsText = input.tags.join(', ');
      prompt = prompt.replace('<TAGS>', tagsText);
      // Replace the specific placeholder format in roadmap prompt: <TAG1>, <TAG2>, <TAG3>
      prompt = prompt.replace(/<TAG1>, <TAG2>, <TAG3>/, tagsText);
    } else {
      prompt = prompt.replace('<TAGS>', '(none)');
      prompt = prompt.replace(/<TAG1>, <TAG2>, <TAG3>/, '(none)');
    }
    
    // Replace additional context
    const additionalContext = input.ai_context || '';
    prompt = prompt.replace('<ADDITIONAL CONTEXT>', additionalContext);

    try {
      const model = ai.getGenerativeModel({ model: 'gemini-3-flash-preview' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const roadmap = response.text();

      return roadmap;
    } catch (error: any) {
      console.error('Error generating AI roadmap:', error);
      
      // Check if the error is due to model being overloaded or unavailable
      const isServiceUnavailable = 
        error.status === 503 || 
        error.statusText === 'Service Unavailable' ||
        error.message?.includes('overloaded') ||
        error.message?.includes('not available') ||
        error.message?.includes('503');
      
      if (isServiceUnavailable) {
        throw new Error('Google Gemini model is currently unavailable. Please try again in a few moments.');
      }
      
      throw new Error(`Failed to generate AI roadmap: ${error.message}`);
    }
  }

  async generateValidationRoadmap(input: GenerateReportInput): Promise<string> {
    // Get Gemini AI instance (lazy initialization ensures env vars are loaded)
    const ai = getGenAI();

    // Build prompt by replacing placeholders
    let prompt = IDEA_ROADMAP_PROMPT;
    
    // Replace title
    prompt = prompt.replace('<TITLE>', input.title);
    
    // Replace description
    const description = input.content || '';
    prompt = prompt.replace('<DESCRIPTION>', description);
    
    // Replace tags
    if (input.tags && input.tags.length > 0) {
      const tagsText = input.tags.join(', ');
      prompt = prompt.replace('<TAGS>', tagsText);
      // Replace the specific placeholder format in roadmap prompt: <TAG1>, <TAG2>, <TAG3>
      prompt = prompt.replace(/<TAG1>, <TAG2>, <TAG3>/, tagsText);
    } else {
      prompt = prompt.replace('<TAGS>', '(none)');
      prompt = prompt.replace(/<TAG1>, <TAG2>, <TAG3>/, '(none)');
    }
    
    // Replace additional context
    const additionalContext = input.ai_context || '';
    prompt = prompt.replace('<ADDITIONAL CONTEXT>', additionalContext);

    try {
      const model = ai.getGenerativeModel({ model: 'gemini-3-flash-preview' });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const validationRoadmap = response.text();

      return validationRoadmap;
    } catch (error: any) {
      console.error('Error generating AI validation roadmap:', error);
      
      // Check if the error is due to model being overloaded or unavailable
      const isServiceUnavailable = 
        error.status === 503 || 
        error.statusText === 'Service Unavailable' ||
        error.message?.includes('overloaded') ||
        error.message?.includes('not available') ||
        error.message?.includes('503');
      
      if (isServiceUnavailable) {
        throw new Error('Google Gemini model is currently unavailable. Please try again in a few moments.');
      }
      
      throw new Error(`Failed to generate AI validation roadmap: ${error.message}`);
    }
  }
}

export const aiService = new AIService();
