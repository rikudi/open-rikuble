'use client';

import React, { useState } from 'react';
import { Quiz, QuizQuestion } from '@/lib/education/content-parser';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle, Clock, RotateCcw } from 'lucide-react';

interface QuizPlayerProps {
    quiz: Quiz;
    onComplete?: (results: QuizResults) => void;
    showAnswers?: boolean;
}

interface QuizResults {
    answers: Record<number, number>;
    score: number;
    maxScore: number;
    timeSpent: number;
    completedAt: Date;
}

export function QuizPlayer({ quiz, onComplete, showAnswers = true }: QuizPlayerProps) {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [showResults, setShowResults] = useState(false);
    const [startTime] = useState(Date.now());
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

    const handleAnswerSelect = (answerIndex: number) => {
        setSelectedAnswer(answerIndex);
    };

    const handleNextQuestion = () => {
        if (selectedAnswer !== null) {
            setAnswers(prev => ({
                ...prev,
                [quiz.questions[currentQuestion].id]: selectedAnswer
            }));

            setSelectedAnswer(null);

            if (currentQuestion < quiz.questions.length - 1) {
                setCurrentQuestion(prev => prev + 1);
            } else {
                completeQuiz();
            }
        }
    };

    const handlePreviousQuestion = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(prev => prev - 1);
            // Restore previous answer if it exists
            const prevAnswer = answers[quiz.questions[currentQuestion - 1].id];
            setSelectedAnswer(prevAnswer !== undefined ? prevAnswer : null);
        }
    };

    const completeQuiz = () => {
        const finalAnswers = {
            ...answers,
            [quiz.questions[currentQuestion].id]: selectedAnswer!
        };

        const score = quiz.questions.reduce((total, question) => {
            const userAnswer = finalAnswers[question.id];
            const correct = question.options[userAnswer]?.correct || false;
            return total + (correct ? 1 : 0);
        }, 0);

        const results: QuizResults = {
            answers: finalAnswers,
            score,
            maxScore: quiz.questions.length,
            timeSpent: Math.floor((Date.now() - startTime) / 1000),
            completedAt: new Date()
        };

        setShowResults(true);
        onComplete?.(results);
    };

    const resetQuiz = () => {
        setCurrentQuestion(0);
        setAnswers({});
        setShowResults(false);
        setSelectedAnswer(null);
    };

    const progress = ((currentQuestion) / quiz.questions.length) * 100;

    if (showResults) {
        return <QuizResults quiz={quiz} answers={answers} showAnswers={showAnswers} onReset={resetQuiz} />;
    }

    const question = quiz.questions[currentQuestion];

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Quiz Header */}
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-2xl">{quiz.metadata.title}</CardTitle>
                            <p className="text-muted-foreground">
                                {quiz.metadata.subject} • {quiz.metadata.grade_level}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-muted-foreground">
                                Kysymys {currentQuestion + 1} / {quiz.questions.length}
                            </div>
                            <Progress value={progress} className="w-32" />
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Question Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl">
                        {question.text}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <RadioGroup
                        value={selectedAnswer?.toString()}
                        onValueChange={(value: string) => handleAnswerSelect(parseInt(value))}
                        className="space-y-3"
                    >
                        {question.options.map((option, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                                <Label
                                    htmlFor={`option-${index}`}
                                    className="flex-1 cursor-pointer p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                                >
                                    {option.text}
                                </Label>
                            </div>
                        ))}
                    </RadioGroup>

                    {/* Navigation */}
                    <div className="flex justify-between mt-6">
                        <Button
                            variant="outline"
                            onClick={handlePreviousQuestion}
                            disabled={currentQuestion === 0}
                        >
                            Edellinen
                        </Button>

                        <Button
                            onClick={handleNextQuestion}
                            disabled={selectedAnswer === null}
                        >
                            {currentQuestion === quiz.questions.length - 1 ? 'Viimeistele' : 'Seuraava'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

interface QuizResultsProps {
    quiz: Quiz;
    answers: Record<number, number>;
    showAnswers: boolean;
    onReset: () => void;
}

function QuizResults({ quiz, answers, showAnswers, onReset }: QuizResultsProps) {
    const score = quiz.questions.reduce((total, question) => {
        const userAnswer = answers[question.id];
        const correct = question.options[userAnswer]?.correct || false;
        return total + (correct ? 1 : 0);
    }, 0);

    const percentage = Math.round((score / quiz.questions.length) * 100);

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Results Summary */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-2xl flex items-center gap-2">
                        <CheckCircle className="text-green-500" />
                        Testi suoritettu!
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-600">{score}</div>
                            <div className="text-sm text-muted-foreground">oikeat vastaukset</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold">{percentage}%</div>
                            <div className="text-sm text-muted-foreground">pistemäärä</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold">{quiz.questions.length}</div>
                            <div className="text-sm text-muted-foreground">kysymystä yhteensä</div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-center">
                        <Button onClick={onReset} variant="outline">
                            <RotateCcw className="w-4 h-4 mr-2" />
                            Tee uudelleen
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Detailed Results */}
            {showAnswers && (
                <div className="space-y-4">
                    <h3 className="text-xl font-semibold">Vastaukset ja selitykset</h3>
                    {quiz.questions.map((question, questionIndex) => {
                        const userAnswer = answers[question.id];
                        const isCorrect = question.options[userAnswer]?.correct || false;
                        const correctAnswerIndex = question.options.findIndex(opt => opt.correct);

                        return (
                            <Card key={question.id}>
                                <CardHeader>
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        {isCorrect ? (
                                            <CheckCircle className="text-green-500 w-5 h-5" />
                                        ) : (
                                            <XCircle className="text-red-500 w-5 h-5" />
                                        )}
                                        Kysymys {questionIndex + 1}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="font-medium mb-4">{question.text}</p>

                                    <div className="space-y-2">
                                        {question.options.map((option, optionIndex) => {
                                            const isUserAnswer = userAnswer === optionIndex;
                                            const isCorrectOption = option.correct;

                                            let className = "p-3 rounded-lg border ";
                                            if (isCorrectOption) {
                                                className += "bg-green-50 border-green-200 text-green-800";
                                            } else if (isUserAnswer && !isCorrectOption) {
                                                className += "bg-red-50 border-red-200 text-red-800";
                                            } else {
                                                className += "bg-gray-50";
                                            }

                                            return (
                                                <div key={optionIndex} className={className}>
                                                    <div className="flex items-center gap-2">
                                                        {isCorrectOption && <CheckCircle className="w-4 h-4 text-green-600" />}
                                                        {isUserAnswer && !isCorrectOption && <XCircle className="w-4 h-4 text-red-600" />}
                                                        <span>{option.text}</span>
                                                        {isUserAnswer && (
                                                            <span className="ml-auto text-sm font-medium">
                                                                Sinun vastauksesi
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {question.explanation && (
                                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                                            <p className="text-sm font-medium text-blue-800 mb-1">Selitys:</p>
                                            <p className="text-blue-700">{question.explanation}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}