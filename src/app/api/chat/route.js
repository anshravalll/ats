import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req) {
  
  try {
    const { messages } = await req.json();
    console.log('📊 Messages count:', messages?.length || 0);

    const result = streamText({
      model: openai('gpt-4.1-nano'),
      messages,
    });

    console.log('📤 Returning data stream response');
    
    return result.toDataStreamResponse();
  } catch (error) {
    console.error('❌ Error in API POST:', error);
    console.error('Stack trace:', error.stack);
    throw error;
  }
}
