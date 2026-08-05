export class BaseProvider {
  /**
   * Normalize output from any AI provider to this standard format.
   * @param {string} text - The raw text content of the AI response
   * @param {object} usage - Usage metrics { promptTokens, completionTokens, totalTokens }
   */
  formatResponse(text, usage = { promptTokens: 0, completionTokens: 0, totalTokens: 0 }) {
    return {
      text,
      usage,
    };
  }

  async generateText(prompt, systemInstruction = null) {
    throw new Error('generateText must be implemented by subclass');
  }

  async generateJSON(prompt, systemInstruction = null) {
    throw new Error('generateJSON must be implemented by subclass');
  }
}
