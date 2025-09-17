'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { ContentGenerator } from '@/components/education/ContentGenerator';
import { QuizPlayer } from '@/components/education/QuizPlayer';
import { CoursePlayer } from '@/components/education/CoursePlayer';
import { PresentationPlayer } from '@/components/education/PresentationPlayer';
import { ExercisePlayer } from '@/components/education/ExercisePlayer';
import {
    parseQuizFromXML,
    parseCourseFromXML,
    parseExerciseSetFromXML,
    // parsePresentationFromXML, // Not yet implemented
    Quiz,
    Course,
    Presentation,
    ExerciseSet
} from '@/lib/education/content-parser';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/shadcn/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    BookOpen,
    FileQuestion,
    Presentation as PresentationIcon,
    PenTool,
    Plus,
    History,
    Star,
    User as UserIcon,
    LogOut,
    Coins
} from 'lucide-react';

// Types matching Supabase schema
interface UserProfile {
    id: string;
    email?: string;
    full_name?: string;
    credits_remaining: number;
    subscription_tier?: string;
}

interface GeneratedContent {
    id: string;
    title: string;
    content_type: string;
    subject: string;
    grade_level: string;
    content_data: any;
    created_at: string;
    user_id: string;
}

interface EducationClientPageProps {
    initialProfile: UserProfile;
    initialRecentContent: GeneratedContent[];
}

export function EducationClientPage({ initialProfile, initialRecentContent }: EducationClientPageProps) {
    const [profile, setProfile] = useState<UserProfile>(initialProfile);
    const [recentContent, setRecentContent] = useState<GeneratedContent[]>(initialRecentContent);
    const [activeTab, setActiveTab] = useState<'generator' | 'player' | 'history'>('generator');
    const [currentContent, setCurrentContent] = useState<{
        type: string;
        data: Quiz | Course | Presentation | ExerciseSet;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const supabase = createClient();

    const handleContentGenerated = async (content: any, contentType: string) => {
        try {
            let parsedContent;
            switch (contentType) {
                case 'quiz': parsedContent = parseQuizFromXML(content); break;
                case 'course': parsedContent = parseCourseFromXML(content); break;
                case 'exercise': parsedContent = parseExerciseSetFromXML(content); break;
                // case 'presentation': parsedContent = parsePresentationFromXML(content); break;
                default: throw new Error(`Content type parser not implemented: ${contentType}`);
            }

            if (parsedContent) {
                setCurrentContent({ type: contentType, data: parsedContent });
                setActiveTab('player');

                // After saving, the credits will be updated. We should refresh the profile.
                await fetchUserProfile();
                await fetchRecentContent();
            } else {
                throw new Error(`Failed to parse generated ${contentType}.`);
            }

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error processing generated content:', errorMessage);
            setError('Virhe käsiteltäessä luotua sisältöä: ' + errorMessage);
        }
    };
    
    const fetchUserProfile = async () => {
        const { data, error } = await supabase.from('profiles').select('*, credits_remaining').eq('id', profile.id).single();
        if (data) setProfile(data);
        if (error) console.error("Error refreshing profile:", error);
    };

    const fetchRecentContent = async () => {
        const { data, error } = await supabase.from('educational_content').select('*').eq('user_id', profile.id).order('created_at', { ascending: false }).limit(10);
        if (data) setRecentContent(data);
        if (error) console.error("Error refreshing content history:", error);
    };

    const handleLoadContent = (content: GeneratedContent) => {
        try {
            // The content_data from DB is already parsed JSON
            setCurrentContent({ type: content.content_type, data: content.content_data });
            setActiveTab('player');
        } catch (error) {
            console.error('Error loading content:', error);
            setError('Virhe ladattaessa sisältöä');
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.href = '/login';
    };

    const getContentIcon = (type: string) => {
        switch (type) {
            case 'quiz': return <FileQuestion className="w-5 h-5" />;
            case 'course': return <BookOpen className="w-5 h-5" />;
            case 'presentation': return <PresentationIcon className="w-5 h-5" />;
            case 'exercise': return <PenTool className="w-5 h-5" />;
            default: return <FileQuestion className="w-5 h-5" />;
        }
    };

    const getContentTypeLabel = (type: string) => {
        switch (type) {
            case 'quiz': return 'Tietokilpailu';
            case 'course': return 'Kurssi';
            case 'presentation': return 'Esitys';
            case 'exercise': return 'Harjoitus';
            default: return 'Sisältö';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <BookOpen className="w-8 h-8 text-blue-600" />
                            <h1 className="text-xl font-bold text-gray-900">KoulutusBot</h1>
                            <Badge variant="secondary">Suomen opetussisältö AI</Badge>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1 text-sm">
                                    <Coins className="w-4 h-4 text-yellow-600" />
                                    <span className="font-medium">{profile.credits_remaining}</span>
                                    <span className="text-gray-500">krediittiä</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <UserIcon className="w-4 h-4" />
                                    <span>{profile.full_name || profile.email}</span>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleSignOut} className="flex items-center gap-2">
                                <LogOut className="w-4 h-4" />
                                Kirjaudu ulos
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)} className="mt-4">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="generator" className="flex items-center gap-2"><Plus className="w-4 h-4" />Luo sisältöä</TabsTrigger>
                        <TabsTrigger value="player" className="flex items-center gap-2"><Star className="w-4 h-4" />Katso sisältöä</TabsTrigger>
                        <TabsTrigger value="history" className="flex items-center gap-2"><History className="w-4 h-4" />Historia</TabsTrigger>
                    </TabsList>

                    <TabsContent value="generator" className="mt-6">
                        <ContentGenerator onContentGenerated={handleContentGenerated} userCredits={profile.credits_remaining} />
                    </TabsContent>

                    <TabsContent value="player" className="mt-6">
                        {currentContent ? (
                            <div>
                                {currentContent.type === 'quiz' && <QuizPlayer quiz={currentContent.data as Quiz} onComplete={() => {}} />}
                                {currentContent.type === 'course' && <CoursePlayer course={currentContent.data as Course} onComplete={() => {}} completedModules={[]} />}
                                {currentContent.type === 'presentation' && <PresentationPlayer presentation={currentContent.data as Presentation} onComplete={() => {}} />}
                                {currentContent.type === 'exercise' && <ExercisePlayer exerciseSet={currentContent.data as ExerciseSet} onComplete={() => {}} />}
                            </div>
                        ) : (
                            <Card className="text-center p-8"><CardContent><div className="text-gray-500 mb-4"><BookOpen className="w-12 h-12 mx-auto mb-4" /><h3 className="text-lg font-medium mb-2">Ei sisältöä valittuna</h3><p className="text-sm">Luo uutta sisältöä tai valitse aiemmin luotu sisältö historiasta</p></div><Button onClick={() => setActiveTab('generator')}><Plus className="w-4 h-4 mr-2" />Luo uutta sisältöä</Button></CardContent></Card>
                        )}
                    </TabsContent>

                    <TabsContent value="history" className="mt-6">
                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2"><History className="w-5 h-5" />Luotu sisältö</CardTitle></CardHeader>
                            <CardContent>
                                {recentContent.length > 0 ? (
                                    <div className="space-y-3">
                                        {recentContent.map((content) => (
                                            <div key={content.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors" onClick={() => handleLoadContent(content)}>
                                                <div className="flex items-center gap-3">
                                                    {getContentIcon(content.content_type)}
                                                    <div>
                                                        <h4 className="font-medium">{content.title}</h4>
                                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                                            <Badge variant="outline" className="text-xs">{getContentTypeLabel(content.content_type)}</Badge>
                                                            <span>{content.subject}</span>
                                                            <span>•</span>
                                                            <span>{content.grade_level}</span>
                                                            <span>•</span>
                                                            <span>{new Date(content.created_at).toLocaleDateString('fi')}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button variant="outline" size="sm">Avaa</Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500"><History className="w-12 h-12 mx-auto mb-4" /><h3 className="text-lg font-medium mb-2">Ei luotua sisältöä</h3><p className="text-sm">Aloita luomalla ensimmäinen opetussisältösi</p></div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}