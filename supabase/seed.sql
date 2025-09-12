-- KoulutusBot Seed Data
-- Description: Initial data for development and testing
-- Run this after the initial migration

-- Insert sample content templates for educational content
INSERT INTO public.content_templates (id, name, description, category, template_data, is_public, created_by) VALUES
  (
    uuid_generate_v4(),
    'Perus Matematiikka Testi',
    'Perustemplaatti matematiikan testaamiseen perusopetuksessa',
    'quiz',
    '{
      "questions": [
        {
          "type": "multiple_choice",
          "text": "Mikä on 2 + 2?",
          "options": ["3", "4", "5", "6"],
          "correct": 1
        }
      ],
      "settings": {
        "time_limit": 900,
        "show_answers": true,
        "randomize_questions": false
      }
    }',
    true,
    NULL
  ),
  (
    uuid_generate_v4(),
    'Suomen Historia Kysymykset',
    'Perustemplaatti Suomen historian testaamiseen',
    'quiz',
    '{
      "questions": [
        {
          "type": "multiple_choice",
          "text": "Milloin Suomi itsenäistyi?",
          "options": ["1917", "1918", "1916", "1919"],
          "correct": 0
        }
      ],
      "settings": {
        "time_limit": 1200,
        "show_answers": true,
        "randomize_questions": true
      }
    }',
    true,
    NULL
  ),
  (
    uuid_generate_v4(),
    'Englannin Kielioppi',
    'Perustemplaatti englannin kieliopin harjoitteluun',
    'exercise',
    '{
      "exercises": [
        {
          "type": "fill_in_blank",
          "text": "I ___ going to school.",
          "answer": "am",
          "hints": ["present tense of be"]
        }
      ],
      "difficulty": "beginner"
    }',
    true,
    NULL
  ),
  (
    uuid_generate_v4(),
    'Tieteen Perusteet Kurssi',
    'Perustemplaatti tieteen perusteiden opetukseen',
    'course',
    '{
      "modules": [
        {
          "title": "Johdanto tieteeseen",
          "content": "Tässä moduulissa opimme mitä tiede on...",
          "duration": 45
        }
      ],
      "prerequisites": [],
      "learning_objectives": ["Ymmärtää tieteen peruskäsitteet"]
    }',
    true,
    NULL
  );

-- Note: The following sample data would require actual user IDs from auth.users
-- These are commented out but can be used for testing with real user accounts

/*
-- Sample educational content (uncomment and update user_id when testing)
INSERT INTO public.educational_content (
  user_id, 
  content_type, 
  title, 
  description, 
  subject, 
  grade_level, 
  language,
  content_data,
  sharing_settings
) VALUES
  (
    '00000000-0000-0000-0000-000000000000', -- Replace with actual user ID
    'quiz',
    'Matematiikan Perusteet - Yhteenlasku',
    'Perustason yhteenlaskutehtäviä alakoululaisille',
    'Matematiikka',
    'perusopetus_1-3',
    'fi',
    '{
      "questions": [
        {
          "id": 1,
          "type": "multiple_choice",
          "question": "Mikä on 5 + 3?",
          "options": ["6", "7", "8", "9"],
          "correct_answer": 2,
          "explanation": "5 + 3 = 8"
        },
        {
          "id": 2,
          "type": "multiple_choice", 
          "question": "Mikä on 10 + 7?",
          "options": ["15", "16", "17", "18"],
          "correct_answer": 2,
          "explanation": "10 + 7 = 17"
        }
      ],
      "settings": {
        "time_limit": 600,
        "show_correct_answers": true,
        "randomize_order": false
      }
    }',
    '{"public": true, "link_sharing": true}'
  );
*/