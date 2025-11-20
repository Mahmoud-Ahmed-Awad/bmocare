export type RobotEmotion = 'idle' | 'talking' | 'listening' | 'happy' | 'sad' | 'thinking';

export type AppScreen = 'onboarding' | 'menu' | 'learning' | 'parent';

export type CategoryType = 'colors' | 'numbers' | 'arabic' | 'english';

export interface LessonItem {
  id: string;
  display: string; // What is shown (e.g., "A" or a color block)
  spoken: string; // What robot says (e.g., "The letter A")
  expected: string[]; // Accepted voice answers (e.g., ["a", "hey", "apple"])
  lang: string; // 'en-US' or 'ar-SA'
  colorValue?: string; // For color lessons
}

export interface UserStats {
  correct: number;
  incorrect: number;
  name: string;
}

export interface SpeechConfig {
  lang: string;
  pitch: number;
  rate: number;
}