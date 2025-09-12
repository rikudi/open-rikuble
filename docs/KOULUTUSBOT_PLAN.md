# KoulutusBot - AI-Powered Finnish Educational Content Generator

## Project Overview

Transform the open-rikuble website builder into an intelligent educational content generator that creates interactive learning materials tailored for the Finnish education system and culture.

## Core Concept

Instead of generating websites, KoulutusBot will generate comprehensive educational content including courses, quizzes, presentations, and interactive exercises specifically designed for Finnish learners and educators.

## Architecture Plan

### 1. Content Generation Types

```typescript
// New content types replacing website templates
const EDUCATION_CONTENT_TYPES = {
  courses: {
    language: "Finnish language courses (A1-C2 levels)",
    programming: "Coding courses in Finnish",
    math: "Mathematics with Finnish curriculum alignment",
    history: "Finnish history and culture courses"
  },
  assessments: {
    quizzes: "Interactive quizzes with instant feedback",
    exams: "Formal assessment tools",
    exercises: "Practice problems with solutions",
    projects: "Project-based learning assignments"
  },
  presentations: {
    slides: "Interactive presentation slides",
    lectures: "Structured lecture materials",
    workshops: "Hands-on workshop content"
  },
  gamification: {
    flashcards: "Digital flashcard systems",
    games: "Educational games and simulations",
    challenges: "Coding challenges and competitions"
  }
}
```

### 2. Finnish Education System Integration

```typescript
// Finnish curriculum alignment
const FINNISH_EDUCATION_STANDARDS = {
  perusopetus: "Basic education (grades 1-9) curriculum",
  lukio: "Upper secondary education standards", 
  ammattikoulu: "Vocational education requirements",
  yliopisto: "University-level content standards",
  aikuiskoulutus: "Adult education programs"
}

// Language support
const SUPPORTED_LANGUAGES = {
  primary: "Finnish",
  secondary: ["Swedish", "English", "Sami"],
  programming: ["Python", "JavaScript", "Java", "C++"]
}
```

### 3. Content Generation Engine

```typescript
// Replace website generation with educational content
interface EducationalContent {
  type: 'course' | 'quiz' | 'presentation' | 'exercise';
  level: 'beginner' | 'intermediate' | 'advanced';
  subject: string;
  language: 'fi' | 'sv' | 'en';
  curriculum: 'perusopetus' | 'lukio' | 'ammattikoulu' | 'yliopisto';
  content: {
    theory: string;
    examples: Example[];
    exercises: Exercise[];
    assessments: Assessment[];
  };
  metadata: FinlandEducationMetadata;
}
```

### 4. AI Prompt Engineering for Education

```typescript
// Educational content prompts
const EDUCATION_PROMPTS = {
  course_creation: `
    Create a comprehensive course on {subject} for {level} students
    following Finnish {curriculum} standards. Include:
    - Learning objectives aligned with Finnish education goals
    - Interactive exercises
    - Cultural context relevant to Finland
    - Assessment rubrics
    - Accessibility considerations
  `,
  
  quiz_generation: `
    Generate a {difficulty} level quiz on {topic} with:
    - Multiple choice questions with Finnish context
    - Open-ended questions encouraging critical thinking
    - Immediate feedback explanations
    - Progress tracking capabilities
  `,
  
  programming_course: `
    Create a programming course teaching {language} to Finnish students:
    - Use Finnish examples and variable names when appropriate
    - Include projects relevant to Finnish society/culture
    - Follow Finnish vocational education standards
    - Provide bilingual explanations (Finnish/English)
  `
}
```

## Target Markets & Use Cases

### Primary Markets

- **K-12 Schools** - Supplement traditional teaching
- **Vocational Schools** - Technical training materials
- **Universities** - Course content generation
- **Adult Education Centers** - Continuing education
- **Corporate Training** - Employee skill development

### Specific Use Cases

```typescript
const USE_CASES = {
  teachers: {
    problem: "Time-consuming lesson planning",
    solution: "Generate complete lesson plans in minutes",
    value: "Save 5-10 hours per week on content creation"
  },
  
  students: {
    problem: "Need personalized practice materials",
    solution: "AI-generated exercises at their skill level",
    value: "Adaptive learning with instant feedback"
  },
  
  corporations: {
    problem: "Need Finnish-specific training materials",
    solution: "Generate compliance/skills training in Finnish",
    value: "Localized content without translation costs"
  },
  
  immigrants: {
    problem: "Learning Finnish language and culture",
    solution: "Personalized Finnish courses with cultural context",
    value: "Faster integration into Finnish society"
  }
}
```

## Database Architecture with Supabase

### Supabase Integration
Supabase provides a complete backend-as-a-service solution perfect for KoulutusBot's educational platform needs:

```typescript
// Supabase configuration
const supabaseConfig = {
  url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY, // Server-side only
  
  features: {
    database: "PostgreSQL with real-time subscriptions",
    auth: "Built-in authentication with social providers",
    storage: "File storage for educational content exports",
    edge_functions: "Serverless functions for AI processing",
    realtime: "Live quiz sessions and collaborative editing"
  }
}
```

### Database Schema (Supabase SQL)
```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email VARCHAR(255),
  full_name VARCHAR(255),
  subscription_tier VARCHAR(50) DEFAULT 'free',
  credits_remaining INTEGER DEFAULT 50,
  school_organization VARCHAR(255),
  teaching_subjects TEXT[],
  preferred_language VARCHAR(10) DEFAULT 'fi',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Educational content table
CREATE TABLE public.educational_content (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content_type VARCHAR(50) NOT NULL, -- 'course', 'quiz', 'presentation', 'exercise'
  title VARCHAR(255) NOT NULL,
  description TEXT,
  subject VARCHAR(100),
  grade_level VARCHAR(50), -- 'perusopetus_1-9', 'lukio', 'ammattikoulu', etc.
  language VARCHAR(10) DEFAULT 'fi', -- 'fi', 'sv', 'en'
  curriculum_standards JSONB, -- OPH alignment data
  content_data JSONB NOT NULL, -- Generated content structure
  sharing_settings JSONB DEFAULT '{"public": false, "link_sharing": false}',
  view_count INTEGER DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Quiz sessions and results
CREATE TABLE public.quiz_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  quiz_id UUID REFERENCES public.educational_content(id) ON DELETE CASCADE,
  student_name VARCHAR(255),
  student_email VARCHAR(255),
  responses JSONB NOT NULL,
  score INTEGER,
  max_score INTEGER,
  time_spent INTEGER, -- in seconds
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Credit transactions
CREATE TABLE public.credit_transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  credits_used INTEGER NOT NULL,
  credits_remaining INTEGER NOT NULL,
  action_type VARCHAR(50) NOT NULL, -- 'generation', 'export', 'purchase', 'refund'
  action_details JSONB, -- Additional context about the action
  content_id UUID REFERENCES public.educational_content(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Content templates (for reusable educational patterns)
CREATE TABLE public.content_templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100), -- 'quiz', 'course', 'presentation'
  template_data JSONB NOT NULL,
  is_public BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES public.profiles(id),
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
```

### Row Level Security (RLS) Policies
```sql
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educational_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can only see and edit their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Educational content: Users own their content, public content visible to all
CREATE POLICY "Users can CRUD their own content" ON public.educational_content
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public content visible to all" ON public.educational_content
  FOR SELECT USING (sharing_settings->>'public' = 'true');

-- Quiz sessions: Linked to quiz content permissions
CREATE POLICY "Quiz sessions viewable by content owner" ON public.quiz_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.educational_content 
      WHERE id = quiz_sessions.quiz_id 
      AND user_id = auth.uid()
    )
  );

-- Credit transactions: Users can only see their own transactions
CREATE POLICY "Users can view own transactions" ON public.credit_transactions
  FOR SELECT USING (auth.uid() = user_id);
```

### Supabase Client Setup
```typescript
// lib/supabase/client.ts
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/types/database'

export const createClient = () => createClientComponentClient<Database>()

// lib/supabase/server.ts
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/types/database'

export const createServerClient = () => {
  const cookieStore = cookies()
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
}
```

### Authentication Integration
```typescript
// Built-in Supabase Auth with Finnish education providers
const authConfig = {
  providers: {
    google: "Google Workspace for Education (common in Finnish schools)",
    microsoft: "Microsoft 365 Education (Teams integration)",
    email: "Email/password for individual educators"
  },
  
  middleware: {
    redirects: {
      signIn: '/auth/signin',
      signUp: '/auth/signup',
      afterSignIn: '/dashboard',
      afterSignUp: '/onboarding'
    }
  }
}
```

### Supabase Storage for Educational Content
```typescript
// File storage structure in Supabase Storage
const storageStructure = {
  buckets: {
    'user-content': {
      public: false,
      path: 'users/{userId}/content/{contentId}/',
      fileTypes: ['json', 'pdf', 'html', 'scorm']
    },
    'content-exports': {
      public: false,
      path: 'exports/{userId}/{exportId}/',
      fileTypes: ['pdf', 'zip', 'html', 'json']
    },
    'public-assets': {
      public: true,
      path: 'assets/{category}/',
      fileTypes: ['png', 'jpg', 'svg', 'webp']
    }
  }
}
```

### Real-time Features with Supabase
```typescript
// Real-time quiz sessions
const setupRealtimeQuiz = (quizId: string) => {
  const supabase = createClient()
  
  // Listen for new quiz responses
  const channel = supabase
    .channel('quiz-responses')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'quiz_sessions',
        filter: `quiz_id=eq.${quizId}`
      },
      (payload) => {
        // Update live quiz dashboard
        updateQuizAnalytics(payload.new)
      }
    )
    .subscribe()
    
  return () => supabase.removeChannel(channel)
}
```

## Design System & Branding

### KoulutusBot Color Palette
```css
/* Adapted from Fire theme for educational context */
:root {
  /* Primary - Educational Blue (trust, learning) */
  --koulutus-primary: #2563eb; /* Blue-600 */
  --koulutus-primary-light: #3b82f6; /* Blue-500 */
  --koulutus-primary-dark: #1d4ed8; /* Blue-700 */
  
  /* Secondary - Finnish Flag Blue */
  --koulutus-secondary: #003580; /* Deep blue from Finnish flag */
  --koulutus-secondary-light: #0066cc;
  
  /* Accent - Educational Green (growth, success) */
  --koulutus-accent: #16a34a; /* Green-600 */
  --koulutus-accent-light: #22c55e; /* Green-500 */
  
  /* Warning - Warm Orange (attention, feedback) */
  --koulutus-warning: #ea580c; /* Orange-600 */
  --koulutus-warning-light: #fb923c; /* Orange-400 */
  
  /* Backgrounds */
  --koulutus-bg-primary: #f8fafc; /* Slate-50 */
  --koulutus-bg-secondary: #f1f5f9; /* Slate-100 */
  --koulutus-bg-card: #ffffff;
  
  /* Text */
  --koulutus-text-primary: #0f172a; /* Slate-900 */
  --koulutus-text-secondary: #475569; /* Slate-600 */
  --koulutus-text-muted: #94a3b8; /* Slate-400 */
}
```

### Typography System
```css
/* Finnish education-friendly typography */
.koulutus-typography {
  /* Headers - Clear hierarchy for educational content */
  --font-family-heading: 'Inter', 'Arial', sans-serif;
  --font-family-body: 'Inter', 'Arial', sans-serif;
  --font-family-mono: 'JetBrains Mono', 'Courier New', monospace;
  
  /* Sizes optimized for readability */
  --text-xs: 0.75rem; /* 12px - Metadata */
  --text-sm: 0.875rem; /* 14px - Body small */
  --text-base: 1rem; /* 16px - Body */
  --text-lg: 1.125rem; /* 18px - Emphasized */
  --text-xl: 1.25rem; /* 20px - Subheadings */
  --text-2xl: 1.5rem; /* 24px - Section headings */
  --text-3xl: 1.875rem; /* 30px - Page headings */
}
```

### Component Design Principles
```typescript
// Educational UI component guidelines
const designPrinciples = {
  accessibility: {
    contrast: "WCAG AA compliant (4.5:1 minimum)",
    fontSize: "Minimum 16px for body text",
    touch: "Minimum 44px touch targets",
    keyboard: "Full keyboard navigation support"
  },
  
  finnish_education: {
    language: "Support Finnish diacritics (ä, ö, å)",
    cultural: "Use familiar Finnish educational metaphors",
    curriculum: "Visual alignment with OPH standards",
    inclusive: "Avoid religious or culturally specific imagery"
  },
  
  educational_ux: {
    feedback: "Immediate positive reinforcement",
    progress: "Clear learning progress indicators",
    error_handling: "Gentle, educational error messages",
    gamification: "Subtle progress elements, not distracting"
  }
}
```

### Logo and Branding Guidelines
```typescript
// KoulutusBot brand identity
const brandingGuidelines = {
  logo: {
    primary: "KoulutusBot wordmark with book/AI icon",
    symbol: "Stylized graduation cap with circuit pattern",
    colors: ["--koulutus-primary", "--koulutus-accent"],
    usage: "Clean, professional, education-focused"
  },
  
  iconography: {
    style: "Lucide-style outline icons",
    educational: ["book-open", "graduation-cap", "puzzle", "lightbulb"],
    finnish: ["flag-fi", "school-building", "certificate"],
    technology: ["cpu", "robot", "sparkles"]
  },
  
  animations: {
    principle: "Subtle, purposeful, not distracting from learning",
    transitions: "Smooth 200-300ms easing",
    feedback: "Gentle bounce for success, fade for loading",
    progress: "Smooth progress bars and completion animations"
  }
}
```

## Technical Implementation Plan

### Phase 1: Core Engine (Month 1-2)

```bash
# Repository structure
packages/
├── create-koulutusbot/          # CLI tool for setup
├── education-templates/         # Pre-built course templates
├── finnish-curriculum/          # Curriculum alignment data
├── assessment-engine/           # Quiz/test generation
└── content-renderer/           # Multi-format output
```

**Key Tasks:**
- Modify existing AI generation engine for educational content
- Create educational content templates
- Implement basic course structure generation
- Set up Finnish language processing

### Phase 2: Content Types (Month 3-4)

```typescript
// New generation targets instead of HTML/CSS
const OUTPUT_FORMATS = {
  interactive: "React-based interactive lessons",
  pdf: "Printable worksheets and handouts", 
  slides: "Presentation slides (PowerPoint/Google Slides)",
  lms: "Moodle/Canvas compatible packages",
  mobile: "Mobile-friendly learning apps",
  api: "Content API for integration with existing systems"
}
```

**Key Tasks:**
- Implement multiple output formats
- Create interactive exercise components
- Build assessment and quiz systems
- Develop progress tracking capabilities

### Phase 3: Finnish Specialization (Month 5-6)

```typescript
// Finnish-specific features
const FINNISH_FEATURES = {
  curriculum_alignment: "Map content to OPH standards",
  language_support: "Finnish, Swedish, Sami language generation",
  cultural_context: "Include Finnish cultural references",
  accessibility: "Follow Finnish accessibility guidelines",
  privacy: "GDPR compliance for student data"
}
```

**Key Tasks:**
- Integrate OPH curriculum standards
- Implement multi-language support
- Add Finnish cultural context to content
- Ensure GDPR compliance

## Revenue Model

### Credit-Based System

```typescript
const CREDIT_SYSTEM = {
  credits_usage: {
    simple_quiz: 1,           // Basic quiz generation (5-10 questions)
    complex_course: 10,       // Full course with multiple modules
    presentation: 3,          // Interactive presentation
    exercise_set: 2,          // Set of practice exercises
    assessment: 5,            // Comprehensive assessment tool
    translation: 1,           // Content translation to another language
    customization: 2          // Modify existing content
  },
  
  free_tier: {
    initial_credits: 20,      // Free credits on signup
    monthly_refill: 10,       // Additional free credits each month
    referral_bonus: 20,       // Credits for successful referrals
    features: ["Basic templates", "PDF export", "Community support"]
  }
}

const CREDIT_PACKAGES = {
  starter_pack: {
    price: "€9.99",
    credits: 100,
    bonus: 10,                // 10% bonus credits
    validity: "6 months"
  },
  
  teacher_pack: {
    price: "€19.99", 
    credits: 250,
    bonus: 50,                // 20% bonus credits
    validity: "12 months",
    features: ["Priority support", "Advanced templates"]
  },
  
  school_pack: {
    price: "€49.99",
    credits: 750,
    bonus: 150,               // 20% bonus credits
    validity: "12 months",
    features: ["Bulk operations", "Team sharing", "Analytics"]
  },
  
  unlimited_monthly: {
    price: "€39/month",
    credits: "Unlimited",
    features: ["All formats", "Priority generation", "API access"]
  }
}

const INSTITUTIONAL_LICENSING = {
  school_license: {
    price: "€199/year/school",
    credits: "5000 shared credits",
    features: ["Multi-teacher access", "Student analytics", "LMS integration", "Curriculum mapping"]
  },
  
  district_license: {
    price: "€999/year/district",
    credits: "25000 shared credits", 
    features: ["Multi-school access", "District-wide analytics", "Custom branding", "Training sessions"]
  },
  
  enterprise: {
    price: "Custom pricing",
    credits: "Custom allocation",
    features: ["White-label", "API access", "Custom integrations", "On-premise deployment"]
  }
}
```

### Credit Usage Examples

```typescript
const USAGE_SCENARIOS = {
  new_teacher: {
    scenario: "Teacher creating first course",
    activities: [
      "Generate basic math course (10 credits)",
      "Create 3 quizzes (3 credits)",
      "Make presentation slides (3 credits)"
    ],
    total_credits: 16,
    recommendation: "Starter pack covers 6+ similar courses"
  },
  
  active_educator: {
    scenario: "Regular course creation",
    monthly_usage: [
      "4 full courses (40 credits)",
      "10 quizzes (10 credits)", 
      "5 presentations (15 credits)",
      "20 exercise sets (40 credits)"
    ],
    total_monthly: 105,
    recommendation: "Teacher pack every 2 months or unlimited monthly"
  },
  
  school_department: {
    scenario: "Math department (5 teachers)",
    monthly_usage: "300-500 credits",
    recommendation: "School pack provides sufficient shared credits"
  }
}
```

## Competitive Advantages

- **Finnish Market Focus** - Deep understanding of local education needs
- **AI-Powered Speed** - Generate comprehensive courses in minutes, not hours
- **Curriculum Aligned** - Follows OPH (Finnish Education Agency) standards
- **Multi-Format Output** - Works with existing tools teachers already use
- **Cultural Relevance** - Examples and context specifically relevant to Finland
- **Open Source Foundation** - Built on proven open-source architecture

## Technical Considerations

### Existing Codebase Adaptations

1. **AI Generation Engine** - Adapt the existing website generation prompts for educational content
2. **Sandbox Environment** - Use for testing interactive educational components
3. **Streaming Responses** - Maintain for real-time content generation feedback
4. **Template System** - Convert website templates to educational content templates
5. **Conversation Flow** - Adapt for educational content creation workflows

### New Components Needed

```typescript
// Educational-specific components
components/
├── CourseBuilder/              # Interactive course creation
├── QuizGenerator/              # Assessment creation tools
├── CurriculumMapper/           # OPH standards alignment
├── LanguageSelector/           # Multi-language support
├── ProgressTracker/            # Learning progress visualization
└── ContentRenderer/            # Multi-format output rendering
```

## Success Metrics

- **User Adoption**: Number of educators using the platform
- **Content Generated**: Volume of educational content created
- **User Engagement**: Time spent creating and using content
- **Curriculum Coverage**: Percentage of OPH standards covered
- **Language Distribution**: Usage across Finnish, Swedish, English
- **Revenue Growth**: Monthly recurring revenue from subscriptions

## Next Steps

1. **Market Validation** - Survey Finnish educators about content creation needs
2. **Technical Proof of Concept** - Adapt core generation engine for educational content
3. **Curriculum Research** - Deep dive into OPH standards and requirements
4. **Partnership Exploration** - Connect with Finnish educational institutions
5. **MVP Development** - Build basic course generation functionality

## Quiz Export and Sharing Capabilities

### Export Formats

#### 1. Interactive Web Component (Primary)
```typescript
// Generated quiz as standalone React component
export const FinnishHistoryQuiz = () => {
  // Quiz logic with state management
  // Can be embedded in any React app or LMS
}

// Export as embeddable widget
<iframe src="/quiz/embed/abc123" width="100%" height="600px" />
```

#### 2. LMS-Compatible Formats
```typescript
// Export handlers in the sandbox environment
const exportFormats = {
  scorm: () => generateSCORMPackage(quizData),
  qti: () => generateQTIFormat(quizData), // For Moodle/Canvas
  xapi: () => generateTinCanAPI(quizData), // For modern LMS
  h5p: () => generateH5PContent(quizData)  // Interactive content
}
```

#### 3. Printable Formats
```typescript
// PDF generation in the sandbox
import { jsPDF } from 'jspdf';

const generatePrintableQuiz = (quiz) => {
  const pdf = new jsPDF();
  // Format quiz questions for print
  // Include answer key on separate pages
  // Follow Finnish education formatting standards
}
```

### Sharing Mechanisms

#### 1. Direct Link Sharing
```typescript
// Generated quiz gets unique URL
const shareableLink = `/quiz/${quizId}`;
// With access controls for teachers/students
const teacherLink = `/quiz/${quizId}?role=teacher&key=${accessKey}`;
```

#### 2. QR Code Generation
```typescript
// For quick classroom access
import QRCode from 'qrcode';

const generateClassroomQR = async (quizUrl) => {
  const qrCodeDataURL = await QRCode.toDataURL(quizUrl);
  // Teachers can display QR code on projector
  // Students scan to access quiz on mobile
}
```

#### 3. Email/Platform Integration
```typescript
// Export to popular Finnish education platforms
const integrations = {
  wilma: () => exportToWilma(quizData),      // Finnish school platform
  teams: () => exportToMSTeams(quizData),    // Microsoft Teams for Education
  classroom: () => exportToGoogleClassroom(quizData)
}
```

### Implementation in Current Architecture

#### 1. Extend AI Generation Pipeline
```typescript
// Add export options to streaming response
<file path="src/components/QuizExporter.jsx">
const QuizExporter = ({ quizData }) => {
  const handleExport = async (format) => {
    const response = await fetch('/api/export-quiz', {
      method: 'POST',
      body: JSON.stringify({ quiz: quizData, format })
    });
    // Handle download or sharing
  };
}
</file>

<explanation>
Added export functionality with multiple format support
</explanation>
```

#### 2. Leverage Sandbox Environment
```typescript
// Use existing sandbox providers for format conversion
// Vercel/E2B can run conversion libraries
await sandboxManager.executeCode(`
  // Convert quiz to SCORM package
  const scormPackage = await convertToSCORM(quizData);
  // Download or share the package
`);
```

#### 3. Credit-Based Export System
```typescript
// Align with revenue model from KOULUTUSBOT_PLAN.md
const exportCosts = {
  weblink: 0,           // Free sharing
  pdf: 1,               // 1 credit
  scorm: 2,             // 2 credits for LMS package
  h5p: 3,               // 3 credits for interactive
  bulk_export: 5        // 5 credits for multiple formats
}
```

### Finnish Education Specific Features

#### 1. OPH Standards Compliance
```typescript
// Include curriculum alignment in exports
const exportWithStandards = {
  curriculum: 'perusopetus_grade_7',
  subject: 'historia',
  learningObjectives: ['Suomen itsenäistyminen', 'Kansalaissodan syyt'],
  assessmentCriteria: 'OPH_2014_standards'
}
```

#### 2. Multi-Language Export
```typescript
// Support Finnish, Swedish, English exports
const languageExport = {
  fi: generateFinnishVersion(quiz),
  sv: generateSwedishVersion(quiz),
  en: generateEnglishVersion(quiz)
}
```

### Export Credit Usage in Revenue Model
```typescript
const EXPORT_CREDIT_COSTS = {
  sharing: {
    direct_link: 0,         // Free - encourages platform usage
    qr_code: 0,             // Free - classroom convenience
    email_share: 0          // Free - basic sharing
  },
  
  basic_exports: {
    pdf_worksheet: 1,       // Basic printable format
    web_embed: 1,           // Embeddable widget code
    json_data: 1            // Raw quiz data export
  },
  
  advanced_exports: {
    scorm_package: 3,       // Full LMS compatibility
    h5p_interactive: 3,     // Rich interactive content
    qti_standard: 2,        // Standard quiz format
    multiple_formats: 5     // Bulk export all formats
  },
  
  platform_integrations: {
    wilma_export: 2,        // Finnish school system
    teams_education: 2,     // Microsoft Teams
    google_classroom: 2,    // Google platform
    moodle_direct: 3        // Direct Moodle upload
  }
}
```

This export and sharing system leverages the existing streaming AI generation and sandbox execution capabilities while providing comprehensive distribution options that align with the Finnish educational market needs and the credit-based revenue model.

---

*This plan leverages the existing open-rikuble codebase to create a specialized educational content generator for the Finnish market, transforming a website builder into a powerful tool for educators and learners.*