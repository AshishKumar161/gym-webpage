import { GoogleGenAI } from '@google/genai';
import { BaseProvider } from './BaseProvider.js';

export class GeminiProvider extends BaseProvider {
  constructor() {
    super();
    this.name = 'gemini';
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY is not set. Responses will fail.');
    }
    // Initialize the new @google/genai SDK instance
    this.ai = new GoogleGenAI({ apiKey: apiKey || 'mock-key' });
    this.modelName = 'gemini-2.5-flash';
  }

  async generateText(prompt, systemInstruction = null) {
    const config = {};
    if (systemInstruction) {
      config.systemInstruction = systemInstruction;
    }

    try {
      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: config
      });

      const usage = response.usageMetadata || {};
      return this.formatResponse(response.text, {
        promptTokens: usage.promptTokenCount || 0,
        completionTokens: usage.candidatesTokenCount || 0,
        totalTokens: usage.totalTokenCount || 0
      });
    } catch (error) {
      console.error('Gemini generateText error:', error);
      throw error;
    }
  }

  async generateJSON(prompt, systemInstruction = null) {
    const config = {
      responseMimeType: 'application/json'
    };
    if (systemInstruction) {
      config.systemInstruction = systemInstruction;
    }

    try {
      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: config
      });

      const usage = response.usageMetadata || {};
      return this.formatResponse(response.text, {
        promptTokens: usage.promptTokenCount || 0,
        completionTokens: usage.candidatesTokenCount || 0,
        totalTokens: usage.totalTokenCount || 0
      });
    } catch (error) {
      console.error('Gemini generateJSON error:', error);
      throw error;
    }
  }
}
