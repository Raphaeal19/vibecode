import { AIProvider, ChatRequest, ChatResponse } from "../types";
import { getUserApiKey } from "@/utils/api/userSettings";

export class OpenAIProvider implements AIProvider {
  private userId: string;
  private apiKey: string | null = null;

  constructor(userId: string) {
    this.userId = userId;
  }

  private async getApiKey(): Promise<string> {
    if (!this.apiKey) {
      this.apiKey = await getUserApiKey(this.userId, "openai");
      if (!this.apiKey) {
        throw new Error("OpenAI API key not found");
      }
    }
    return this.apiKey;
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const apiKey = await this.getApiKey();

    console.log(apiKey)

    const messages = request.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    if (request.context?.challengeType) {
      messages.unshift({
        role: "system",
        content: this.getSystemPrompt(request.context.challengeType),
      });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages,
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      message: data.choices[0].message.content,
      conversationId: request.conversationId || this.generateConversationId(),
      timestamp: Date.now(),
      provider: "openai",
      usage: {
        promptTokens: data.usage.prompt_tokens,
        completionTokens: data.usage.completion_tokens,
        totalTokens: data.usage.total_tokens,
      },
    };
  }

  async validateConnection(): Promise<boolean> {
    try {
      const apiKey = await this.getApiKey();
      const response = await fetch("https://api.openai.com/v1/models", {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private getSystemPrompt(challengeType?: string): string {
    const basePrompt = `You are an AI coding assistant for VibeCode, an interactive coding platform. Help users with coding challenges, refactoring, testing, documentation, and debugging.`;

    switch (challengeType) {
      case "refactor":
        return `${basePrompt} Focus on code refactoring: improving readability, performance, and maintainability while preserving functionality.`;
      case "test":
        return `${basePrompt} Focus on test generation: create comprehensive unit tests, edge cases, and testing strategies.`;
      case "documentation":
        return `${basePrompt} Focus on documentation: generate clear, comprehensive documentation including JSDoc comments and README files.`;
      case "translate":
        return `${basePrompt} Focus on code translation: convert code between languages or frameworks while maintaining functionality and best practices.`;
      case "debug":
        return `${basePrompt} Focus on debugging: help identify bugs, trace logic, and suggest fixes with clear explanations.`;
      default:
        return basePrompt;
    }
  }

//   private formatPrompt(request: ChatRequest): string {
//     let prompt = request.prompt;

//     // This method might become less relevant if system prompts handle most context
//     // but keeping it for direct user prompts if needed.
//     if (request.context?.code && !request.context?.challengeType) { // Only append code if not already handled by challengeType in system prompt
//       prompt += `\n\nCode:\n\`\`\`${
//         request.context.language || "javascript"
//       }\n${request.context.code}\n\`\`\``;
//     }

//     return prompt;
//   }

  private generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
