import { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Volume2, VolumeX, Sparkles, HelpCircle } from "lucide-react";
import GlassCard from "./GlassCard";
import { Language } from "../types";
import { translations } from "../utils/translations";

interface VoiceAssistantProps {
  language: Language;
}

export default function VoiceAssistant({ language }: VoiceAssistantProps) {
  const t = translations[language];
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [reply, setReply] = useState("");
  const [supported, setSupported] = useState(true);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Check Speech Recognition support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSupported(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    
    // Select correct lang code
    rec.lang = language === "ta" ? "ta-IN" : language === "hi" ? "hi-IN" : "en-IN";

    rec.onstart = () => {
      setIsListening(true);
      setTranscript("Listening for your voice...");
    };

    rec.onresult = async (e: any) => {
      const text = e.results[0][0].transcript;
      setTranscript(text);
      setIsListening(false);
      await fetchAIResponse(text);
    };

    rec.onerror = (err: any) => {
      console.error("Speech Recognition Error:", err);
      setIsListening(false);
      setTranscript("Error capturing speech. Please try again.");
    };

    rec.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = rec;
    synthRef.current = window.speechSynthesis;
  }, [language]);

  const toggleListening = () => {
    if (isPlaying) {
      stopSpeaking();
    }

    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript("");
      setReply("");
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
      }
    }
  };

  const fetchAIResponse = async (question: string) => {
    setReply("Thinking...");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: question }],
          language,
        }),
      });
      const data = await res.json();
      setReply(data.content);
      speakResponse(data.content);
    } catch (err) {
      setReply("Could not connect to constitutional knowledge base.");
    }
  };

  const speakResponse = (text: string) => {
    if (!synthRef.current) return;
    
    // Stop any ongoing speech
    synthRef.current.cancel();

    // Clean markdown before speaking
    const cleanText = text.replace(/[*#_`[\]()]/g, "");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Match language
    if (language === "ta") {
      utterance.lang = "ta-IN";
    } else if (language === "hi") {
      utterance.lang = "hi-IN";
    } else {
      utterance.lang = "en-IN";
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsPlaying(false);
    }
  };

  if (!supported) {
    return (
      <GlassCard className="p-4 bg-amber-500/5 border-amber-500/10">
        <p className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 shrink-0" />
          <span>Voice assistant input requires microphone permission. Enable in browser toolbar.</span>
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard className="p-5 border-amber-500/20 dark:border-amber-500/10 bg-gradient-to-br from-amber-500/5 to-transparent shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h3 className="font-bold text-sm text-neutral-800 dark:text-neutral-200">
            Interactive Constitutional Voice Assistant
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {isPlaying && (
            <button
              onClick={stopSpeaking}
              className="p-1.5 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-950/40 text-red-600 dark:text-red-400 transition-all text-xs"
              title="Stop Speech Output"
            >
              <VolumeX className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Dynamic Speech Button */}
        <button
          onClick={toggleListening}
          className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-md ${
            isListening
              ? "bg-red-500 text-white animate-pulse shadow-red-500/30"
              : isPlaying
              ? "bg-amber-500 text-slate-950 animate-bounce shadow-amber-500/30"
              : "bg-amber-500 hover:bg-amber-600 text-slate-950"
          }`}
          title={isListening ? "Stop Listening" : "Tap to Speak"}
        >
          {isListening ? <MicOff className="w-6 h-6 animate-spin" /> : <Mic className="w-6 h-6" />}
          
          {/* Waves animation when speaking */}
          {isListening && (
            <span className="absolute inset-0 rounded-full border-4 border-red-500 animate-ping opacity-65" />
          )}
        </button>

        <div className="flex-1 text-center sm:text-left">
          <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-1">
            {isListening ? "Listening Active" : isPlaying ? "Speaking AI Response" : "Status: Ready"}
          </p>
          <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 min-h-[20px] italic">
            {transcript || `Try: "What are my Fundamental Rights?"`}
          </p>
        </div>
      </div>

      {reply && (
        <div className="mt-4 p-3 bg-neutral-50 dark:bg-neutral-950/50 rounded-xl border border-neutral-200/50 dark:border-neutral-800/50 text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed max-h-48 overflow-y-auto">
          <div className="flex items-center gap-1 text-[10px] text-amber-500 uppercase font-bold tracking-wider mb-1">
            <Volume2 className="w-3.5 h-3.5" />
            <span>AI Voice Explanation</span>
          </div>
          {reply}
        </div>
      )}
    </GlassCard>
  );
}
