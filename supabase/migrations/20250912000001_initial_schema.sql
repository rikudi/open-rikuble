-- KoulutusBot Initial Schema Migration
-- Description: Sets up the initial database schema for KoulutusBot educational content platform
-- Created: 2025-09-12

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

-- Create indexes for better performance
CREATE INDEX idx_educational_content_user_id ON public.educational_content(user_id);
CREATE INDEX idx_educational_content_content_type ON public.educational_content(content_type);
CREATE INDEX idx_educational_content_subject ON public.educational_content(subject);
CREATE INDEX idx_educational_content_grade_level ON public.educational_content(grade_level);
CREATE INDEX idx_educational_content_created_at ON public.educational_content(created_at DESC);
CREATE INDEX idx_quiz_sessions_quiz_id ON public.quiz_sessions(quiz_id);
CREATE INDEX idx_quiz_sessions_created_at ON public.quiz_sessions(created_at DESC);
CREATE INDEX idx_credit_transactions_user_id ON public.credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON public.credit_transactions(created_at DESC);
CREATE INDEX idx_content_templates_category ON public.content_templates(category);
CREATE INDEX idx_content_templates_is_public ON public.content_templates(is_public);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.educational_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for educational content
CREATE POLICY "Users can CRUD their own content" ON public.educational_content
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Public content visible to all" ON public.educational_content
  FOR SELECT USING (sharing_settings->>'public' = 'true');

CREATE POLICY "Link-shared content visible to all" ON public.educational_content
  FOR SELECT USING (sharing_settings->>'link_sharing' = 'true');

-- RLS Policies for quiz sessions
CREATE POLICY "Quiz sessions viewable by content owner" ON public.quiz_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.educational_content 
      WHERE id = quiz_sessions.quiz_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert quiz sessions for public/shared quizzes" ON public.quiz_sessions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.educational_content 
      WHERE id = quiz_sessions.quiz_id 
      AND (
        sharing_settings->>'public' = 'true' 
        OR sharing_settings->>'link_sharing' = 'true'
      )
    )
  );

-- RLS Policies for credit transactions
CREATE POLICY "Users can view own transactions" ON public.credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.credit_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for content templates
CREATE POLICY "Public templates visible to all" ON public.content_templates
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view own templates" ON public.content_templates
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can CRUD own templates" ON public.content_templates
  FOR ALL USING (auth.uid() = created_by);

-- Function to create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$;

-- Trigger to automatically create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

-- Triggers for updated_at timestamps
CREATE TRIGGER set_timestamp_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER set_timestamp_educational_content
  BEFORE UPDATE ON public.educational_content
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();