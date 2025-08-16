/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { initializeGemini, convertToGeminiFormat } from '@/lib/gemini';
import { ChatSettings } from '@/app/types/chat';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Specify runtime - Edge Runtime is better for streaming on Vercel
export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { messages, settings }: { messages: any[], settings: ChatSettings } = await req.json();
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY not found');
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    const model = initializeGemini(apiKey, settings.model);
    
    const generationConfig = {
      temperature: settings.temperature,
      topP: settings.topP,
      topK: settings.topK,
      maxOutputTokens: settings.maxTokens,
    };

    // Create a TransformStream for proper streaming on Vercel
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    
    const customReadable = new ReadableStream({
      async start(controller) {
        try {
          // Start chat session
          const chat = model.startChat({
            history: convertToGeminiFormat(messages.slice(0, -1)),
            generationConfig,
          });

          const userMessage = messages[messages.length - 1].content;
          
          // Get streaming response
          const result = await chat.sendMessageStream(userMessage);
          
          // Process stream
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              // Send as SSE format
              const sseMessage = `data: ${JSON.stringify({ text })}\n\n`;
              controller.enqueue(encoder.encode(sseMessage));
            }
          }
          
          // Send completion signal
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        } catch (error) {
          console.error('Streaming error:', error);
          const errorMessage = `data: ${JSON.stringify({ error: error instanceof Error ? error.message : 'Stream error' })}\n\n`;
          controller.enqueue(encoder.encode(errorMessage));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(customReadable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' }, 
      { status: 500 }
    );
  }
}