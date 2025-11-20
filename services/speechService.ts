// Browser compatibility types
interface IWindow extends Window {
  webkitSpeechRecognition: any;
  SpeechRecognition: any;
}

const w = window as unknown as IWindow;
const SpeechRecognition = w.SpeechRecognition || w.webkitSpeechRecognition;

// Keep a global reference to prevent garbage collection of the utterance during playback (Chrome bug fix)
let currentUtterance: SpeechSynthesisUtterance | null = null;
let currentRecognition: any = null;

export const isSpeechSupported = !!SpeechRecognition && !!window.speechSynthesis;

export const cancelSpeech = () => {
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
    if (currentUtterance) {
        // Remove callback to prevent side effects when manually cancelling
        currentUtterance.onend = null;
        currentUtterance = null;
    }
};

export const stopListening = () => {
    if (currentRecognition) {
        try {
            currentRecognition.stop();
        } catch (e) {
            console.error("Error stopping recognition:", e);
        }
        currentRecognition = null;
    }
};

export const speakText = (text: string, lang: string = 'en-US', onEnd?: () => void) => {
  if (!window.speechSynthesis) {
    console.warn("Speech synthesis not supported in this browser.");
    if (onEnd) onEnd();
    return;
  }
  
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  currentUtterance = utterance; 

  utterance.lang = lang;
  utterance.rate = 0.9; 
  utterance.pitch = 1.1; 

  utterance.onend = () => {
    currentUtterance = null;
    if (onEnd) onEnd();
  };

  utterance.onerror = (e) => {
    currentUtterance = null;
    if (e.error === 'canceled' || e.error === 'interrupted') {
        return; // Do not call onEnd if cancelled manually to prevent chain reactions
    }
    if (e.error === 'not-allowed') {
        console.warn("Speech blocked by autoplay policy.");
        if (onEnd) onEnd();
        return;
    }
    console.error("Speech synthesis error:", e.error);
    if (onEnd) onEnd();
  };

  setTimeout(() => {
    try {
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error("Failed to call speak:", err);
      if (onEnd) onEnd();
    }
  }, 10);
};

export const startListening = (
  lang: string,
  onResult: (text: string) => void,
  onEnd: () => void,
  onError: (err: any) => void
) => {
  if (!SpeechRecognition) {
    onError('Speech recognition not supported');
    return null;
  }
  
  // Stop any existing recognition
  stopListening();

  try {
    const recognition = new SpeechRecognition();
    currentRecognition = recognition;
    
    recognition.lang = lang;
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      if (event.results && event.results.length > 0) {
        const text = event.results[0][0].transcript;
        onResult(text);
      }
    };

    recognition.onspeechend = () => {
      recognition.stop();
    };

    recognition.onend = () => {
      currentRecognition = null;
      onEnd();
    };

    recognition.onerror = (event: any) => {
      if (event.error !== 'no-speech' && event.error !== 'aborted') {
        console.error("Speech recognition error:", event.error);
      }
      onError(event.error);
    };

    recognition.start();
    return recognition;
  } catch (e) {
    console.error("Recognition start failed", e);
    onEnd();
    return null;
  }
};