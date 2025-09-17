'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, BookOpen, FileQuestion, Presentation, PenTool, Coins } from 'lucide-react';
import { SUBJECTS, GRADE_LEVELS, CONTENT_TYPES } from '@/lib/education/prompt-templates';
import { Quiz } from '@/lib/education/content-parser';

interface ContentGeneratorProps {
    onContentGenerated?: (content: any, contentType: string) => void;
    userCredits?: number;
}

interface GenerationState {
    isGenerating: boolean;
    progress: number;
    status: string;
    error: string | null;
}

export function ContentGenerator({ onContentGenerated, userCredits = 0 }: ContentGeneratorProps) {
    const [contentType, setContentType] = useState<string>('quiz');
    const [subject, setSubject] = useState<string>('');
    const [gradeLevel, setGradeLevel] = useState<string>('');
    const [language, setLanguage] = useState<string>('fi');
    const [customTopic, setCustomTopic] = useState<string>('');
    const [additionalInstructions, setAdditionalInstructions] = useState<string>('');

    const [generationState, setGenerationState] = useState<GenerationState>({
        isGenerating: false,
        progress: 0,
        status: '',
        error: null
    });

    const getContentTypeIcon = (type: string) => {
        switch (type) {
            case 'quiz': return <FileQuestion className="w-5 h-5" />;
            case 'course': return <BookOpen className="w-5 h-5" />;
            case 'presentation': return <Presentation className="w-5 h-5" />;
            case 'exercise': return <PenTool className="w-5 h-5" />;
            default: return <FileQuestion className="w-5 h-5" />;
        }
    };

    const canGenerate = () => {
        const requiredCredits = CONTENT_TYPES[contentType as keyof typeof CONTENT_TYPES]?.credits || 0;
        return subject && gradeLevel && userCredits >= requiredCredits;
    };

    const handleGenerate = async () => {
        if (!canGenerate()) return;

        setGenerationState({
            isGenerating: true,
            progress: 0,
            status: 'Aloitetaan sisällön luomista...',
            error: null
        });

        try {
            const response = await fetch('/api/generate-educational-content', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contentType,
                    subject: customTopic || subject,
                    gradeLevel,
                    language,
                    additionalParams: {
                        instructions: additionalInstructions
                    }
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Sisällön luominen epäonnistui');
            }

            const reader = response.body?.getReader();
            if (!reader) throw new Error('No response stream available');

            let generatedContent = null;

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = new TextDecoder().decode(value);
                const lines = chunk.split('\n').filter(line => line.trim());

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));

                            switch (data.type) {
                                case 'status':
                                    setGenerationState(prev => ({
                                        ...prev,
                                        status: data.message,
                                        progress: Math.min(prev.progress + 20, 90)
                                    }));
                                    break;

                                case 'content':
                                    setGenerationState(prev => ({
                                        ...prev,
                                        progress: Math.min(prev.progress + 5, 85)
                                    }));
                                    break;

                                case 'complete':
                                    generatedContent = data.content;
                                    setGenerationState(prev => ({
                                        ...prev,
                                        status: 'Sisältö luotu onnistuneesti!',
                                        progress: 100
                                    }));

                                    // Call the callback with generated content
                                    onContentGenerated?.(data.content, contentType);
                                    break;

                                case 'error':
                                    throw new Error(data.message);
                            }
                        } catch (parseError) {
                            console.error('Error parsing stream data:', parseError);
                        }
                    }
                }
            }

        } catch (error) {
            console.error('Generation error:', error);
            setGenerationState(prev => ({
                ...prev,
                error: error instanceof Error ? error.message : 'Tuntematon virhe',
                isGenerating: false
            }));
        } finally {
            setTimeout(() => {
                setGenerationState(prev => ({
                    ...prev,
                    isGenerating: false
                }));
            }, 1000);
        }
    };

    const requiredCredits = CONTENT_TYPES[contentType as keyof typeof CONTENT_TYPES]?.credits || 0;
    const hasEnoughCredits = userCredits >= requiredCredits;

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BookOpen className="w-6 h-6" />
                        Luo opetussisältöä
                    </CardTitle>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Coins className="w-4 h-4" />
                        <span>Krediittejä käytettävissä: {userCredits}</span>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">

                    {/* Content Type Selection */}
                    <div className="space-y-3">
                        <Label>Sisältötyyppi</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {Object.entries(CONTENT_TYPES).map(([type, config]) => (
                                <Card
                                    key={type}
                                    className={`cursor-pointer transition-all hover:shadow-md ${contentType === type ? 'ring-2 ring-primary' : ''
                                        }`}
                                    onClick={() => setContentType(type)}
                                >
                                    <CardContent className="p-4 text-center">
                                        <div className="flex justify-center mb-2">
                                            {getContentTypeIcon(type)}
                                        </div>
                                        <div className="text-sm font-medium">{config.description}</div>
                                        <Badge variant="secondary" className="mt-1 text-xs">
                                            {config.credits} krediittiä
                                        </Badge>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    {/* Subject Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="subject">Oppiaine</Label>
                        <Select value={subject} onValueChange={setSubject}>
                            <SelectTrigger>
                                <SelectValue placeholder="Valitse oppiaine" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(SUBJECTS).map(([key, value]) => (
                                    <SelectItem key={key} value={key}>{value}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Grade Level Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="gradeLevel">Vuosiluokka / Taso</Label>
                        <Select value={gradeLevel} onValueChange={setGradeLevel}>
                            <SelectTrigger>
                                <SelectValue placeholder="Valitse vuosiluokka" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(GRADE_LEVELS).map(([key, value]) => (
                                    <SelectItem key={key} value={key}>{value}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Language Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="language">Kieli</Label>
                        <Select value={language} onValueChange={setLanguage}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="fi">Suomi</SelectItem>
                                <SelectItem value="sv">Ruotsi</SelectItem>
                                <SelectItem value="en">Englanti</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Custom Topic */}
                    <div className="space-y-2">
                        <Label htmlFor="customTopic">Tarkka aihe (valinnainen)</Label>
                        <Input
                            id="customTopic"
                            value={customTopic}
                            onChange={(e) => setCustomTopic(e.target.value)}
                            placeholder="Esim. 'Suomen sisällissota' tai 'Pythagoraan lause'"
                        />
                    </div>

                    {/* Additional Instructions */}
                    <div className="space-y-2">
                        <Label htmlFor="instructions">Lisäohjeet (valinnainen)</Label>
                        <Textarea
                            id="instructions"
                            value={additionalInstructions}
                            onChange={(e) => setAdditionalInstructions(e.target.value)}
                            placeholder="Erityisvaatimukset, vaikeustaso, painotukset..."
                            rows={3}
                        />
                    </div>

                    {/* Error Display */}
                    {generationState.error && (
                        <Alert variant="destructive">
                            <AlertDescription>{generationState.error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Credit Warning */}
                    {!hasEnoughCredits && subject && gradeLevel && (
                        <Alert>
                            <AlertDescription>
                                Tarvitset {requiredCredits} krediittiä tämän sisällön luomiseen.
                                Sinulla on {userCredits} krediittiä.
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Generation Progress */}
                    {generationState.isGenerating && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm">{generationState.status}</span>
                            </div>
                            <Progress value={generationState.progress} />
                        </div>
                    )}

                    {/* Generate Button */}
                    <Button
                        onClick={handleGenerate}
                        disabled={!canGenerate() || generationState.isGenerating}
                        className="w-full"
                        size="lg"
                    >
                        {generationState.isGenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Luodaan sisältöä...
                            </>
                        ) : (
                            <>
                                {getContentTypeIcon(contentType)}
                                <span className="ml-2">
                                    Luo {CONTENT_TYPES[contentType as keyof typeof CONTENT_TYPES]?.description}
                                    ({requiredCredits} krediittiä)
                                </span>
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}