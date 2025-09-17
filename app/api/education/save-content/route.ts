import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { contentDetails, creditCost } = await request.json();

  if (!contentDetails || !creditCost) {
    return new NextResponse(JSON.stringify({ error: 'Missing content details or credit cost' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { error, data } = await supabase.rpc('save_content_and_deduct_credits', {
    p_user_id: user.id,
    p_content_type: contentDetails.contentType,
    p_title: contentDetails.title,
    p_description: contentDetails.description,
    p_subject: contentDetails.subject,
    p_grade_level: contentDetails.gradeLevel,
    p_language: contentDetails.language,
    p_curriculum_standards: contentDetails.curriculumStandards,
    p_content_data: contentDetails.contentData,
    p_credits_to_deduct: creditCost,
  });

  if (error) {
    console.error('Supabase RPC error:', error);
    return new NextResponse(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return NextResponse.json(data);
}
