import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { buildEducationalPrompt, CONTENT_TYPES } from '@/lib/education/prompt-templates';
import { parseEducationalContent, validateQuiz, convertToSupabaseFormat } from '@/lib/education/content-parser';
import { streamText } from 'ai';
import { createGroq } from '@ai-sdk/groq';
import { createAnthropic } from '@ai-sdk/anthropic';
import { createOpenAI } from '@ai-sdk/openai';

// Initialize AI providers
const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
});

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { 
      contentType, 
      subject, 
      gradeLevel, 
      language = 'fi',
      additionalParams = {},
      model = 'anthropic/claude-3-sonnet-20240229'
    } = await request.json();

    // Validate required fields
    if (!contentType || !subject || !gradeLevel) {
      return NextResponse.json(
        { error: 'Content type, subject, and grade level are required' },
        { status: 400 }
      );
    }

    // Check if content type is supported
    if (!(contentType in CONTENT_TYPES)) {
      return NextResponse.json(
        { error: 'Unsupported content type' },
        { status: 400 }
      );
    }

    // Get user authentication
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check user credits
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('credits_remaining')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Unable to fetch user profile' },
        { status: 500 }
      );
    }

    const validContentType = contentType as keyof typeof CONTENT_TYPES;
    const requiredCredits = CONTENT_TYPES[validContentType].credits;
    if (profile.credits_remaining < requiredCredits) {
      return NextResponse.json(
        { error: `Insufficient credits. Required: ${requiredCredits}, Available: ${profile.credits_remaining}` },
        { status: 402 }
      );
    }

    // Build the educational prompt
    const prompt = buildEducationalPrompt(
      validContentType,
      subject,
      gradeLevel,
      language,
      additionalParams
    );

    // Select AI provider based on model
    let aiProvider;
    let modelName;

    if (model.startsWith('anthropic/')) {
      aiProvider = anthropic;
      modelName = model.replace('anthropic/', '');
    } else if (model.startsWith('openai/')) {
      aiProvider = openai;
      modelName = model.replace('openai/', '');
    } else if (model.startsWith('groq/') || model.includes('groq')) {
      aiProvider = groq;
      modelName = 'llama-3.1-70b-versatile'; // Default Groq model
    } else {
      aiProvider = anthropic;
      modelName = 'claude-3-sonnet-20240229';
    }

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial status
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify({
              type: 'status',
              message: `Generating ${CONTENT_TYPES[validContentType].description}...`
            })}\n\n`)
          );

          // Generate content with AI
          const result = await streamText({
            model: aiProvider(modelName),
            prompt: prompt,
            temperature: 0.7,
          });

          let fullContent = '';

          // Stream the AI response
          for await (const delta of result.textStream) {
            fullContent += delta;
            
            // Send progress updates
            controller.enqueue(
              new TextEncoder().encode(`data: ${JSON.stringify({
                type: 'content',
                delta: delta
              })}\n\n`)
            );
          }

          // Parse the generated content
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify({
              type: 'status',
              message: 'Parsing generated content...'
            })}\n\n`)
          );

          const parsedContent = parseEducationalContent(fullContent, validContentType);

          if (!parsedContent) {
            throw new Error('Failed to parse generated content');
          }

          // Validate content (for quizzes)
          if (validContentType === 'quiz') {
            const validation = validateQuiz(parsedContent as any);
            if (!validation.isValid) {
              throw new Error(`Content validation failed: ${validation.errors.join(', ')}`);
            }
          }

          // Deduct credits
          const { error: creditError } = await supabase
            .from('credit_transactions')
            .insert({
              user_id: user.id,
              credits_used: requiredCredits,
              credits_remaining: profile.credits_remaining - requiredCredits,
              action_type: 'generation',
              action_details: {
                content_type: validContentType,
                subject: subject,
                grade_level: gradeLevel
              }
            });

          if (creditError) {
            console.error('Failed to record credit transaction:', creditError);
          }

          // Update user credits
          await supabase
            .from('profiles')
            .update({ credits_remaining: profile.credits_remaining - requiredCredits })
            .eq('id', user.id);

          // Save generated content to database
          const contentData = convertToSupabaseFormat(parsedContent, validContentType);
          const { data: savedContent, error: saveError } = await supabase
            .from('educational_content')
            .insert({
              user_id: user.id,
              ...contentData
            })
            .select()
            .single();

          if (saveError) {
            console.error('Failed to save content:', saveError);
          }

          // Send final result
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify({
              type: 'complete',
              content: parsedContent,
              contentId: savedContent?.id,
              creditsUsed: requiredCredits,
              creditsRemaining: profile.credits_remaining - requiredCredits
            })}\n\n`)
          );

          controller.close();

        } catch (error) {
          console.error('Error generating educational content:', error);
          controller.enqueue(
            new TextEncoder().encode(`data: ${JSON.stringify({
              type: 'error',
              message: error instanceof Error ? error.message : 'Unknown error occurred'
            })}\n\n`)
          );
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}