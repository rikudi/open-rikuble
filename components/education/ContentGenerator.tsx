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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, BookOpen, FileQuestion, Presentation, PenTool, Coins, Save, CheckCircle } from 'lucide-react';
import { SUBJECTS, GRADE_LEVELS, CONTENT_TYPES } from '@/lib/education/prompt-templates';

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

interface SaveState {
    isSaving: boolean;
    isSaved: boolean;
    error: string | null;
}

export function ContentGenerator({ onContentGenerated, userCredits = 0 }: ContentGeneratorProps) {
    const [contentType, setContentType] = useState<string>('quiz');
    const [subject, setSubject] = useState<string>('');
    const [gradeLevel, setGradeLevel] = useState<string>('');
    const [language, setLanguage] = useState<string>('fi');
    const [customTopic, setCustomTopic] = useState<string>('');
    const [additionalInstructions, setAdditionalInstructions] = useState<string>('');

    const [generatedData, setGeneratedData] = useState<any | null>(null);

    const [generationState, setGenerationState] = useState<GenerationState>({
        isGenerating: false,
        progress: 0,
        status: '',
        error: null
    });

    const [saveState, setSaveState] = useState<SaveState>({
        isSaving: false,
        isSaved: false,
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

    const requiredCredits = CONTENT_TYPES[contentType as keyof typeof CONTENT_TYPES]?.credits || 0;
    const hasEnoughCredits = userCredits >= requiredCredits;

    const canGenerate = () => {
        return subject && gradeLevel && hasEnoughCredits;
    };

    const handleGenerate = async () => {
        if (!canGenerate()) return;

        setGeneratedData(null);
        setSaveState({ isSaving: false, isSaved: false, error: null });
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
                                    setGenerationState(prev => ({ ...prev, status: data.message, progress: Math.min(prev.progress + 20, 90) }));
                                    break;
                                case 'content':
                                    setGenerationState(prev => ({ ...prev, progress: Math.min(prev.progress + 5, 85) }));
                                    break;
                                case 'complete':
                                    setGeneratedData(data.content);
                                    setGenerationState(prev => ({ ...prev, status: 'Sisältö luotu onnistuneesti!', progress: 100 }));
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
            const errorMessage = error instanceof Error ? error.message : 'Tuntematon virhe';
            setGenerationState(prev => ({ ...prev, error: errorMessage, isGenerating: false }));
        } finally {
            setTimeout(() => {
                setGenerationState(prev => ({ ...prev, isGenerating: false }));
            }, 1000);
        }
    };

    const handleSaveContent = async () => {
        if (!generatedData) return;

        setSaveState({ isSaving: true, isSaved: false, error: null });

        try {
            const contentDetails = {
                contentType,
                title: generatedData.metadata.title || `${subject} - ${contentType}`,
                description: `Generated ${contentType} for ${subject}`,
                subject,
                gradeLevel,
                language,
                curriculumStandards: { oph: 'tbd' }, // Placeholder
                contentData: generatedData,
            };

            const response = await fetch('/api/education/save-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contentDetails, creditCost: requiredCredits }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Tallennus epäonnistui');
            }

            const result = await response.json();
            setSaveState({ isSaving: false, isSaved: true, error: null });
            // Optionally, update user credits display locally

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Tuntematon virhe';
            setSaveState({ isSaving: false, isSaved: false, error: errorMessage });
        }
    };

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
                    <div className="space-y-3">
                        <Label>Sisältötyyppi</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {Object.entries(CONTENT_TYPES).map(([type, config]) => (
                                <Card
                                    key={type}
                                    className={`cursor-pointer transition-all hover:shadow-md ${contentType === type ? 'ring-2 ring-primary' : ''}`}
                                    onClick={() => setContentType(type)}
                                >
                                    <CardContent className="p-4 text-center">
                                        <div className="flex justify-center mb-2">{getContentTypeIcon(type)}</div>
                                        <div className="text-sm font-medium">{config.description}</div>
                                        <Badge variant="secondary" className="mt-1 text-xs">{config.credits} krediittiä</Badge>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="subject">Oppiaine</Label>
                        <Select value={subject} onValueChange={setSubject}>
                            <SelectTrigger><SelectValue placeholder="Valitse oppiaine" /></SelectTrigger>
                            <SelectContent>
                                {Object.entries(SUBJECTS).map(([key, value]) => (
                                    <SelectItem key={key} value={key}>{value}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="gradeLevel">Vuosiluokka / Taso</Label>
                        <Select value={gradeLevel} onValueChange={setGradeLevel}>
                            <SelectTrigger><SelectValue placeholder="Valitse vuosiluokka" /></SelectTrigger>
                            <SelectContent>
                                {Object.entries(GRADE_LEVELS).map(([key, value]) => (
                                    <SelectItem key={key} value={key}>{value}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="language">Kieli</Label>
                        <Select value={language} onValueChange={setLanguage}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="fi">Suomi</SelectItem>
                                <SelectItem value="sv">Ruotsi</SelectItem>
                                <SelectItem value="en">Englanti</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="customTopic">Tarkka aihe (valinnainen)</Label>
                        <Input id="customTopic" value={customTopic} onChange={(e) => setCustomTopic(e.target.value)} placeholder="Esim. 'Suomen sisällissota' tai 'Pythagoraan lause'" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="instructions">Lisäohjeet (valinnainen)</Label>
                        <Textarea id="instructions" value={additionalInstructions} onChange={(e) => setAdditionalInstructions(e.target.value)} placeholder="Erityisvaatimukset, vaikeustaso, painotukset..." rows={3} />
                    </div>

                    {generationState.error && <Alert variant="destructive"><AlertDescription>{generationState.error}</AlertDescription></Alert>}
                    
                    {!hasEnoughCredits && subject && gradeLevel && (
                        <Alert><AlertDescription>Tarvitset {requiredCredits} krediittiä tämän sisällön luomiseen. Sinulla on {userCredits} krediittiä.</AlertDescription></Alert>
                    )}

                    {generationState.isGenerating && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">{generationState.status}</span></div>
                            <Progress value={generationState.progress} />
                        </div>
                    )}

                    <Button onClick={handleGenerate} disabled={!canGenerate() || generationState.isGenerating} className="w-full" size="lg">
                        {generationState.isGenerating ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Luodaan sisältöä...</>
                        ) : (
                            <>{getContentTypeIcon(contentType)}<span className="ml-2">Luo {CONTENT_TYPES[contentType as keyof typeof CONTENT_TYPES]?.description} ({requiredCredits} krediittiä)</span></>
                        )}
                    </Button>

                    {generatedData && !saveState.isSaved && (
                        <div className="pt-4 space-y-4 border-t">
                            <h3 className="text-lg font-medium">Tallennus</h3>
                            {saveState.error && <Alert variant="destructive"><AlertDescription>{saveState.error}</AlertDescription></Alert>}
                            <Button onClick={handleSaveContent} disabled={saveState.isSaving} className="w-full">
                                {saveState.isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Tallennetaan...</> : <><Save className="w-4 h-4 mr-2" />Tallenna sisältö</>}</Button>
                        </div>
                    )}

                    {saveState.isSaved && (
                        <Alert variant="success">
                            <CheckCircle className="h-4 w-4" />
                            <AlertTitle>Onnistui!</AlertTitle>
                            <AlertDescription>Sisältö on tallennettu onnistuneesti.</AlertDescription>
                        </Alert>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
