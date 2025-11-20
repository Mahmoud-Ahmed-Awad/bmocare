import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RobotFace } from './components/RobotFace';
import { ParentDashboard } from './components/ParentDashboard';
import { RobotEmotion, AppScreen, UserStats, CategoryType, LessonItem } from './types';
import { speakText, startListening, isSpeechSupported, cancelSpeech, stopListening } from './services/speechService';
import { CATEGORY_CONFIG, LESSON_DATA } from './constants';
import { Mic, Volume2, ArrowLeft, Settings, Play, AlertCircle, Keyboard, Square } from 'lucide-react';

export const App: React.FC = () => {
  // --- State ---
  const [screen, setScreen] = useState<AppScreen>('onboarding');
  const [emotion, setEmotion] = useState<RobotEmotion>('idle');
  const [stats, setStats] = useState<UserStats>({ correct: 0, incorrect: 0, name: '' });
  const [inputValue, setInputValue] = useState('');
  
  // Onboarding specific state
  const [onboardingStep, setOnboardingStep] = useState<'start' | 'ask_name' | 'manual_name'>('start');
  
  // Learning State
  const [currentCategory, setCurrentCategory] = useState<CategoryType | null>(null);
  const [currentLesson, setCurrentLesson] = useState<LessonItem | null>(null);
  const [remainingLessons, setRemainingLessons] = useState<LessonItem[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [showParentDash, setShowParentDash] = useState(false);
  const [isManualLessonInput, setIsManualLessonInput] = useState(false);

  // Keep track of component mounted state
  const isMounted = useRef(true);

  // --- Initialization ---
  useEffect(() => {
    isMounted.current = true;
    const savedName = localStorage.getItem('bmocare_name');
    const savedStats = localStorage.getItem('bmocare_stats');

    if (savedName) {
      setStats(savedStats ? JSON.parse(savedStats) : { correct: 0, incorrect: 0, name: savedName });
      setScreen('menu');
    } 
    
    return () => { isMounted.current = false; };
  }, []);

  // Save stats on change
  useEffect(() => {
    if (stats.name) {
      localStorage.setItem('bmocare_name', stats.name);
      localStorage.setItem('bmocare_stats', JSON.stringify(stats));
    }
  }, [stats]);

  // --- Helpers ---
  
  const speak = useCallback((text: string, lang: string = 'en-US', onComplete?: () => void) => {
    setEmotion('talking');
    speakText(text, lang, () => {
      if (isMounted.current) {
        setEmotion('idle');
        if (onComplete) onComplete();
      }
    });
  }, []);

  const handleStop = () => {
    cancelSpeech();
    stopListening();
    setIsListening(false);
    setEmotion('idle');
    setFeedbackMessage('Stopped.');
  };

  // --- Onboarding Handlers ---

  const handleStartInteraction = () => {
    setOnboardingStep('ask_name');
    const greeting = "Hello! I am BMO, your new friend. What is your name?";
    
    speak(greeting, 'en-US', () => {
        startNameListening();
    });
  };

  const startNameListening = () => {
    setIsListening(true);
    setEmotion('listening');
    setFeedbackMessage('Listening for your name...');

    startListening(
        'en-US',
        (name) => {
            setIsListening(false);
            handleNameAcquired(name);
        },
        () => {
            setIsListening(false);
            if (emotion === 'listening') setEmotion('idle');
        },
        (err) => {
            setIsListening(false);
            setEmotion('sad');
            setFeedbackMessage("I didn't hear that.");
        }
    );
  };

  const handleNameAcquired = (name: string) => {
      if (name.length > 1) {
          setStats(prev => ({ ...prev, name }));
          setScreen('menu');
          speak(`Nice to meet you, ${name}! Let's learn.`);
      } else {
          speak("I didn't catch that. Can you say it again?");
      }
  };

  const handleManualNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    const name = inputValue.trim();
    setStats(prev => ({ ...prev, name }));
    setScreen('menu');
    speak(`Nice to meet you, ${name}! Let's learn.`);
  };

  // --- Learning Handlers ---

  const startLesson = (category: CategoryType) => {
    setCurrentCategory(category);
    setScreen('learning');
    setIsManualLessonInput(false);
    
    // Initialize the list of questions for this session, ensuring a fresh copy
    const items = [...LESSON_DATA[category]];
    processNextQuestion(items);
  };

  const processNextQuestion = (availableItems: LessonItem[]) => {
    // If no questions remain, trigger completion
    if (availableItems.length === 0) {
      handleCategoryComplete();
      return;
    }

    // Pick a random item from the remaining list
    const randomIndex = Math.floor(Math.random() * availableItems.length);
    const nextItem = availableItems[randomIndex];
    
    // Create new list excluding the picked item to avoid repeats
    const newRemaining = availableItems.filter((_, i) => i !== randomIndex);
    
    setRemainingLessons(newRemaining);
    setCurrentLesson(nextItem);
    setFeedbackMessage('');
    setEmotion('idle');
    setInputValue('');
    
    // Announce the item
    setTimeout(() => {
       speak(nextItem.spoken, nextItem.lang);
    }, 500);
  };

  const handleCategoryComplete = () => {
    setCurrentLesson(null);
    setEmotion('happy');
    setFeedbackMessage("All done!");
    speak("Great job! You finished all questions!", 'en-US', () => {
      setScreen('menu');
      setCurrentCategory(null);
    });
  };

  const handleListen = () => {
    if (!currentLesson) return;

    handleStop();

    setIsListening(true);
    setEmotion('listening');

    startListening(
      currentLesson.lang,
      (transcript) => {
        setIsListening(false);
        verifyAnswer(transcript);
      },
      () => {
        setIsListening(false);
        if (emotion === 'listening') setEmotion('idle');
      },
      (err) => {
        setIsListening(false);
        setEmotion('sad');
        setFeedbackMessage("I couldn't hear you. Try again!");
      }
    );
  };

  const handleManualLessonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    verifyAnswer(inputValue);
    setInputValue('');
  };

  const verifyAnswer = (input: string) => {
    if (!currentLesson) return;

    const normalizedInput = input.toLowerCase().trim();
    const isCorrect = currentLesson.expected.some(exp => normalizedInput.includes(exp.toLowerCase()));

    if (isCorrect) {
      setStats(prev => ({ ...prev, correct: prev.correct + 1 }));
      setEmotion('happy');
      setFeedbackMessage('Correct! Great job!');
      speak('Correct!', 'en-US', () => {
        setTimeout(() => {
            // Proceed to next question using the remaining items state
            processNextQuestion(remainingLessons);
        }, 1000);
      });
    } else {
      setStats(prev => ({ ...prev, incorrect: prev.incorrect + 1 }));
      setEmotion('sad');
      setFeedbackMessage(`Not quite. I heard "${input}".`);
      speak("Let's try again.", 'en-US');
    }
  };

  const handleReset = () => {
    handleStop();
    localStorage.removeItem('bmocare_name');
    localStorage.removeItem('bmocare_stats');
    setStats({ correct: 0, incorrect: 0, name: '' });
    setScreen('onboarding');
    setOnboardingStep('start');
    setInputValue('');
    setShowParentDash(false);
  };

  // --- Render ---

  if (!isSpeechSupported) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4 text-center">
            <div className="max-w-md">
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-slate-800 mb-2">Browser Not Supported</h1>
                <p className="text-slate-600">Please use Google Chrome, Edge, or Safari to access the voice features of BMOCARE.</p>
            </div>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-bmo-body flex flex-col items-center relative overflow-hidden">
      
      {/* Controls Top Right */}
      <div className="absolute top-4 right-4 flex gap-2 z-20">
        <button 
            onClick={handleStop}
            className="p-2 bg-red-500/20 rounded-full hover:bg-red-500/40 text-white transition-colors"
            title="Stop Speaking/Listening"
        >
            <Square size={20} fill="currentColor" />
        </button>
        <button 
            onClick={() => setShowParentDash(true)}
            className="p-2 bg-black/10 rounded-full hover:bg-black/20 text-white transition-colors"
            title="Parent Dashboard"
        >
            <Settings size={20} />
        </button>
      </div>

      {/* Top Section: Robot Face */}
      <div className="w-full h-[55vh] bg-teal-700 flex flex-col items-center justify-end pb-8 relative rounded-b-[60px] shadow-2xl z-0 transition-all duration-500">
         <div className="w-full h-full absolute top-0 left-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
         {/* Removed scaling wrapper to accommodate larger native face component */}
         <div className="z-10">
            <RobotFace emotion={emotion} />
         </div>
      </div>

      {/* Bottom Section: Content */}
      <div className="flex-1 w-full max-w-md p-6 flex flex-col items-center justify-center">
        
        {/* ONBOARDING */}
        {screen === 'onboarding' && (
          <div className="w-full flex flex-col items-center gap-6 animate-fade-in">
            
            {onboardingStep === 'start' && (
                <>
                    <h2 className="text-3xl font-bold text-white text-center drop-shadow-md">
                        Hi! I'm BMO.
                    </h2>
                    <button 
                        onClick={handleStartInteraction}
                        className="bg-bmo-accent text-slate-800 px-10 py-4 rounded-full shadow-xl font-bold text-2xl hover:bg-yellow-300 active:scale-95 transition-all flex items-center gap-3"
                    >
                        <Play fill="currentColor" size={24} /> START
                    </button>
                </>
            )}

            {onboardingStep === 'ask_name' && (
                <div className="text-center space-y-6 w-full">
                    <h2 className="text-2xl font-bold text-white drop-shadow-md">
                        What is your name?
                    </h2>
                    
                    <div className="flex justify-center">
                        <button 
                            onClick={startNameListening}
                            disabled={isListening}
                            className={`p-6 rounded-full shadow-xl transition-all ${isListening ? 'bg-red-500 animate-pulse' : 'bg-white/20 text-white hover:bg-white/30'}`}
                        >
                            <Mic size={48} />
                        </button>
                    </div>

                    <div className="text-white/80 min-h-[20px]">{feedbackMessage}</div>

                    <button 
                        onClick={() => setOnboardingStep('manual_name')}
                        className="text-white/70 hover:text-white underline text-sm flex items-center justify-center gap-2 mx-auto"
                    >
                        <Keyboard size={16} /> Type my name instead
                    </button>
                </div>
            )}

            {onboardingStep === 'manual_name' && (
                <div className="w-full animate-slide-up">
                    <form onSubmit={handleManualNameSubmit} className="flex gap-2">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="flex-1 px-6 py-4 rounded-full text-xl text-center font-bold text-slate-700 outline-none shadow-lg"
                        placeholder="Type your name..."
                        autoFocus
                    />
                    <button 
                        type="submit" 
                        className="bg-bmo-accent text-slate-800 p-4 rounded-full shadow-lg font-bold hover:bg-yellow-300 transition-transform active:scale-95"
                    >
                        <Play fill="currentColor" />
                    </button>
                    </form>
                    <button 
                        onClick={() => setOnboardingStep('ask_name')}
                        className="mt-4 text-white/70 hover:text-white text-sm block mx-auto"
                    >
                        Back to Voice
                    </button>
                </div>
            )}
          </div>
        )}

        {/* MAIN MENU */}
        {screen === 'menu' && (
          <div className="w-full grid grid-cols-2 gap-4 animate-slide-up">
            {CATEGORY_CONFIG.map((cat) => (
              <button
                key={cat.id}
                onClick={() => startLesson(cat.id as CategoryType)}
                className={`${cat.color} aspect-square rounded-3xl shadow-lg flex flex-col items-center justify-center gap-3 hover:brightness-110 active:scale-95 transition-all border-b-4 border-black/20 group`}
              >
                <cat.icon size={40} className="text-white drop-shadow-md group-hover:scale-110 transition-transform" />
                <span className="text-white font-bold text-lg tracking-wide drop-shadow-sm">{cat.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* LEARNING MODE */}
        {screen === 'learning' && currentLesson && (
          <div className="w-full flex flex-col items-center gap-6 animate-slide-up">
            <div className="w-full flex justify-between items-center">
              <button onClick={() => { handleStop(); setScreen('menu'); }} className="text-white/80 hover:text-white flex gap-1 items-center font-bold bg-black/10 px-4 py-2 rounded-full">
                <ArrowLeft size={20} /> Back
              </button>
            </div>

            {/* Lesson Display Card */}
            <div 
              className="w-56 h-56 bg-white rounded-3xl shadow-2xl flex items-center justify-center text-8xl font-bold text-slate-800 transform transition-transform hover:scale-105 border-4 border-white/50"
              style={{ color: currentLesson.colorValue || '#334155' }}
            >
                {currentLesson.display}
            </div>

            <div className="h-8 text-white font-bold text-lg text-center drop-shadow-md px-4 py-1 rounded-full bg-black/10">
                {feedbackMessage}
            </div>

            {/* Controls */}
            {!isManualLessonInput ? (
                <div className="flex flex-col items-center gap-4">
                    <div className="flex gap-8 items-center">
                    <button 
                        onClick={() => speak(currentLesson.spoken, currentLesson.lang)}
                        className="p-5 rounded-full bg-blue-500 text-white shadow-lg border-b-4 border-blue-700 active:border-b-0 active:translate-y-1 transition-all hover:bg-blue-400"
                        aria-label="Repeat"
                    >
                        <Volume2 size={32} />
                    </button>
                    
                    <button 
                        onClick={handleListen}
                        disabled={isListening}
                        className={`p-8 rounded-full shadow-xl border-b-4 transition-all transform ${
                            isListening 
                            ? 'bg-red-500 border-red-700 scale-110 ring-4 ring-red-300' 
                            : 'bg-bmo-accent text-slate-800 border-yellow-600 hover:bg-yellow-400 active:border-b-0 active:translate-y-1'
                        }`}
                        aria-label="Speak Answer"
                    >
                        <Mic size={48} fill={isListening ? "white" : "currentColor"} className={isListening ? "animate-pulse" : ""} />
                    </button>
                    </div>
                    <p className="text-white/80 text-sm font-semibold">Tap microphone to answer</p>
                    <button 
                        onClick={() => { setIsManualLessonInput(true); setInputValue(''); }}
                        className="text-white/70 hover:text-white underline text-sm flex items-center justify-center gap-2 mt-2"
                    >
                        <Keyboard size={16} /> Type answer instead
                    </button>
                </div>
            ) : (
                <div className="w-full max-w-xs animate-slide-up">
                    <form onSubmit={handleManualLessonSubmit} className="flex gap-2">
                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            className="flex-1 px-4 py-3 rounded-full text-lg text-center font-bold text-slate-700 outline-none shadow-lg"
                            placeholder="Type answer..."
                            autoFocus
                        />
                        <button 
                            type="submit" 
                            className="bg-bmo-accent text-slate-800 p-3 rounded-full shadow-lg font-bold hover:bg-yellow-300 transition-transform active:scale-95"
                        >
                            <Play fill="currentColor" size={20} />
                        </button>
                    </form>
                    <button 
                        onClick={() => setIsManualLessonInput(false)}
                        className="mt-4 text-white/70 hover:text-white text-sm block mx-auto"
                    >
                        Back to Voice
                    </button>
                </div>
            )}
          </div>
        )}

        {/* Parent Dashboard Modal */}
        {showParentDash && (
          <ParentDashboard 
            stats={stats} 
            onClose={() => setShowParentDash(false)} 
            onReset={handleReset} 
          />
        )}
    </div>
  );
};
