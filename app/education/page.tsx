'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { ContentGenerator } from '@/components/education/ContentGenerator';
import { QuizPlayer } from '@/components/education/QuizPlayer';
import { CoursePlayer } from '@/components/education/CoursePlayer';
import { PresentationPlayer } from '@/components/education/PresentationPlayer';
import { ExercisePlayer } from '@/components/education/ExercisePlayer';
import {
    parseQuizFromXML,
    parseCourseFromXML,
    parsePresentationFromXML,
    parseExerciseFromXML,
    Quiz,
    Course,
    Presentation,
    Exercise
} from '@/lib/education/content-parser';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

interface UserProfile {
    id: string;
    email: string;
    display_name?: string;
    credits: number;
    subscription_tier: string;
}

interface GeneratedContent {
    id: string;
    title: string;
    content_type: string;
    subject: string;
    grade_level: string;
    content_data: any;
    created_at: string;
}

function EducationPageContent() {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'generator' | 'player' | 'history'>('generator');
    const [currentContent, setCurrentContent] = useState<{
        type: string;
        data: Quiz | Course | Presentation | Exercise;
    } | null>(null);
    const [recentContent, setRecentContent] = useState<GeneratedContent[]>([]);
    const [error, setError] = useState<string | null>(null);

    const supabase = createClient();

    useEffect(() => {
        checkAuth();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const checkAuth = async () => {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();

            if (error) {
                console.error('Auth error:', error);
                setError('Kirjaudu sisään käyttääksesi KoulutusBotia');
                setLoading(false);
                return;
            }

            if (!user) {
                setError('Kirjaudu sisään käyttääksesi KoulutusBotia');
                setLoading(false);
                return;
            }

            setUser(user);
            await fetchUserProfile(user.id);
            await fetchRecentContent(user.id);
        } catch (error) {
            console.error('Error checking auth:', error);
            setError('Virhe tarkistettaessa käyttäjätietoja');
        } finally {
            setLoading(false);
        }
    };

    const fetchUserProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching profile:', error);
                return;
            }

            setProfile(data);
        } catch (error) {
            console.error('Error fetching user profile:', error);
        }
    };

    const fetchRecentContent = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('educational_content')
                .select('*')
                .eq('created_by', userId)
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) {
                console.error('Error fetching recent content:', error);
                return;
            }

            setRecentContent(data || []);
        } catch (error) {
            console.error('Error fetching recent content:', error);
        }
    };

    const handleContentGenerated = async (content: any, contentType: string) => {
        try {
            let parsedContent;

            // Parse the generated content based on type
            switch (contentType) {
                case 'quiz':
                    parsedContent = parseQuizFromXML(content);
                    break;
                case 'course':
                    parsedContent = parseCourseFromXML(content);
                    break;
                case 'presentation':
                    parsedContent = parsePresentationFromXML(content);
                    break;
                case 'exercise':
                    parsedContent = parseExerciseFromXML(content);
                    break;
                default:
                    throw new Error(`Unknown content type: ${contentType}`);
            }

            // Set current content for immediate viewing
            setCurrentContent({
                type: contentType,
                data: parsedContent
            });

            // Switch to player tab
            setActiveTab('player');

            // Refresh user profile to update credits
            if (user) {
                await fetchUserProfile(user.id);
                await fetchRecentContent(user.id);
            }
        } catch (error) {
            console.error('Error processing generated content:', error);
            setError('Virhe käsiteltäessä luotua sisältöä');
        }
    };

    const handleLoadContent = (content: GeneratedContent) => {
        try {
            let parsedContent;

            switch (content.content_type) {
                case 'quiz':
                    parsedContent = content.content_data as Quiz;
                    break;
                case 'course':
                    parsedContent = content.content_data as Course;
                    break;
                case 'presentation':
                    parsedContent = content.content_data as Presentation;
                    break;
                case 'exercise':
                    parsedContent = content.content_data as Exercise;
                    break;
                default:
                    throw new Error(`Unknown content type: ${content.content_type}`);
            }

            setCurrentContent({
                type: content.content_type,
                data: parsedContent
            });

            setActiveTab('player');
        } catch (error) {
            console.error('Error loading content:', error);
            setError('Virhe ladattaessa sisältöä');
        }
    };

    const handleSignOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            setUser(null);
            setProfile(null);
            setCurrentContent(null);
            setRecentContent([]);
        } catch (error) {
            console.error('Error signing out:', error);
        }
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

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-gray-600">Ladataan KoulutusBotia...</p>
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="w-6 h-6" />
                            KoulutusBot
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Alert>
                            <AlertDescription>
                                {error || 'Kirjaudu sisään käyttääksesi palvelua'}
                            </AlertDescription>
                        </Alert>
                        <div className="mt-4 text-center">
                            <Button
                                onClick={() => window.location.href = '/login'}
                                className="w-full"
                            >
                                Kirjaudu sisään
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <BookOpen className="w-8 h-8 text-blue-600" />
                            <h1 className="text-xl font-bold text-gray-900">KoulutusBot</h1>
                            <Badge variant="secondary">Suomen opetussisältö AI</Badge>
                        </div>

                        <div className="flex items-center gap-4">
                            {profile && (
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-1 text-sm">
                                        <Coins className="w-4 h-4 text-yellow-600" />
                                        <span className="font-medium">{profile.credits}</span>
                                        <span className="text-gray-500">krediittiä</span>
                                    </div>

                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <UserIcon className="w-4 h-4" />
                                        <span>{profile.display_name || user.email}</span>
                                    </div>
                                </div>
                            )}

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSignOut}
                                className="flex items-center gap-2"
                            >
                                <LogOut className="w-4 h-4" />
                                Kirjaudu ulos
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="generator" className="flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Luo sisältöä
                        </TabsTrigger>
                        <TabsTrigger value="player" className="flex items-center gap-2">
                            <Star className="w-4 h-4" />
                            Katso sisältöä
                        </TabsTrigger>
                        <TabsTrigger value="history" className="flex items-center gap-2">
                            <History className="w-4 h-4" />
                            Historia
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="generator" className="mt-6">
                        <ContentGenerator
                            onContentGenerated={handleContentGenerated}
                            userCredits={profile?.credits || 0}
                        />
                    </TabsContent>

                    <TabsContent value="player" className="mt-6">
                        {currentContent ? (
                            <div>
                                {currentContent.type === 'quiz' && (
                                    <QuizPlayer
                                        quiz={currentContent.data as Quiz}
                                        onComplete={(results) => {
                                            console.log('Quiz completed:', results);
                                            // Here you could save results to database
                                        }}
                                    />
                                )}

                                {currentContent.type === 'course' && (
                                    <CoursePlayer
                                        course={currentContent.data as Course}
                                        onComplete={(moduleId) => {
                                            console.log('Module completed:', moduleId);
                                            // Here you could save progress to database
                                        }}
                                        completedModules={[]} // Load from database
                                    />
                                )}

                                {currentContent.type === 'presentation' && (
                                    <PresentationPlayer
                                        presentation={currentContent.data as Presentation}
                                        onComplete={() => {
                                            console.log('Presentation completed');
                                            // Here you could save completion to database
                                        }}
                                        autoAdvance={true}
                                        slideTransitionTime={10}
                                    />
                                )}

                                {currentContent.type === 'exercise' && (
                                    <ExercisePlayer
                                        exercise={currentContent.data as Exercise}
                                        onComplete={(results) => {
                                            console.log('Exercise completed:', results);
                                            // Here you could save results to database
                                        }}
                                    />
                                )}
                            </div>
                        ) : (
                            <Card className="text-center p-8">
                                <CardContent>
                                    <div className="text-gray-500 mb-4">
                                        <BookOpen className="w-12 h-12 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium mb-2">Ei sisältöä valittuna</h3>
                                        <p className="text-sm">Luo uutta sisältöä tai valitse aiemmin luotu sisältö historiasta</p>
                                    </div>
                                    <Button onClick={() => setActiveTab('generator')}>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Luo uutta sisältöä
                                    </Button>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    <TabsContent value="history" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <History className="w-5 h-5" />
                                    Luotu sisältö
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {recentContent.length > 0 ? (
                                    <div className="space-y-3">
                                        {recentContent.map((content) => (
                                            <div
                                                key={content.id}
                                                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                                                onClick={() => handleLoadContent(content)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    {getContentIcon(content.content_type)}
                                                    <div>
                                                        <h4 className="font-medium">{content.title}</h4>
                                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                                            <Badge variant="outline" className="text-xs">
                                                                {getContentTypeLabel(content.content_type)}
                                                            </Badge>
                                                            <span>{content.subject}</span>
                                                            <span>•</span>
                                                            <span>{content.grade_level}</span>
                                                            <span>•</span>
                                                            <span>{new Date(content.created_at).toLocaleDateString('fi')}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <Button variant="outline" size="sm">
                                                    Avaa
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <History className="w-12 h-12 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium mb-2">Ei luotua sisältöä</h3>
                                        <p className="text-sm">Aloita luomalla ensimmäinen opetussisältösi</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}

export default function EducationPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
        }>
            <EducationPageContent />
        </Suspense>
    );
}