/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { initializeGemini, convertToGeminiFormat } from '@/lib/gemini';
import { ChatSettings } from '@/app/types/chat';

export async function POST(req: NextRequest) {
  try {
    const { messages, settings }: { messages: any[], settings: ChatSettings } = await req.json();
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const model = initializeGemini(apiKey, settings.model);
    
    // Configure generation parameters
    const generationConfig = {
      temperature: settings.temperature,
      topP: settings.topP,
      topK: settings.topK,
      maxOutputTokens: settings.maxTokens,
    };

    // Start chat session with history
    const chat = model.startChat({
      history: convertToGeminiFormat(messages.slice(0, -1)),
      generationConfig,
    });

    // Get the latest user message
    const userMessage = messages[messages.length - 1].content;
    
    // Stream the response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const result = await chat.sendMessageStream(userMessage);
          
          for await (const chunk of result.stream) {
            const text = chunk.text();
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
          }
          
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: 'Stream error' })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}