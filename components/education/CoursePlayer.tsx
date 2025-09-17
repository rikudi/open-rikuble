'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
    BookOpen,
    ChevronLeft,
    ChevronRight,
    Clock,
    Target,
    CheckCircle2,
    PlayCircle,
    FileText,
    Video,
    PenTool
} from 'lucide-react';
import { Course, CourseModule, ModuleContent } from '@/lib/education/content-parser';

interface CoursePlayerProps {
    course: Course;
    onComplete?: (moduleId: string) => void;
    completedModules?: string[];
}

export function CoursePlayer({ course, onComplete, completedModules = [] }: CoursePlayerProps) {
    const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
    const [currentContentIndex, setCurrentContentIndex] = useState(0);

    const currentModule = course.modules[currentModuleIndex];
    const currentContent = currentModule?.content[currentContentIndex];
    const totalModules = course.modules.length;
    const totalContent = course.modules.reduce((sum, module) => sum + module.content.length, 0);
    const completedCount = completedModules.length;
    const progressPercentage = (completedCount / totalModules) * 100;

    const getContentIcon = (type: string) => {
        switch (type) {
            case 'reading': return <FileText className="w-4 h-4" />;
            case 'video': return <Video className="w-4 h-4" />;
            case 'activity': return <PenTool className="w-4 h-4" />;
            default: return <FileText className="w-4 h-4" />;
        }
    };

    const getContentTypeLabel = (type: string) => {
        switch (type) {
            case 'reading': return 'Lukemista';
            case 'video': return 'Video';
            case 'activity': return 'Aktiviteetti';
            default: return 'Sisältö';
        }
    };

    const handlePreviousContent = () => {
        if (currentContentIndex > 0) {
            setCurrentContentIndex(prev => prev - 1);
        } else if (currentModuleIndex > 0) {
            setCurrentModuleIndex(prev => prev - 1);
            const prevModule = course.modules[currentModuleIndex - 1];
            setCurrentContentIndex(prevModule.content.length - 1);
        }
    };

    const handleNextContent = () => {
        if (currentContentIndex < currentModule.content.length - 1) {
            setCurrentContentIndex(prev => prev + 1);
        } else if (currentModuleIndex < course.modules.length - 1) {
            setCurrentModuleIndex(prev => prev + 1);
            setCurrentContentIndex(0);
        }
    };

    const handleCompleteModule = () => {
        if (currentModule && !isModuleCompleted(currentModule.id)) {
            onComplete?.(currentModule.id.toString());
        }
    };

    const isModuleCompleted = (moduleId: number) => {
        return completedModules.includes(moduleId.toString());
    };
    const canNavigateNext = currentContentIndex < currentModule.content.length - 1 ||
        currentModuleIndex < course.modules.length - 1;
    const canNavigatePrev = currentContentIndex > 0 || currentModuleIndex > 0;

    if (!currentModule || !currentContent) {
        return (
            <div className="text-center p-8">
                <p className="text-muted-foreground">Kurssia ei voitu ladata.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">

            {/* Course Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <BookOpen className="w-6 h-6" />
                                {course.metadata.title}
                            </CardTitle>
                            <p className="text-muted-foreground mt-2">{course.metadata.description}</p>
                        </div>
                        <div className="text-right">
                            <Badge variant="secondary" className="mb-2">
                                {course.metadata.subject} • {course.metadata.grade_level}
                            </Badge>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                <span>{course.metadata.estimatedDuration || `${course.metadata.duration} min`}</span>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span>Kurssin edistyminen</span>
                            <span>{completedCount}/{totalModules} moduulia</span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                    </div>
                </CardContent>
            </Card>

            {/* Learning Objectives */}
            {course.learning_objectives && course.learning_objectives.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Target className="w-5 h-5" />
                            Oppimistavoitteet
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {course.learning_objectives.map((objective: string, index: number) => (
                                <li key={index} className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600" />
                                    <span className="text-sm">{objective}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {/* Module Navigation */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                            Moduuli {currentModuleIndex + 1}: {currentModule.title}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            {isModuleCompleted(currentModule.id) && (
                                <Badge variant="default" className="bg-green-600">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Valmis
                                </Badge>
                            )}
                            <Badge variant="outline">
                                {currentContentIndex + 1}/{currentModule.content.length}
                            </Badge>
                        </div>
                    </div>
                    <p className="text-muted-foreground">{currentModule.description}</p>
                </CardHeader>
            </Card>

            {/* Content Display */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            {getContentIcon(currentContent.type)}
                            {currentContent.title}
                        </CardTitle>
                        <Badge variant="secondary">
                            {getContentTypeLabel(currentContent.type)}
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: currentContent.content }} />

                    {/* Activity Instructions */}
                    {currentContent.type === 'activity' && currentContent.activity && (
                        <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                            <h4 className="flex items-center gap-2 font-semibold text-blue-900 mb-2">
                                <PenTool className="w-4 h-4" />
                                Tehtävä
                            </h4>
                            <p className="text-blue-800 text-sm">
                                {currentContent.activity.instructions}
                            </p>
                            {currentContent.activity.estimatedTime && (
                                <div className="flex items-center gap-1 mt-2 text-blue-700 text-xs">
                                    <Clock className="w-3 h-3" />
                                    <span>Arvioitu aika: {currentContent.activity.estimatedTime}</span>
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between">
                <Button
                    variant="outline"
                    onClick={handlePreviousContent}
                    disabled={!canNavigatePrev}
                >
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Edellinen
                </Button>

                <div className="flex items-center gap-3">
                    {currentContentIndex === currentModule.content.length - 1 &&
                        !isModuleCompleted(currentModule.id) && (
                            <Button onClick={handleCompleteModule} variant="default">
                                <CheckCircle2 className="w-4 h-4 mr-2" />
                                Merkitse moduuli valmiiksi
                            </Button>
                        )}
                </div>

                <Button
                    variant="outline"
                    onClick={handleNextContent}
                    disabled={!canNavigateNext}
                >
                    Seuraava
                    <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
            </div>

            {/* Module Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Kurssin moduulit</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {course.modules.map((module, index) => (
                            <div
                                key={module.id}
                                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${index === currentModuleIndex
                                    ? 'bg-blue-50 border-blue-200'
                                    : 'hover:bg-gray-50'
                                    }`}
                                onClick={() => {
                                    setCurrentModuleIndex(index);
                                    setCurrentContentIndex(0);
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${isModuleCompleted(module.id)
                                        ? 'bg-green-600 text-white'
                                        : index === currentModuleIndex
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 text-gray-600'
                                        }`}>
                                        {isModuleCompleted(module.id) ? (
                                            <CheckCircle2 className="w-4 h-4" />
                                        ) : (
                                            index + 1
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-medium">{module.title}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {module.content.length} sisältöä
                                        </div>
                                    </div>
                                </div>
                                {index === currentModuleIndex && (
                                    <PlayCircle className="w-5 h-5 text-blue-600" />
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}