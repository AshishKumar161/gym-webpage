import { PrismaClient } from '@prisma/client';
import { AIProviderFactory } from './AIProviderFactory.js';
import { AIPromptTemplates } from './AIPromptTemplates.js';

const prisma = new PrismaClient();

export class AIService {
  constructor() {
    this.provider = AIProviderFactory.getProvider();
  }

  async _logUsage(userId, feature, usage) {
    try {
      await prisma.aITokenUsage.create({
        data: {
          userId,
          provider: this.provider.name,
          feature,
          promptTokens: usage.promptTokens,
          completionTokens: usage.completionTokens,
          totalTokens: usage.totalTokens,
        }
      });
    } catch (err) {
      console.error('Failed to log AI token usage:', err);
    }
  }

  async _logConversation(userId, role, message, feature) {
    try {
      await prisma.aIConversation.create({
        data: {
          userId,
          role,
          message,
          feature
        }
      });
    } catch (err) {
      console.error('Failed to log AI conversation:', err);
    }
  }

  async generateWorkout(userId, profile) {
    const prompt = AIPromptTemplates.WORKOUT_GENERATION(profile);
    const response = await this.provider.generateJSON(prompt, AIPromptTemplates.SYSTEM_INSTRUCTION);
    
    await this._logUsage(userId, 'workout_generation', response.usage);
    
    try {
      // The response might be a markdown block containing JSON, strip it
      let rawText = response.text;
      if (rawText.startsWith('\`\`\`json')) {
        rawText = rawText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '');
      }
      return JSON.parse(rawText);
    } catch (e) {
      console.error('Failed to parse AI Workout JSON:', response.text);
      throw new Error('AI generated invalid format.');
    }
  }

  async generateDiet(userId, profile) {
    const prompt = AIPromptTemplates.DIET_GENERATION(profile);
    const response = await this.provider.generateJSON(prompt, AIPromptTemplates.SYSTEM_INSTRUCTION);
    
    await this._logUsage(userId, 'diet_generation', response.usage);
    
    try {
      let rawText = response.text;
      if (rawText.startsWith('\`\`\`json')) {
        rawText = rawText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '');
      }
      return JSON.parse(rawText);
    } catch (e) {
      throw new Error('AI generated invalid format.');
    }
  }

  async chat(userId, message) {
    // Log user message
    await this._logConversation(userId, 'user', message, 'chat');

    // Get response
    const response = await this.provider.generateText(message, AIPromptTemplates.SYSTEM_INSTRUCTION);
    
    await this._logUsage(userId, 'chat', response.usage);
    
    // Log AI response
    await this._logConversation(userId, 'model', response.text, 'chat');

    return response.text;
  }

  async getAdminInsights(userId, data) {
    const prompt = AIPromptTemplates.ADMIN_INSIGHTS(data);
    const response = await this.provider.generateText(prompt, AIPromptTemplates.SYSTEM_INSTRUCTION);
    
    await this._logUsage(userId, 'admin_insights', response.usage);
    
    return response.text;
  }
}
