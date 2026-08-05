import OpenAI from 'openai';
import { BaseProvider } from './BaseProvider.js';

export class OpenAIProvider extends BaseProvider {
  constructor() {
    super();
    this.name = 'openai';
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn('OPENAI_API_KEY is not set. Responses will fail.');
    }
    this.ai = new OpenAI({ apiKey: apiKey || 'mock-key' });
    this.modelName = 'gpt-4o-mini';
  }

  async generateText(prompt, systemInstruction = null) {
    const messages = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });

    try {
      const response = await this.ai.chat.completions.create({
        model: this.modelName,
        messages: messages,
      });

      const usage = response.usage || {};
      return this.formatResponse(response.choices[0].message.content, {
        promptTokens: usage.prompt_tokens || 0,
        completionTokens: usage.completion_tokens || 0,
        totalTokens: usage.total_tokens || 0
      });
    } catch (error) {
      console.error('OpenAI generateText error:', error);
      throw error;
    }
  }

  async generateJSON(prompt, systemInstruction = null) {
    const messages = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });

    try {
      const response = await this.ai.chat.completions.create({
        model: this.modelName,
        messages: messages,
        response_format: { type: 'json_object' }
      });

      const usage = response.usage || {};
      return this.formatResponse(response.choices[0].message.content, {
        promptTokens: usage.prompt_tokens || 0,
        completionTokens: usage.completion_tokens || 0,
        totalTokens: usage.total_tokens || 0
      });
    } catch (error) {
      console.error('OpenAI generateJSON error:', error);
      throw error;
    }
  }
}
