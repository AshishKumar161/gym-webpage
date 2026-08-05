import { GeminiProvider } from './providers/GeminiProvider.js';
import { OpenAIProvider } from './providers/OpenAIProvider.js';

export class AIProviderFactory {
  static getProvider() {
    const activeProvider = process.env.ACTIVE_AI_PROVIDER || 'gemini';
    
    switch (activeProvider.toLowerCase()) {
      case 'openai':
        return new OpenAIProvider();
      case 'gemini':
      default:
        return new GeminiProvider();
    }
  }
}
