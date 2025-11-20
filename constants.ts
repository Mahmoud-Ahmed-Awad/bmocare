import { CategoryType, LessonItem } from './types';
import { Palette, Calculator, Languages, Type } from 'lucide-react';

export const LESSON_DATA: Record<CategoryType, LessonItem[]> = {
  english: [
    { id: 'e1', display: 'A', spoken: 'A', expected: ['a', 'apple', 'hey'], lang: 'en-US' },
    { id: 'e2', display: 'B', spoken: 'B', expected: ['b', 'bee', 'ball'], lang: 'en-US' },
    { id: 'e3', display: 'C', spoken: 'C', expected: ['c', 'see', 'cat'], lang: 'en-US' },
    { id: 'e4', display: 'D', spoken: 'D', expected: ['d', 'dee', 'dog'], lang: 'en-US' },
  ],
  numbers: [
    { id: 'n1', display: '1', spoken: 'One', expected: ['one', '1', 'won'], lang: 'en-US' },
    { id: 'n2', display: '2', spoken: 'Two', expected: ['two', '2', 'to'], lang: 'en-US' },
    { id: 'n3', display: '3', spoken: 'Three', expected: ['three', '3'], lang: 'en-US' },
    { id: 'n4', display: '4', spoken: 'Four', expected: ['four', '4'], lang: 'en-US' },
  ],
  colors: [
    { id: 'c1', display: 'Red', spoken: 'Red', expected: ['red'], lang: 'en-US', colorValue: '#EF4444' },
    { id: 'c2', display: 'Blue', spoken: 'Blue', expected: ['blue'], lang: 'en-US', colorValue: '#3B82F6' },
    { id: 'c3', display: 'Green', spoken: 'Green', expected: ['green'], lang: 'en-US', colorValue: '#22C55E' },
    { id: 'c4', display: 'Yellow', spoken: 'Yellow', expected: ['yellow'], lang: 'en-US', colorValue: '#EAB308' },
  ],
  arabic: [
    { id: 'a1', display: 'أ', spoken: 'Alif', expected: ['alif', 'alef', 'أ'], lang: 'ar-SA' },
    { id: 'a2', display: 'ب', spoken: 'Baa', expected: ['baa', 'ba', 'ب'], lang: 'ar-SA' },
    { id: 'a3', display: 'ت', spoken: 'Taa', expected: ['taa', 'ta', 'ت'], lang: 'ar-SA' },
  ]
};

export const CATEGORY_CONFIG = [
  { id: 'colors', label: 'Colors', icon: Palette, color: 'bg-pink-400' },
  { id: 'numbers', label: 'Numbers', icon: Calculator, color: 'bg-blue-400' },
  { id: 'english', label: 'English', icon: Type, color: 'bg-purple-400' },
  { id: 'arabic', label: 'Arabic', icon: Languages, color: 'bg-orange-400' },
];