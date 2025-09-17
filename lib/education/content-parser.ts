// Educational Content Parser Utilities
// Functions to parse AI-generated educational content from XML responses

export interface QuizQuestion {
  id: number;
  text: string;
  options: Array<{
    text: string;
    correct: boolean;
  }>;
  explanation: string;
}

export interface Quiz {
  metadata: {
    title: string;
    subject: string;
    grade_level: string;
    language: string;
    curriculum_standards: string[];
  };
  questions: QuizQuestion[];
}

export interface CourseModule {
  id: number;
  title: string;
  description?: string;
  content: ModuleContent[];
  activities: Array<{
    type: string;
    description: string;
  }>;
  duration: number;
}

export interface ModuleContent {
  type: 'text' | 'video' | 'activity' | 'reading';
  title: string;
  content: string;
  activity?: {
    instructions: string;
    estimatedTime?: string;
  };
}

export interface Course {
  metadata: {
    title: string;
    description?: string;
    subject: string;
    grade_level: string;
    language: string;
    duration: number;
    estimatedDuration?: string;
    curriculum_standards: string[];
  };
  modules: CourseModule[];
  learning_objectives: string[];
  learningObjectives?: string[]; // alias for compatibility
}

export interface PresentationSlide {
  id: number;
  type: string;
  title: string;
  content: string;
  bulletPoints?: string[];
  discussion_points?: string[];
  speakerNotes?: string;
}

export type Slide = PresentationSlide; // Type alias for compatibility

export interface Presentation {
  metadata: {
    title: string;
    description?: string;
    subject?: string;
    gradeLevel?: string;
    estimatedDuration?: string;
    grade_level: string;
    language: string;
    curriculum_standards: string[];
  };
  slides: PresentationSlide[];
}

export interface Exercise {
  id: number;
  type: string;
  question: string;
  options?: Array<{
    text: string;
    correct: boolean;
  }>;
  answer?: string;
  solution: string;
}

export interface ExerciseSet {
  metadata: {
    title: string;
    subject: string;
    grade_level: string;
    language: string;
    curriculum_standards: string[];
  };
  exercises: Exercise[];
}

// Parse XML to extract quiz data
export function parseQuizFromXML(xmlContent: string): Quiz | null {
  try {
    // Simple XML parsing - use [\s\S] instead of s flag for better compatibility
    const quizMatch = xmlContent.match(/<quiz>([\s\S]*?)<\/quiz>/);
    if (!quizMatch) return null;

    const quizXML = quizMatch[1];

    // Extract metadata
    const titleMatch = quizXML.match(/<title>(.*?)<\/title>/);
    const subjectMatch = quizXML.match(/<subject>(.*?)<\/subject>/);
    const gradeLevelMatch = quizXML.match(/<grade_level>(.*?)<\/grade_level>/);
    const languageMatch = quizXML.match(/<language>(.*?)<\/language>/);
    const standardsMatch = quizXML.match(/<curriculum_standards>(.*?)<\/curriculum_standards>/);

    // Extract questions
    const questionsMatch = quizXML.match(/<questions>([\s\S]*?)<\/questions>/);
    const questions: QuizQuestion[] = [];

    if (questionsMatch) {
      // Use exec loop instead of matchAll for better compatibility
      const questionPattern = /<question id="(\d+)">([\s\S]*?)<\/question>/g;
      let questionMatch;
      while ((questionMatch = questionPattern.exec(questionsMatch[1])) !== null) {
        const questionId = parseInt(questionMatch[1]);
        const questionContent = questionMatch[2];

        const textMatch = questionContent.match(/<text>(.*?)<\/text>/);
        const optionsMatch = questionContent.match(/<options>([\s\S]*?)<\/options>/);
        const explanationMatch = questionContent.match(/<explanation>(.*?)<\/explanation>/);

        if (textMatch && optionsMatch) {
          const options: Array<{ text: string; correct: boolean }> = [];
          const optionPattern = /<option(?:\s+correct="true")?>(.*?)<\/option>/g;
          let optionMatch;
          while ((optionMatch = optionPattern.exec(optionsMatch[1])) !== null) {
            options.push({
              text: optionMatch[1].trim(),
              correct: optionMatch[0].includes('correct="true"')
            });
          }

          questions.push({
            id: questionId,
            text: textMatch[1].trim(),
            options,
            explanation: explanationMatch ? explanationMatch[1].trim() : ''
          });
        }
      }
    }

    return {
      metadata: {
        title: titleMatch ? titleMatch[1].trim() : '',
        subject: subjectMatch ? subjectMatch[1].trim() : '',
        grade_level: gradeLevelMatch ? gradeLevelMatch[1].trim() : '',
        language: languageMatch ? languageMatch[1].trim() : 'fi',
        curriculum_standards: standardsMatch ? 
          JSON.parse(standardsMatch[1].trim()) : []
      },
      questions
    };
  } catch (error) {
    console.error('Error parsing quiz XML:', error);
    return null;
  }
}

// Parse XML to extract course data
export function parseCourseFromXML(xmlContent: string): Course | null {
  try {
    const courseMatch = xmlContent.match(/<course>([\s\S]*?)<\/course>/);
    if (!courseMatch) return null;

    const courseXML = courseMatch[1];

    // Extract metadata
    const titleMatch = courseXML.match(/<title>(.*?)<\/title>/);
    const subjectMatch = courseXML.match(/<subject>(.*?)<\/subject>/);
    const gradeLevelMatch = courseXML.match(/<grade_level>(.*?)<\/grade_level>/);
    const languageMatch = courseXML.match(/<language>(.*?)<\/language>/);
    const durationMatch = courseXML.match(/<duration>(.*?)<\/duration>/);
    const standardsMatch = courseXML.match(/<curriculum_standards>(.*?)<\/curriculum_standards>/);

    // Extract modules
    const modulesMatch = courseXML.match(/<modules>([\s\S]*?)<\/modules>/);
    const modules: CourseModule[] = [];

    if (modulesMatch) {
      const modulePattern = /<module id="(\d+)">([\s\S]*?)<\/module>/g;
      let moduleMatch;
      while ((moduleMatch = modulePattern.exec(modulesMatch[1])) !== null) {
        const moduleId = parseInt(moduleMatch[1]);
        const moduleContent = moduleMatch[2];

        const titleMatch = moduleContent.match(/<title>(.*?)<\/title>/);
        const contentMatch = moduleContent.match(/<content>(.*?)<\/content>/);
        const durationMatch = moduleContent.match(/<duration>(.*?)<\/duration>/);
        const activitiesMatch = moduleContent.match(/<activities>([\s\S]*?)<\/activities>/);

        const activities: Array<{ type: string; description: string }> = [];
        if (activitiesMatch) {
          const activityPattern = /<activity type="([^"]+)">(.*?)<\/activity>/g;
          let activityMatch;
          while ((activityMatch = activityPattern.exec(activitiesMatch[1])) !== null) {
            activities.push({
              type: activityMatch[1],
              description: activityMatch[2].trim()
            });
          }
        }

        // Parse module content into structured format
        const content: ModuleContent[] = [];
        if (contentMatch) {
          const contentText = contentMatch[1].trim();
          // For now, treat all content as text content
          // In the future, we could parse different content types
          content.push({
            type: 'text',
            title: titleMatch ? titleMatch[1].trim() : 'Module Content',
            content: contentText
          });
        }

        modules.push({
          id: moduleId,
          title: titleMatch ? titleMatch[1].trim() : '',
          content,
          activities,
          duration: durationMatch ? parseInt(durationMatch[1]) : 0
        });
      }
    }

    // Extract learning objectives
    const objectivesMatch = courseXML.match(/<learning_objectives>([\s\S]*?)<\/learning_objectives>/);
    const learning_objectives: string[] = [];
    
    if (objectivesMatch) {
      const objectiveMatches = objectivesMatch[1].matchAll(/<objective>(.*?)<\/objective>/g);
      for (const objectiveMatch of objectiveMatches) {
        learning_objectives.push(objectiveMatch[1].trim());
      }
    }

    return {
      metadata: {
        title: titleMatch ? titleMatch[1].trim() : '',
        subject: subjectMatch ? subjectMatch[1].trim() : '',
        grade_level: gradeLevelMatch ? gradeLevelMatch[1].trim() : '',
        language: languageMatch ? languageMatch[1].trim() : 'fi',
        duration: durationMatch ? parseInt(durationMatch[1]) : 0,
        curriculum_standards: standardsMatch ? 
          JSON.parse(standardsMatch[1].trim()) : []
      },
      modules,
      learning_objectives
    };
  } catch (error) {
    console.error('Error parsing course XML:', error);
    return null;
  }
}

// Generic function to extract educational content from AI response
export function parseEducationalContent(response: string, contentType: string) {
  switch (contentType) {
    case 'quiz':
      return parseQuizFromXML(response);
    case 'course':
      return parseCourseFromXML(response);
    // Add more parsers as needed
    case 'exercise':
      return parseExerciseSetFromXML(response);
    default:
      return null;
  }
}

export function parseExerciseSetFromXML(xmlContent: string): ExerciseSet | null {
  try {
    const exerciseSetMatch = xmlContent.match(/<exerciseset>([\s\S]*?)<\/exerciseset>/);
    if (!exerciseSetMatch) return null;

    const exerciseSetXML = exerciseSetMatch[1];

    const titleMatch = exerciseSetXML.match(/<title>(.*?)<\/title>/);
    const subjectMatch = exerciseSetXML.match(/<subject>(.*?)<\/subject>/);
    const gradeLevelMatch = exerciseSetXML.match(/<grade_level>(.*?)<\/grade_level>/);
    const languageMatch = exerciseSetXML.match(/<language>(.*?)<\/language>/);

    const exercisesMatch = exerciseSetXML.match(/<exercises>([\s\S]*?)<\/exercises>/);
    const exercises: Exercise[] = [];

    if (exercisesMatch) {
      const exercisePattern = /<exercise id="(\d+)">([\s\S]*?)<\/exercise>/g;
      let exerciseMatch;
      while ((exerciseMatch = exercisePattern.exec(exercisesMatch[1])) !== null) {
        const exerciseId = parseInt(exerciseMatch[1]);
        const exerciseContent = exerciseMatch[2];

        const typeMatch = exerciseContent.match(/<type>(.*?)<\/type>/);
        const questionMatch = exerciseContent.match(/<question>(.*?)<\/question>/);
        const solutionMatch = exerciseContent.match(/<solution>(.*?)<\/solution>/);

        if (questionMatch && solutionMatch) {
          exercises.push({
            id: exerciseId,
            type: typeMatch ? typeMatch[1].trim() : 'short_answer',
            question: questionMatch[1].trim(),
            solution: solutionMatch[1].trim(),
          });
        }
      }
    }

    return {
      metadata: {
        title: titleMatch ? titleMatch[1].trim() : '',
        subject: subjectMatch ? subjectMatch[1].trim() : '',
        grade_level: gradeLevelMatch ? gradeLevelMatch[1].trim() : '',
        language: languageMatch ? languageMatch[1].trim() : 'fi',
        curriculum_standards: [],
      },
      exercises,
    };
  } catch (error) {
    console.error('Error parsing exercise set XML:', error);
    return null;
  }
}

// Validate educational content structure
export function validateQuiz(quiz: Quiz): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!quiz.metadata.title) {
    errors.push('Quiz title is required');
  }

  if (!quiz.metadata.subject) {
    errors.push('Subject is required');
  }

  if (quiz.questions.length === 0) {
    errors.push('At least one question is required');
  }

  quiz.questions.forEach((question, index) => {
    if (!question.text) {
      errors.push(`Question ${index + 1}: Question text is required`);
    }

    if (question.options.length < 2) {
      errors.push(`Question ${index + 1}: At least 2 options are required`);
    }

    const correctOptions = question.options.filter(opt => opt.correct);
    if (correctOptions.length !== 1) {
      errors.push(`Question ${index + 1}: Exactly one correct option is required`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Convert educational content to Supabase format
export function convertToSupabaseFormat(content: Quiz | Course | Presentation | ExerciseSet, contentType: string) {
  return {
    content_type: contentType,
    title: content.metadata.title,
    subject: content.metadata.subject,
    grade_level: content.metadata.grade_level,
    language: content.metadata.language,
    curriculum_standards: content.metadata.curriculum_standards,
    content_data: content,
    sharing_settings: { public: false, link_sharing: false }
  };
}