import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { EducationClientPage } from './EducationClientPage';
import { Suspense } from 'react';

export default async function EducationPage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*, credits_remaining')
        .eq('id', user.id)
        .single();

    if (profileError || !profile) {
        console.error('Error fetching profile:', profileError);
        // Redirect or show an error page if profile is essential
        redirect('/error'); 
    }

    const { data: recentContent, error: contentError } = await supabase
        .from('educational_content')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

    if (contentError) {
        console.error('Error fetching recent content:', contentError);
        // Decide how to handle this - maybe the page can still render
    }

    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <EducationClientPage 
                initialProfile={profile} 
                initialRecentContent={recentContent || []} 
            />
        </Suspense>
    );
}
