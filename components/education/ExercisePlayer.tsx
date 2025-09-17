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
import { Exercise, ExerciseSet } from '@/lib/education/content-parser';

interface ExercisePlayerProps {
    exerciseSet: ExerciseSet;
    onComplete?: (results: ExerciseResults) => void;
}

interface TaskResult {
    taskId: number;
    answer: string;
    isCorrect?: boolean;
    attemptCount: number;
}

interface ExerciseResults {
    exerciseSetTitle: string;
    taskResults: TaskResult[];
    completedAt: Date;
    totalScore: number;
    timeSpent: number; // seconds
}

export function ExercisePlayer({ exerciseSet, onComplete }: ExercisePlayerProps) {
    const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
    const [taskAnswers, setTaskAnswers] = useState<Record<number, string>>({});
    const [taskResults, setTaskResults] = useState<Record<number, TaskResult>>({});
    const [showHints, setShowHints] = useState<Record<number, boolean>>({});
    const [showSolutions, setShowSolutions] = useState<Record<number, boolean>>({});
    const [startTime] = useState(new Date());
    const [isCompleted, setIsCompleted] = useState(false);

    const currentTask = exerciseSet.exercises[currentTaskIndex];
    const totalTasks = exerciseSet.exercises.length;
    const completedTasks = Object.keys(taskResults).length;
    const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    const getTaskTypeIcon = (type: string) => {
        switch (type) {
            case 'short_answer':
            case 'long_answer':
                return <PenTool className="w-4 h-4" />;
            default:
                return <PenTool className="w-4 h-4" />;
        }
    };

    const handleAnswerChange = (taskId: number, answer: string) => {
        setTaskAnswers(prev => ({ ...prev, [taskId]: answer }));
    };

    const handleSubmitTask = (task: Exercise) => {
        const answer = taskAnswers[task.id] || '';
        const existingResult = taskResults[task.id];
        const attemptCount = existingResult ? existingResult.attemptCount + 1 : 1;

        let isCorrect = false;
        if (task.solution) {
            const normalizedAnswer = answer.toLowerCase().trim();
            const normalizedSolution = task.solution.toLowerCase().trim();
            isCorrect = normalizedAnswer === normalizedSolution || normalizedAnswer.includes(normalizedSolution) || normalizedSolution.includes(normalizedAnswer);
        }

        const result: TaskResult = { taskId: task.id, answer, isCorrect, attemptCount };
        setTaskResults(prev => ({ ...prev, [task.id]: result }));

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

        const allTaskResults = exerciseSet.exercises.map(task => {
            return taskResults[task.id] || { taskId: task.id, answer: taskAnswers[task.id] || '', attemptCount: 0 };
        });

        const totalScore = allTaskResults.reduce((score, result) => score + (result.isCorrect ? 1 : 0), 0);

        const results: ExerciseResults = {
            exerciseSetTitle: exerciseSet.metadata.title,
            taskResults: allTaskResults,
            completedAt: endTime,
            totalScore,
            timeSpent
        };

        setIsCompleted(true);
        onComplete?.(results);
    };

    if (!currentTask) {
        return <div>Loading...</div>
    }

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>{exerciseSet.metadata.title}</CardTitle>
                </CardHeader>
                <CardContent>
                    <Progress value={progressPercentage} className="mb-4" />
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-bold text-lg mb-2">Tehtävä {currentTaskIndex + 1}: {currentTask.question}</h3>
                        <Textarea 
                            value={taskAnswers[currentTask.id] || ''}
                            onChange={(e) => handleAnswerChange(currentTask.id, e.target.value)}
                            className="mb-2"
                        />
                        <Button onClick={() => handleSubmitTask(currentTask)}>Tarkista</Button>
                        {taskResults[currentTask.id] && (
                            <div className={`mt-2 p-2 rounded-md ${taskResults[currentTask.id].isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                                {taskResults[currentTask.id].isCorrect ? 'Oikein!' : `Väärin. Oikea vastaus: ${currentTask.solution}`}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}