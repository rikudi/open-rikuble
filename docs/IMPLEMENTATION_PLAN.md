# KoulutusBot Implementation Roadmap

## Overview
This document outlines the step-by-step implementation plan for transforming open-rikuble into KoulutusBot, broken down into manageable phases with specific deliverables and technical tasks.

## Implementation Phases

### Phase 0: Foundation Setup (Week 1-2)
**Goal**: Set up development environment and core infrastructure

#### Technical Tasks
- [x] Set up Supabase project with Finnish region
- [x] Configure authentication (Google Workspace, Microsoft 365)
- [x] Set up development database schema
- [x] Configure Vercel deployment with environment variables
- [x] Set up basic project structure adaptations

#### Environment Setup
```bash
# 1. Supabase setup (latest best practice)
npm install @supabase/supabase-js @supabase/ssr

# 2. Additional dependencies for educational features
npm install jspdf qrcode react-hook-form zod

# 3. Finnish localization
npm install next-intl date-fns
```

#### Supabase Client & Auth Setup (Latest)

**lib/supabase/client.ts**
```typescript
import { createBrowserClient } from '@supabase/ssr'

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
```

**lib/supabase/server.ts**
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const supabaseServer = () =>
  createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies }
  )
```

#### Authentication Flow
- Use Supabase Auth UI or custom forms for sign-in/sign-up.
- Use `supabase.auth.getUser()` and `supabase.auth.getSession()` for session management.
- Protect server-side routes using `supabaseServer()` in API routes or server components.

#### Configuration Files
```typescript
// .env.local additions
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

// Existing AI keys remain the same
ANTHROPIC_API_KEY=...
FIRECRAWL_API_KEY=...
```

#### Deliverables
- [x] Supabase project configured with RLS policies
- [x] Authentication flow working
- [x] Basic database schema deployed
- [x] Development environment running
- [x] Initial branding (KoulutusBot colors, logo placeholder)

---

### Phase 1: MVP - Basic Quiz Generator (Week 3-6)
**Goal**: Create a working educational content generator (focus on quizzes)

#### Core Features
- [x] Adapt AI generation pipeline for educational content
- [x] Create quiz generation prompts with Finnish context
- [x] Basic quiz display and interaction
- [x] User authentication and credit system
- [x] Simple content storage in Supabase

#### Technical Implementation

##### 1. Adapt AI Generation Pipeline
```typescript
// [x] lib/education/prompt-templates.ts
export const QUIZ_GENERATION_PROMPT = `
Generate an educational quiz in Finnish about {subject} for {grade_level}.

Requirements:
- 5-10 multiple choice questions
- Include explanations for correct answers
- Use Finnish educational context and examples
- Align with OPH curriculum standards
- Appropriate difficulty for {grade_level}

Output format:
<quiz>
  <metadata>
    <title>Quiz title in Finnish</title>
    <subject>{subject}</subject>
    <grade_level>{grade_level}</grade_level>
  </metadata>
  <questions>
    <question id="1">
      <text>Question text in Finnish</text>
      <options>
        <option correct="true">Correct answer</option>
        <option>Wrong answer 1</option>
        <option>Wrong answer 2</option>
        <option>Wrong answer 3</option>
      </options>
      <explanation>Why this is correct...</explanation>
    </question>
  </questions>
</quiz>
`;
```

##### 2. Quiz Components
```typescript
// [x] components/education/QuizGenerator.tsx - New component
// [x] components/education/QuizPlayer.tsx - Quiz taking interface
// [ ] components/education/QuizResults.tsx - Results display
```

##### 3. Database Integration
```typescript
// lib/supabase/education.ts
export async function saveQuiz(userId: string, quizData: any) {
  // Save to educational_content table
}

export async function deductCredits(userId: string, action: string) {
  // Handle credit deduction with transaction
}
```

#### API Routes to Modify
- [x] `app/api/generate-ai-code-stream/route.ts` → Adapt for educational content
- [x] `app/api/education/generate-quiz/route.ts` → New quiz-specific endpoint
- [x] `app/api/education/save-content/route.ts` → Save generated content

#### UI Adaptations
- [x] Update `app/generation/page.tsx` for educational interface
- [x] Add subject/grade selection dropdowns
- [x] Replace website preview with quiz preview
- [x] Update branding from Firecrawl to KoulutusBot

#### Testing Criteria
- [x] Can generate Finnish quiz about basic subjects
- [x] Quiz displays correctly with interactive answers
- [x] Credit system deducts properly
- [x] Content saves to Supabase
- [x] Authentication works with Google/Microsoft

---

### Phase 1.5: Public Landing Page (Week 6-7)
**Goal**: Create a public-facing landing page to attract new users.

#### Features
- [ ] Design a new public landing page for unauthenticated users.
- [ ] Implement the landing page at the root URL (`/`).
- [ ] Clearly explain KoulutusBot's value proposition, features, and target audience.
- [ ] Include sections for use cases (teachers, students, etc.) and pricing/credit system.
- [ ] Add clear Call-to-Action (CTA) buttons for signing up or logging in.
- [ ] Ensure the page is fully responsive and uses the KoulutusBot branding.

---

### Phase 2: Enhanced Content Types (Week 7-10)
**Goal**: Expand beyond quizzes to courses and presentations

#### New Features
- [ ] Course generation (multi-section learning modules)
- [ ] Presentation generator (slide-based content)
- [ ] Exercise generator (practice problems)
- [ ] Content templates and reusable patterns

#### Technical Tasks
- [ ] Extend AI prompts for different content types
- [ ] Create course/presentation display components
- [ ] Add content type selection to UI
- [ ] Implement content versioning
- [ ] Add content sharing capabilities

#### Content Type Templates
```typescript
// lib/education/content-types.ts
export const CONTENT_TYPES = {
  quiz: { credits: 2, icon: 'quiz', description: 'Interactive quiz' },
  course: { credits: 8, icon: 'book', description: 'Multi-section course' },
  presentation: { credits: 5, icon: 'presentation', description: 'Slide presentation' },
  exercise: { credits: 3, icon: 'pencil', description: 'Practice exercises' }
}
```

---

### Phase 3: Finnish Education Integration (Week 11-14)
**Goal**: Deep integration with Finnish curriculum and standards

#### Features
- [ ] OPH curriculum alignment
- [ ] Finnish/Swedish/English language support
- [ ] Grade-specific content (perusopetus, lukio, ammattikoulu)
- [ ] Cultural context integration
- [ ] Accessibility improvements (WCAG AA)

#### Implementation
- [ ] Add Finnish curriculum data to prompts
- [ ] Implement multi-language content generation
- [ ] Add curriculum standards tagging
- [ ] Create Finnish educational examples database
- [ ] Implement accessibility features

---

### Phase 4: Export and Sharing (Week 15-18)
**Goal**: Multiple export formats and sharing capabilities

#### Features
- [ ] PDF export for printable worksheets
- [ ] SCORM package generation for LMS
- [ ] QR code generation for classroom sharing
- [ ] Direct link sharing with access controls
- [ ] Integration with common Finnish school platforms

#### Technical Implementation
```typescript
// lib/export/pdf-generator.ts - PDF export functionality
// lib/export/scorm-generator.ts - SCORM package creation
// lib/sharing/qr-codes.ts - QR code generation
// components/export/ExportModal.tsx - Export options UI
```

---

### Phase 5: Analytics and Teacher Dashboard (Week 19-22)
**Goal**: Teacher insights and content performance tracking

#### Features
- [ ] Teacher dashboard with content overview
- [ ] Quiz analytics (student performance, time spent)
- [ ] Content usage statistics
- [ ] Student progress tracking
- [ ] Recommendations for content improvement

---

### Phase 6: Mobile and PWA (Week 23-26)
**Goal**: Mobile-optimized experience and offline capabilities

#### Features
- [ ] Progressive Web App setup
- [ ] Mobile-optimized quiz taking
- [ ] Offline content access
- [ ] Push notifications for shared content
- [ ] App store deployment preparation

---

## Development Workflow

### Daily Development Process
1. **Morning**: Review previous day's progress
2. **Development**: Focus on current phase tasks
3. **Testing**: Continuous testing with Finnish educational content
4. **Evening**: Update progress and plan next day

### Weekly Milestones
- **Monday**: Sprint planning and task breakdown
- **Wednesday**: Mid-week progress review
- **Friday**: Demo working features, plan next sprint

### Quality Assurance
- [ ] Finnish language accuracy review
- [ ] Educational content appropriateness check
- [ ] Accessibility testing
- [ ] Performance testing with AI generation
- [ ] Security testing for student data

## Risk Mitigation

### Technical Risks
- **AI Generation Quality**: Have fallback prompts and human review process
- **Supabase Scaling**: Monitor usage and have migration plan
- **Finnish Localization**: Work with native Finnish speakers for review

### Market Risks
- **Teacher Adoption**: Start with small pilot group for feedback
- **Competition**: Focus on Finnish-specific features as differentiator
- **Regulatory Changes**: Stay informed about Finnish education policy changes

## Success Metrics Per Phase

### Phase 1 (MVP)
- [ ] Generate 10 quality Finnish quizzes
- [ ] 5 test users can create and take quizzes
- [ ] Sub-30-second generation time
- [ ] Zero critical bugs

### Phase 2 (Content Types)
- [ ] Support 4 content types
- [ ] Generate content for 3 subjects
- [ ] User retention >60%
- [ ] Positive feedback from test teachers

### Phase 3 (Finnish Integration)
- [ ] OPH alignment validation
- [ ] Support for 3 languages
- [ ] Accessibility audit pass
- [ ] 95% Finnish language accuracy

## Next Steps to Start Implementation

1. **This Week**: Set up Supabase project and basic authentication
2. **Next Week**: Begin adapting AI generation pipeline for quizzes
3. **Week 3**: First working quiz generation demo
4. **Week 4**: Begin user testing with Finnish teachers

Would you like me to create specific task breakdowns for Phase 0 or any other phase?