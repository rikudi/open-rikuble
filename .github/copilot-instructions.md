# GitHub Copilot Instructions for KoulutusBot

## Project Vision
This is **KoulutusBot** - transforming the open-rikuble website builder into an AI-powered Finnish educational content generator. Read `docs/KOULUTUSBOT_PLAN.md` for complete project context.

## Core Architecture

### AI Content Generation Pipeline
The system streams AI-generated content through `/api/generate-ai-code-stream` with real-time progress updates:
- **Edit Detection**: Analyzes user intent via `lib/context-selector.ts` and `lib/edit-intent-analyzer.ts`
- **File Context**: Builds targeted file lists using `lib/file-search-executor.ts`
- **Streaming Output**: XML-tagged response parsing with package auto-detection
- **State Management**: Global conversation state tracks user preferences and edit history

### Sandbox Providers (Dual Architecture)
Two interchangeable execution environments in `lib/sandbox/providers/`:
- **Vercel Provider**: Firecracker VMs, 5min timeout, `/vercel/sandbox` working directory
- **E2B Provider**: Full Linux containers, 15min timeout, `/home/user/app` working directory
- **Config**: `config/app.config.ts` centralizes timeout, port, and runtime settings

### Essential Developer Workflows

**Environment Setup:**
```bash
# Required for both sandbox providers
pnpm install
cp .env.example .env.local
# Configure FIRECRAWL_API_KEY + either VERCEL_* or E2B_API_KEY
pnpm dev
```

**AI Generation Testing:**
```typescript
// Test streaming endpoint directly
fetch('/api/generate-ai-code-stream', {
  method: 'POST',
  body: JSON.stringify({
    prompt: "Create a quiz about Finnish history",
    isEdit: false,
    context: { sandboxId: null }
  })
})
```

## Project-Specific Patterns

### File Organization Conventions
- **Components**: Nested structure `components/app/(home)/sections/` mirrors Next.js App Router
- **API Routes**: All generation logic in `app/api/` with `-stream` variants for real-time feedback
- **Sandbox**: Provider pattern in `lib/sandbox/` abstracts Vercel vs E2B differences
- **Styles**: Fire design system in `styles/fire.css` with component-specific CSS imports

### AI Response Parsing
Critical XML tag structure in streaming responses:
```xml
<file path="src/components/Quiz.jsx">
// Educational component code
</file>

<package>react-quiz-maker</package>

<explanation>
Created interactive quiz component...
</explanation>
```

### Conversation State Management
Global state pattern tracks user preferences and edit context:
```typescript
// Preserved across API calls for intelligent editing
global.conversationState = {
  context: {
    messages: [...],
    edits: [...],
    userPreferences: { preferredEditStyle: 'targeted' }
  }
}
```

## Finnish Education Focus

### Content Types for Educational Generation
Replace website templates with educational content types:
- **Courses**: Structured learning modules with Finnish curriculum alignment
- **Assessments**: Interactive quizzes with immediate feedback
- **Presentations**: Slide-based educational content
- **Exercises**: Practice problems with solutions

### OPH Standards Integration
When generating educational content, reference Finnish Education Agency standards:
- `perusopetus`: Basic education (grades 1-9)
- `lukio`: Upper secondary education
- `ammattikoulu`: Vocational training
- Multi-language support: Finnish primary, Swedish/English secondary

## Integration Points

### External Dependencies
- **Firecrawl**: Web scraping for educational resource analysis
- **AI Providers**: Multi-provider support (Anthropic, OpenAI, Groq, Gemini)
- **Sandbox**: File system operations and package installation
- **Streaming**: Server-sent events for real-time generation feedback

### Critical File Relationships
- `app/generation/page.tsx` → Main UI orchestrator
- `lib/context-selector.ts` → Smart file selection for edits
- `lib/sandbox/sandbox-manager.ts` → Provider abstraction layer
- `config/app.config.ts` → Central configuration

## Testing & Debugging

**Sandbox Connection Issues:**
```bash
# Check provider logs
tail -f /tmp/vite.log  # Vercel
# or check E2B dashboard for container status
```

**AI Generation Debugging:**
```javascript
// Enable verbose logging in generation stream
console.log('[generate-ai-code-stream] Context:', context);
```

**Common Pitfalls:**
- File path mismatches between providers (`/vercel/sandbox` vs `/home/user/app`)
- Package installation timing with Vite server restarts
- Conversation state cleanup (trim after 20 messages)

## Implementation Reference

For actionable steps, technical details, and phase breakdowns, always consult the implementation roadmap in:
- `docs/IMPLEMENTATION_PLAN.md`

This file contains the latest instructions for setup, Supabase integration, authentication, and development phases. All agents and contributors should refer to it before making architectural or code changes.

## Next Phase: Educational Transformation
Focus development on adapting the existing architecture for Finnish educational content generation while preserving the robust AI streaming and sandbox execution capabilities.