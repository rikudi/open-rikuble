
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
    PenTool,
    CheckCircle2,
    XCircle,
    Clock,
    Target,
    Lightbulb,
    RotateCcw,
    Eye,
    EyeOff,
    ArrowRight
} from 'lucide-react';
import { Exercise, ExerciseTask } from '@/lib/education/content-parser';

interface ExercisePlayerProps {
    exercise: Exercise;
    onComplete?: (results: ExerciseResults) => void;
}

interface TaskResult {
    taskId: string;
    answer: string;
    isCorrect?: boolean;
    attemptCount: number;
}

interface ExerciseResults {
    exerciseId: string;
    taskResults: TaskResult[];
    completedAt: Date;
    totalScore: number;
    timeSpent: number; // seconds
}

export function ExercisePlayer({ exercise, onComplete }: ExercisePlayerProps) {
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
    const [taskAnswers, setTaskAnswers] = useState<Record<string, string>>({});
    const [taskResults, setTaskResults] = useState<Record<string, TaskResult>>({});
    const [showHints, setShowHints] = useState<Record<string, boolean>>({});
    const [showSolutions, setShowSolutions] = useState<Record<string, boolean>>({});
    const [startTime] = useState(new Date());
    const [isCompleted, setIsCompleted] = useState(false);

    const currentTask = exercise.tasks[currentTaskIndex];
    const totalTasks = exercise.tasks.length;
    const completedTasks = Object.keys(taskResults).length;
    const progressPercentage = (completedTasks / totalTasks) * 100;

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'bg-green-100 text-green-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'hard': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getDifficultyLabel = (difficulty: string) => {
        switch (difficulty) {
            case 'easy': return 'Helppo';
            case 'medium': return 'Keskitaso';
            case 'hard': return 'Vaikea';
            default: return 'Tuntematon';
        }
    };

    const getTaskTypeIcon = (type: string) => {
        switch (type) {
            case 'short_answer':
            case 'long_answer':
                return <PenTool className="w-4 h-4" />;
            default:
                return <PenTool className="w-4 h-4" />;
        }
    };

    const handleAnswerChange = (taskId: string, answer: string) => {
        setTaskAnswers(prev => ({
            ...prev,
            [taskId]: answer
        }));
    };

    const handleSubmitTask = (task: ExerciseTask) => {
        const answer = taskAnswers[task.id] || '';
        const existingResult = taskResults[task.id];
        const attemptCount = existingResult ? existingResult.attemptCount + 1 : 1;

        // Simple answer checking (in real implementation, this might involve AI or pattern matching)
        let isCorrect = false;
        if (task.solution) {
            const normalizedAnswer = answer.toLowerCase().trim();
            const normalizedSolution = task.solution.toLowerCase().trim();
            isCorrect = normalizedAnswer === normalizedSolution ||
                normalizedAnswer.includes(normalizedSolution) ||
                normalizedSolution.includes(normalizedAnswer);
        }

        const result: TaskResult = {
            taskId: task.id,
            answer,
            isCorrect,
            attemptCount
        };

        setTaskResults(prev => ({
            ...prev,
            [task.id]: result
        }));

        // Auto-advance if correct or if it's a practice exercise
        if (isCorrect || !task.solution) {
            setTimeout(() => {
                if (currentTaskIndex < totalTasks - 1) {
                    setCurrentTaskIndex(prev => prev + 1);
                } else {
                    handleCompleteExercise();
                }
            }, 1500);
        }
    };

    const handleCompleteExercise = () => {
        const endTime = new Date();
        const timeSpent = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

        const allTaskResults = exercise.tasks.map(task => {
            const existing = taskResults[task.id];
            return existing || {
                taskId: task.id,
                answer: taskAnswers[task.id] || '',
                attemptCount: 0
            };
        });

        const totalScore = allTaskResults.reduce((score, result) => {
            return score + (result.isCorrect ? 1 : 0);
        }, 0);

        const results: ExerciseResults = {
            exerciseId: exercise.id,
            taskResults: allTaskResults,
            completedAt: endTime,
            totalScore,
            timeSpent
        };

        setIsCompleted(true);
        onComplete?.(results);
    };

    const handleReset = () => {
        setCurrentTaskIndex(0);
        setTaskAnswers({});
        setTaskResults({});
        setShowHints({});
        setShowSolutions({});
        setIsCompleted(false);
    };

    const toggleHint = (taskId: string) => {
        setShowHints(prev => ({
            ...prev,
            [taskId]: !prev[taskId]
        }));
    };

    const toggleSolution = (taskId: string) => {
        setShowSolutions(prev => ({
            ...prev,
            [taskId]: !prev[taskId]
        }));
    };

    const canShowSolution = (task: ExerciseTask) => {
        const result = taskResults[task.id];
        return result && result.attemptCount >= 2; // Allow solution after 2 attempts
    };

    if (isCompleted) {
        const correctAnswers = Object.values(taskResults).filter(r => r.isCorrect).length;
        const accuracy = totalTasks > 0 ? (correctAnswers / totalTasks) * 100 : 0;

        return (
            <div className="max-w-4xl mx-auto p-6 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="w-6 h-6" />
                            Harjoitus valmis!
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold">{correctAnswers}/{totalTasks}</div>
                                <div className="text-sm text-muted-foreground">Oikeat vastaukset</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">{accuracy.toFixed(0)}%</div>
                                <div className="text-sm text-muted-foreground">Tarkkuus</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold">
                                    {Math.floor((new Date().getTime() - startTime.getTime()) / 60000)}min
                                </div>
                                <div className="text-sm text-muted-foreground">Käytetty aika</div>
                            </div>
                        </div>

                        <div className="flex justify-center gap-3">
                            <Button onClick={handleReset}>
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Aloita uudelleen
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!currentTask) {
        return (
            <div className="text-center p-8">
                <p className="text-muted-foreground">Harjoitusta ei voitu ladata.</p>
            </div>
        );
    }

    const taskResult = taskResults[currentTask.id];
    const currentAnswer = taskAnswers[currentTask.id] || '';

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">

            {/* Exercise Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <PenTool className="w-6 h-6" />
                                {exercise.title}
                            </CardTitle>
                            <p className="text-muted-foreground mt-2">{exercise.description}</p>
                        </div>
                        <div className="text-right">
                            <Badge variant="secondary" className="mb-2">
                                {exercise.subject} • {exercise.gradeLevel}
                            </Badge>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                <span>{exercise.estimatedDuration}</span>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                            <span>Harjoituksen edistyminen</span>
                            <span>{completedTasks}/{totalTasks} tehtävää</span>
                        </div>
                        <Progress value={progressPercentage} className="h-2" />
                    </div>
                </CardContent>
            </Card>

            {/* Learning Objectives */}
            {exercise.learningObjectives && exercise.learningObjectives.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Target className="w-5 h-5" />
                            Harjoituksen tavoitteet
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2">
                            {exercise.learningObjectives.map((objective, index) => (
                                <li key={index} className="flex items-start gap-2">
                                    <CheckCircle2 className="w-4 h-4 mt-0.5 text-green-600" />
                                    <span className="text-sm">{objective}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}

            {/* Current Task */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                            {getTaskTypeIcon(currentTask.type)}
                            Tehtävä {currentTaskIndex + 1}: {currentTask.title}
                        </CardTitle>
                        <div className="flex items-center gap-2">
                            <Badge className={getDifficultyColor(currentTask.difficulty)}>
                                {getDifficultyLabel(currentTask.difficulty)}
                            </Badge>
                            {taskResult && (
                                <Badge variant={taskResult.isCorrect ? "default" : "destructive"}>
                                    {taskResult.isCorrect ? (
                                        <CheckCircle2 className="w-3 h-3 mr-1" />
                                    ) : (
                                        <XCircle className="w-3 h-3 mr-1" />
                                    )}
                                    {taskResult.isCorrect ? 'Oikein' : 'Väärin'}
                                </Badge>
                            )}
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">

                    {/* Task Description */}
                    <div className="prose prose-sm max-w-none">
                        <div dangerouslySetInnerHTML={{ __html: currentTask.description }} />
                    </div>

                    {/* Answer Input */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium">Vastaus:</label>
                            <div className="flex items-center gap-2">
                                {/* Hint Button */}
                                {currentTask.hint && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => toggleHint(currentTask.id)}
                                    >
                                        <Lightbulb className="w-4 h-4 mr-1" />
                                        Vihje
                                    </Button>
                                )}

                                {/* Solution Button */}
                                {currentTask.solution && canShowSolution(currentTask) && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => toggleSolution(currentTask.id)}
                                    >
                                        {showSolutions[currentTask.id] ? (
                                            <EyeOff className="w-4 h-4 mr-1" />
                                        ) : (
                                            <Eye className="w-4 h-4 mr-1" />
                                        )}
                                        {showSolutions[currentTask.id] ? 'Piilota' : 'Ratkaisu'}
                                    </Button>
                                )}
                            </div>
                        </div>

                        {currentTask.type === 'long_answer' ? (
                            <Textarea
                                value={currentAnswer}
                                onChange={(e) => handleAnswerChange(currentTask.id, e.target.value)}
                                placeholder="Kirjoita vastauksesi tähän..."
                                className="min-h-32"
                                disabled={!!taskResult}
                            />
                        ) : (
                            <Input
                                value={currentAnswer}
                                onChange={(e) => handleAnswerChange(currentTask.id, e.target.value)}
                                placeholder="Kirjoita vastauksesi tähän..."
                                disabled={!!taskResult}
                            />
                        )}
                    </div>

                    {/* Hint Display */}
                    {showHints[currentTask.id] && currentTask.hint && (
                        <Alert>
                            <Lightbulb className="w-4 h-4" />
                            <AlertDescription>
                                <strong>Vihje:</strong> {currentTask.hint}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Solution Display */}
                    {showSolutions[currentTask.id] && currentTask.solution && (
                        <Alert>
                            <Eye className="w-4 h-4" />
                            <AlertDescription>
                                <strong>Ratkaisu:</strong> {currentTask.solution}
                                {currentTask.explanation && (
                                    <div className="mt-2">
                                        <strong>Selitys:</strong> {currentTask.explanation}
                                    </div>
                                )}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Task Result */}
                    {taskResult && (
                        <Alert variant={taskResult.isCorrect ? "default" : "destructive"}>
                            <AlertDescription className="flex items-center justify-between">
                                <span>
                                    {taskResult.isCorrect ? (
                                        <>
                                            <CheckCircle2 className="w-4 h-4 inline mr-2" />
                                            Oikein! Hyvä vastaus.
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="w-4 h-4 inline mr-2" />
                                            Ei aivan oikein. Yritä uudelleen!
                                        </>
                                    )}
                                </span>
                                {taskResult.attemptCount > 1 && (
                                    <span className="text-sm">
                                        Yritys {taskResult.attemptCount}
                                    </span>
                                )}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Submit Button */}
                    <div className="flex justify-between">
                        <div className="text-sm text-muted-foreground">
                            Tehtävä {currentTaskIndex + 1} / {totalTasks}
                        </div>

                        <Button
                            onClick={() => handleSubmitTask(currentTask)}
                            disabled={!currentAnswer.trim() || (taskResult?.isCorrect)}
                            size="lg"
                        >
                            {taskResult?.isCorrect ? (
                                'Jatka seuraavaan'
                            ) : taskResult ? (
                                'Yritä uudelleen'
                            ) : (
                                'Tarkista vastaus'
                            )}
                            {!taskResult?.isCorrect && <ArrowRight className="w-4 h-4 ml-2" />}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Task Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Tehtävät</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {exercise.tasks.map((task, index) => {
                            const result = taskResults[task.id];
                            return (
                                <div
                                    key={task.id}
                                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${index === currentTaskIndex
                                            ? 'bg-blue-50 border-blue-200'
                                            : result?.isCorrect
                                                ? 'bg-green-50 border-green-200'
                                                : result
                                                    ? 'bg-red-50 border-red-200'
                                                    : 'hover:bg-gray-50'
                                        }`}
                                    onClick={() => setCurrentTaskIndex(index)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${result?.isCorrect
                                                    ? 'bg-green-600 text-white'
                                                    : result
                                                        ? 'bg-red-600 text-white'
                                                        : index === currentTaskIndex
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-gray-200 text-gray-600'
                                                }`}>
                                                {result?.isCorrect ? (
                                                    <CheckCircle2 className="w-3 h-3" />
                                                ) : result ? (
                                                    <XCircle className="w-3 h-3" />
                                                ) : (
                                                    index + 1
                                                )}
                                            </div>
                                            <div className="text-sm font-medium">{task.title}</div>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={`text-xs ${getDifficultyColor(task.difficulty)}`}
                                        >
                                            {getDifficultyLabel(task.difficulty)}
                                        </Badge>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}