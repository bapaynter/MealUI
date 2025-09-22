import OpenAI from 'openai'
import type { ChatCompletionCreateParamsNonStreaming } from 'openai/resources/chat/completions'

export const generate = async (
  system_prompt: string,
  instructions: string,
  output_schema: { [key: string]: unknown } | null,
  openrouter_api_key: string,
) => {
  const openai = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: openrouter_api_key,
    dangerouslyAllowBrowser: true,
  })
  const ai_params = {
    model: 'deepseek/deepseek-chat-v3.1',
    messages: [
      {
        role: 'system',
        content: system_prompt,
      },
      {
        role: 'user',
        content: instructions,
      },
    ],
  } as ChatCompletionCreateParamsNonStreaming
  if (output_schema) {
    ai_params.response_format = {
      type: 'json_schema',
      json_schema: {
        name: 'Schema',
        strict: true,
        schema: output_schema,
      },
    }
  }
  const completion = await openai.chat.completions.create(ai_params)

  let response = completion.choices[0].message.content as string

  if (response.includes('```json')) {
    response = response.replace('```json', '').replace('```', '')
  }

  return {
    response,
    tokens: { in: completion.usage?.prompt_tokens, out: completion.usage?.completion_tokens },
  }
}
