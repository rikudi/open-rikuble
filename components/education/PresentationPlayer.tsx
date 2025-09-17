'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
    ChevronLeft,
    ChevronRight,
    Presentation as PresentationIcon,
    Play,
    Pause,
    RotateCcw,
    Maximize2,
    Clock,
    Eye
} from 'lucide-react';
import { Presentation, Slide } from '@/lib/education/content-parser';

interface PresentationPlayerProps {
    presentation: Presentation;
    onComplete?: () => void;
    autoAdvance?: boolean;
    slideTransitionTime?: number; // seconds
}

export function PresentationPlayer({
    presentation,
    onComplete,
    autoAdvance = false,
    slideTransitionTime = 10
}: PresentationPlayerProps) {
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [timeLeft, setTimeLeft] = useState(slideTransitionTime);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const currentSlide = presentation.slides[currentSlideIndex];
    const totalSlides = presentation.slides.length;
    const progressPercentage = ((currentSlideIndex + 1) / totalSlides) * 100;

    // Auto-advance timer
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isPlaying && autoAdvance && currentSlideIndex < totalSlides - 1) {
            interval = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        handleNextSlide();
                        return slideTransitionTime;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPlaying, currentSlideIndex, autoAdvance, slideTransitionTime, totalSlides]);

    // Reset timer when slide changes
    useEffect(() => {
        setTimeLeft(slideTransitionTime);
    }, [currentSlideIndex, slideTransitionTime]);

    const handlePreviousSlide = React.useCallback(() => {
        if (currentSlideIndex > 0) {
            setCurrentSlideIndex(prev => prev - 1);
            setIsPlaying(false);
        }
    }, [currentSlideIndex]);

    const handleNextSlide = React.useCallback(() => {
        if (currentSlideIndex < totalSlides - 1) {
            setCurrentSlideIndex(prev => prev + 1);
        } else {
            setIsPlaying(false);
            onComplete?.();
        }
    }, [currentSlideIndex, totalSlides, onComplete]);

    const handlePlay = () => {
        setIsPlaying(!isPlaying);
    };

    const handleRestart = () => {
        setCurrentSlideIndex(0);
        setIsPlaying(false);
        setTimeLeft(slideTransitionTime);
    };

    const handleSlideClick = (index: number) => {
        setCurrentSlideIndex(index);
        setIsPlaying(false);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    // Listen for fullscreen changes
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            switch (e.key) {
                case 'ArrowLeft':
                    handlePreviousSlide();
                    break;
                case 'ArrowRight':
                case ' ':
                    e.preventDefault();
                    handleNextSlide();
                    break;
                case 'Escape':
                    if (isFullscreen) {
                        document.exitFullscreen();
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentSlideIndex, totalSlides, isFullscreen]);

    if (!currentSlide) {
        return (
            <div className="text-center p-8">
                <p className="text-muted-foreground">Esitystä ei voitu ladata.</p>
            </div>
        );
    }

    return (
        <div className={`max-w-6xl mx-auto ${isFullscreen ? 'p-8' : 'p-6'} space-y-6`}>

            {/* Presentation Header */}
            {!isFullscreen && (
                <Card>
                    <CardHeader>
                        <div className="flex items-start justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <PresentationIcon className="w-6 h-6" />
                                    {presentation.metadata.title}
                                </CardTitle>
                                <p className="text-muted-foreground mt-2">{presentation.metadata.description}</p>
                            </div>
                            <div className="text-right">
                                <Badge variant="secondary" className="mb-2">
                                    {presentation.metadata.subject} • {presentation.metadata.gradeLevel || presentation.metadata.grade_level}
                                </Badge>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Clock className="w-4 h-4" />
                                    <span>{presentation.metadata.estimatedDuration}</span>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span>Esityksen edistyminen</span>
                                <span>{currentSlideIndex + 1}/{totalSlides} diasarja</span>
                            </div>
                            <Progress value={progressPercentage} className="h-2" />
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Main Slide Display */}
            <Card className={`${isFullscreen ? 'h-screen' : 'min-h-96'} relative`}>
                <CardContent className={`${isFullscreen ? 'h-full flex flex-col' : 'p-8'}`}>

                    {/* Auto-advance timer */}
                    {isPlaying && autoAdvance && (
                        <div className="absolute top-4 right-4 bg-black/80 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {timeLeft}s
                        </div>
                    )}

                    {/* Slide Content */}
                    <div className={`${isFullscreen ? 'flex-1 flex flex-col justify-center' : ''}`}>
                        <div className={`text-center ${isFullscreen ? 'space-y-8' : 'space-y-6'}`}>
                            <h1 className={`font-bold ${isFullscreen ? 'text-6xl' : 'text-4xl'} leading-tight`}>
                                {currentSlide.title}
                            </h1>

                            {currentSlide.content && (
                                <div className={`prose prose-lg max-w-none ${isFullscreen ? 'text-2xl' : ''}`}>
                                    <div dangerouslySetInnerHTML={{ __html: currentSlide.content }} />
                                </div>
                            )}

                            {/* Bullet Points */}
                            {currentSlide.bulletPoints && currentSlide.bulletPoints.length > 0 && (
                                <ul className={`space-y-3 text-left max-w-4xl mx-auto ${isFullscreen ? 'text-2xl' : 'text-lg'}`}>
                                    {currentSlide.bulletPoints.map((point, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <span className="w-2 h-2 bg-blue-600 rounded-full mt-3 flex-shrink-0"></span>
                                            <span>{point}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {/* Speaker Notes (only in fullscreen) */}
                            {isFullscreen && currentSlide.speakerNotes && (
                                <div className="absolute bottom-20 left-8 right-8 bg-black/90 text-white p-4 rounded-lg text-sm">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Eye className="w-4 h-4" />
                                        <span className="font-semibold">Puhujan muistiinpanot:</span>
                                    </div>
                                    <p>{currentSlide.speakerNotes}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={handlePreviousSlide}
                        disabled={currentSlideIndex === 0}
                    >
                        <ChevronLeft className="w-4 h-4 mr-2" />
                        Edellinen
                    </Button>

                    <Button
                        variant="outline"
                        onClick={handlePlay}
                        disabled={!autoAdvance}
                    >
                        {isPlaying ? (
                            <Pause className="w-4 h-4 mr-2" />
                        ) : (
                            <Play className="w-4 h-4 mr-2" />
                        )}
                        {isPlaying ? 'Pysäytä' : 'Toista'}
                    </Button>

                    <Button variant="outline" onClick={handleRestart}>
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Aloita alusta
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                        {currentSlideIndex + 1} / {totalSlides}
                    </span>

                    <Button variant="outline" onClick={toggleFullscreen}>
                        <Maximize2 className="w-4 h-4 mr-2" />
                        {isFullscreen ? 'Poistu koko näytöstä' : 'Koko näyttö'}
                    </Button>
                </div>

                <Button
                    variant="outline"
                    onClick={handleNextSlide}
                    disabled={currentSlideIndex === totalSlides - 1}
                >
                    Seuraava
                    <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
            </div>

            {/* Slide Thumbnails */}
            {!isFullscreen && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Diat</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                            {presentation.slides.map((slide, index) => (
                                <div
                                    key={index}
                                    className={`aspect-video border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${index === currentSlideIndex
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    onClick={() => handleSlideClick(index)}
                                >
                                    <div className="h-full flex flex-col justify-center items-center p-2 text-center">
                                        <div className="text-xs font-semibold line-clamp-2">
                                            {slide.title}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {index + 1}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Speaker Notes (non-fullscreen) */}
            {!isFullscreen && currentSlide.speakerNotes && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <Eye className="w-5 h-5" />
                            Puhujan muistiinpanot
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            {currentSlide.speakerNotes}
                        </p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}