import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Mic,
  Send,
  Bot,
  User,
  Volume2,
  VolumeX,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage, Language } from "@/contexts/LanguageContext";
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { GoogleGenerativeAI } from '@google/generative-ai';
import ReactMarkdown from 'react-markdown';
import { elevenLabsService } from "@/services/elevenlabs.service";

type Message = {
  role: "user" | "assistant";
  content: string;
  fullContent?: string; // Store the complete message for typing effect
  isTyping?: boolean; // Flag to indicate if message is still being typed
};

const KrishiMitra = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false); // Track if voice mode is active
  const [lastTranscriptTime, setLastTranscriptTime] = useState(Date.now());
  const [autoSubmitTimer, setAutoSubmitTimer] = useState<NodeJS.Timeout | null>(null);
  const [typingTimer, setTypingTimer] = useState<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { language } = useLanguage();

  // Voice pause duration before auto-submit (in milliseconds)
  const VOICE_PAUSE_DURATION = 4000;
  // Typing effect speed (in milliseconds)
  const TYPING_SPEED = 15;

  // Speech recognition setup
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Update input when transcript changes
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
      setLastTranscriptTime(Date.now());

      // Reset existing timer
      if (autoSubmitTimer) {
        clearTimeout(autoSubmitTimer);
      }

      // Set new timer for auto-submit
      const timer = setTimeout(() => {
        // Only auto-submit if still listening and there's a transcript
        if (listening && input) { // Check 'input' state derived from transcript
          console.log("Auto-submitting due to pause...");
          // Instead of stopping listening in voice mode, just submit
          if (voiceMode) {
            handleSubmit();
          } else {
            SpeechRecognition.stopListening(); // Stop listening first
            // Use a small delay to ensure state updates before submitting
            setTimeout(() => handleSubmit(), 100);
          }
        }
      }, VOICE_PAUSE_DURATION);

      setAutoSubmitTimer(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transcript]); // Rerun when transcript changes

  // Cleanup auto-submit timer on unmount
  useEffect(() => {
    return () => {
      if (autoSubmitTimer) clearTimeout(autoSubmitTimer);
      if (typingTimer) clearTimeout(typingTimer);
    };
  }, [autoSubmitTimer, typingTimer]);

  // Update listening state and manage timer clearing
  useEffect(() => {
    setIsListening(listening);

    // If stopped listening externally (e.g., button click), clear the timer
    if (!listening && autoSubmitTimer) {
      clearTimeout(autoSubmitTimer);
      setAutoSubmitTimer(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listening]); // Rerun only when listening state changes

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Get initial greeting based on selected language
  const getInitialGreeting = () => {
    switch(language) {
      case 'hindi':
        return "नमस्ते! मैं कृषि मित्र हूँ। मैं आपकी कृषि संबंधित प्रश्नों में मदद कर सकता हूँ। आप मुझसे कुछ भी पूछ सकते हैं!";
      case 'punjabi':
        return "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਕ੍ਰਿਸ਼ੀ ਮਿੱਤਰ ਹਾਂ। ਮੈਂ ਤੁਹਾਡੇ ਖੇਤੀਬਾੜੀ ਨਾਲ ਸਬੰਧਤ ਸਵਾਲਾਂ ਵਿੱਚ ਮਦਦ ਕਰ ਸਕਦਾ ਹਾਂ। ਤੁਸੀਂ ਮੈਨੂੰ ਕੁਝ ਵੀ ਪੁੱਛ ਸਕਦੇ ਹੋ!";
      default:
        return "Hello! I am Krishi Mitra. I can help with your agriculture-related questions. Feel free to ask me anything!";
    }
  };

  // Initial greeting message when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const greeting = getInitialGreeting();
      setMessages([
        {
          role: "assistant",
          content: "",
          fullContent: greeting,
          isTyping: true
        }
      ]);
      // Start typing effect for greeting
      startTypingEffect(0, greeting);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, language]); // Add language dependency

  // Typing effect for messages
  const startTypingEffect = (messageIndex: number, fullText: string) => {
    let charIndex = 0;
    const typeChar = () => {
      if (charIndex <= fullText.length) {
        setMessages(prev => {
          const newMessages = [...prev];
          if (newMessages[messageIndex]) {
            newMessages[messageIndex] = {
              ...newMessages[messageIndex],
              content: fullText.substring(0, charIndex),
              isTyping: charIndex < fullText.length
            };
          }
          return newMessages;
        });
        
        charIndex++;
        const timer = setTimeout(typeChar, TYPING_SPEED);
        setTypingTimer(timer);
      } else {
        // Typing finished
        setTypingTimer(null);
        setMessages(prev => {
          const newMessages = [...prev];
          if (newMessages[messageIndex]) {
            newMessages[messageIndex] = {
              ...newMessages[messageIndex],
              content: fullText,
              isTyping: false
            };
          }
          return newMessages;
        });
        
        // Auto-play speech if in voice mode
        if (voiceMode) {
          speakText(fullText, language);
          
          // If voice mode is active, restart listening after speaking
          if (!listening && voiceMode) {
            // Wait a bit to avoid overlap between TTS and listening
            setTimeout(() => {
              startSpeechRecognition(true);
            }, 500);
          }
        }
      }
    };
    
    typeChar();
  };

  // Send message to Gemini API and get response using the Google GenAI library
  const getGeminiResponse = async (userMessage: string): Promise<string> => {
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

      if (!apiKey) {
        console.error("Gemini API key not found in environment variables (VITE_GEMINI_API_KEY)");
        throw new Error("API key not configured");
      }

      // Initialize the Google Generative AI client
      const genAI = new GoogleGenerativeAI(apiKey);

      // Use the recommended free model
      const modelName = "gemini-2.0-flash";
      const model = genAI.getGenerativeModel({ model: modelName });


      // You are KrishiMitra (Farmer's Friend), an agricultural assistant designed to help farmers.
      // The user is a farmer seeking advice. Provide helpful, practical agricultural advice for the following query.
      // Be concise but informative, focusing on actionable advice. Use ${language} language for the response.
      // Format important points with proper markdown, including bold (**text**) and bullet points.
      // If using asterisks for emphasis, ensure they render correctly by using markdown formatting. Making sure the answer is in Devnagri Script in Hindi, less than 200 characters.

      // Create a prompt that guides Gemini towards agricultural advice
      const agriPrompt = `
You are Krishi Mitra, (female) a friendly and casual virtual multillingual assistant for Indian  farmers.  
Guide farmers through every step: explain soil analysis, crop selection, planting schedules, watering needs, pest and disease identification, and harvest best practices.  
Respond in the farmer's chosen language (detect based on language code):  
- Hindi (देवनागरी)  
- Punjabi (ਗੁਰਮੁਖੀ)  
- Telugu (తెలుగు)  
- Malayalam (മലയാളം)  

Always:  
• Use simple, conversational tone as if speaking to a friend.  
• Provide concise bullet points for steps.  
• Offer examples using local crop names and common seasons.  
• Encourage follow‑up questions.  

When giving crop details, include:  
1. *Soil Type & Preparation*  
2. *Sowing Period & Method*  
3. *Nutrient & Water Requirements*  
4. *Pest/Disease Signs & Remedies*  
5. *Harvest Indicators & Post‑Harvest Tips*  

At the end of each reply, prompt: "क्या मैं और मदद कर सकता हूँ?", "ਕੀ ਹੋਰ ਸਹਾਇਤਾ ਚਾਹੀਦੀ ਹੈ?", "మరింత సహాయం కావాలా?", "കൂടുതൽ സഹായം വേണോ?" as appropriate. write response within 100-300 characters.
      User query: ${userMessage}`;

      // Generate content with the new API
      const result = await model.generateContent(agriPrompt);
      const response = await result.response;
      const text = response.text();
      
      return text;
    } catch (error) {
      console.error("Error fetching from Gemini API:", error);

      // Provide appropriate error messages based on language
      switch(language) {
        case 'hindi':
          return `क्षमा करें, मुझे आपके प्रश्न का उत्तर देने में समस्या आ रही है (${error instanceof Error ? error.message : 'Unknown Error'})। कृपया बाद में पुनः प्रयास करें।`;
        case 'punjabi':
          return `ਮਾਫ਼ ਕਰਨਾ, ਮੈਨੂੰ ਤੁਹਾਡੇ ਸਵਾਲ ਦਾ ਜਵਾਬ ਦੇਣ ਵਿੱਚ ਸਮੱਸਿਆ ਆ ਰਹੀ ਹੈ (${error instanceof Error ? error.message : 'Unknown Error'})। ਕਿਰਪਾ ਕਰਕੇ ਬਾਅਦ ਵਿੱਚ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।`;
        default:
           return `I'm sorry, I'm having trouble connecting to my knowledge base right now (${error instanceof Error ? error.message : 'Unknown Error'}). Please try again later.`;
      }
    }
  };
  

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedInput = input.trim(); // Use the current input state
    if (!trimmedInput) return;

    // Add user message
    const userMessage = { role: "user" as const, content: trimmedInput };
    setMessages((prev) => [...prev, userMessage]);
    const userQuery = trimmedInput; // Keep the query
    setInput(""); // Clear input field
    setIsLoading(true);
    resetTranscript(); // Clear transcript visually
    
    if (autoSubmitTimer) { // Ensure timer is cleared on manual submit too
      clearTimeout(autoSubmitTimer);
      setAutoSubmitTimer(null);
    }
    
    if (listening && !voiceMode) { // Stop listening if manually submitted and not in voice mode
      SpeechRecognition.stopListening();
    }

    try {
      // Get AI response from Gemini
      const aiResponse = await getGeminiResponse(userQuery);

      // Add assistant message with typing effect
      const newIndex = messages.length + 1; // +1 because we already added the user message
      
      setMessages((prev) => [
        ...prev, 
        { 
          role: "assistant" as const, 
          content: "", // Start empty for typing effect
          fullContent: aiResponse,
          isTyping: true
        }
      ]);
      
      // Start typing effect
      startTypingEffect(newIndex, aiResponse);

    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: `Could not send message: ${error instanceof Error ? error.message : 'Unknown Error'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false); // Ensure loading state is reset
    }
  };

  const startSpeechRecognition = (continueVoiceMode = false) => {
    if (!browserSupportsSpeechRecognition) {
      toast({
        title: "Not Supported",
        description: "Voice recognition is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }
    
    if (isListening && !continueVoiceMode) return; // Prevent starting if already listening
    
    // Set voice mode if this is a voice mode activation (not just continuation)
    if (!continueVoiceMode) {
      setVoiceMode(true);
    }

    resetTranscript(); // Reset before starting
    setInput(""); // Clear text input when starting voice
    SpeechRecognition.startListening({ continuous: true, language: getRecognitionLanguage() });

    if (!continueVoiceMode) {
      toast({
        title: "Voice Mode",
        description: "Voice mode activated. I'll listen and respond continuously.",
      });
    }
  };

  const stopSpeechRecognition = () => {
    if (!isListening) return; // Prevent stopping if not listening

    SpeechRecognition.stopListening();
    setVoiceMode(false); // Exit voice mode
    
    if (autoSubmitTimer) { // Clear timer on manual stop
      clearTimeout(autoSubmitTimer);
      setAutoSubmitTimer(null);
    }

    // Use the final transcript state after stopping
    const finalTranscript = input.trim(); // Use state 'input' populated by transcript useEffect
    if (finalTranscript) {
      // Submit after manual stop
      console.log("Submitting after manual stop...");
      // Small delay to ensure state updates
      setTimeout(() => handleSubmit(), 100);
    } else {
      // If nothing was transcribed, reset input
      setInput("");
      resetTranscript();
    }
    
    toast({
      title: "Voice Mode",
      description: "Voice mode deactivated.",
    });
  };

  const getRecognitionLanguage = () => {
    switch(language) {
      case 'hindi': return 'hi-IN';
      case 'punjabi': return 'pa-IN';
      default: return 'en-US';
    }
  };

  // Replace the speakText function with this updated version
  const speakText = async (text: string, language: Language) => {
    try {
      setIsSpeaking(true);
      
      // Get the audio buffer from ElevenLabs
      const audioBuffer = await elevenLabsService.textToSpeech({
        text,
        language
      });
      
      if (audioBuffer) {
        await elevenLabsService.playAudio(audioBuffer);
      }
    } catch (error) {
      console.error('Error in text-to-speech:', error);
      toast({
        title: "Speech Error",
        description: "Failed to play speech",
        variant: "destructive",
      });
    } finally {
      setIsSpeaking(false);
      
      // If in voice mode, restart listening after speaking
      if (voiceMode && !listening) {
        startSpeechRecognition(true);
      }
    }
  };

  // Preload voices
  useEffect(() => {
    if ("speechSynthesis" in window && window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = () => {
        console.log("Speech synthesis voices loaded.");
      };
    }
  }, []);

  const stopSpeaking = () => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      
      // If in voice mode, resume listening after stopping speech
      if (voiceMode && !listening) {
        startSpeechRecognition(true);
      }
    }
  };

  // Get title and description in the correct language
  const getBotTitle = () => {
    switch(language) {
      case 'hindi': return "कृषि मित्र";
      case 'punjabi': return "ਕ੍ਰਿਸ਼ੀ ਮਿੱਤਰ";
      default: return "Krishi Mitra";
    }
  };

  const getBotDescription = () => {
    switch(language) {
      case 'hindi': return "आपका कृषि सहायक (Gemini AI द्वारा संचालित)";
      case 'punjabi': return "ਤੁਹਾਡਾ ਖੇਤੀਬਾੜੀ ਸਹਾਇਕ (Gemini AI ਦੁਆਰਾ ਸੰਚਾਲਿਤ)";
      default: return "Your Agricultural Assistant (Powered by Gemini AI)";
    }
  };

  const getPlaceholder = () => {
    switch(language) {
      case 'hindi': return "अपना संदेश लिखें या बोलें...";
      case 'punjabi': return "ਆਪਣਾ ਸੁਨੇਹਾ ਲਿਖੋ ਜਾਂ ਬੋਲੋ...";
      default: return "Type or speak your message...";
    }
  };

  const getListeningText = () => {
    switch(language) {
      case 'hindi': return "सुन रहा हूँ...";
      case 'punjabi': return "ਸੁਣ ਰਿਹਾ ਹਾਂ...";
      default: return "Listening...";
    }
  };

  const getVoiceModeText = () => {
    switch(language) {
      case 'hindi': return voiceMode ? "वॉइस मोड चालू है" : "वॉइस मोड";
      case 'punjabi': return voiceMode ? "ਵੌਇਸ ਮੋਡ ਚਾਲੂ ਹੈ" : "ਵੌਇਸ ਮੋਡ";
      default: return voiceMode ? "Voice Mode Active" : "Voice Mode";
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg bg-[#138808] hover:bg-[#138808]/90 flex items-center justify-center transition-transform hover:scale-105"
            aria-label={getBotTitle()}
          >
            <Bot className="h-7 w-7 text-white" />
          </Button>
        </SheetTrigger>
        <SheetContent
          className="sm:max-w-md md:max-w-lg w-[90vw] bg-white border-l-4 border-[#138808]"
          side="right"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <SheetHeader className="border-b pb-4">
            <SheetTitle className="flex items-center gap-2 text-[#138808] text-xl">
              <Bot className="h-6 w-6" />
              {getBotTitle()}
              {voiceMode && (
                <span className="text-xs bg-[#138808] text-white px-2 py-1 rounded-full ml-2 flex items-center">
                  <Mic className="h-3 w-3 mr-1" />
                  {getVoiceModeText()}
                </span>
              )}
            </SheetTitle>
            <SheetDescription className="text-sm font-medium text-gray-600">
              {getBotDescription()}
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col h-[calc(100dvh-10rem)]">
            <ScrollArea className="flex-1 p-4" id="chat-scroll-area">
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg p-3 shadow-md ${
                        message.role === "user"
                          ? "bg-[#138808] text-white"
                          : "bg-gray-100 text-gray-800 border border-gray-200"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {message.role === "assistant" && (
                          <Bot className="h-5 w-5 mt-1 flex-shrink-0 text-[#138808]" aria-hidden="true" />
                        )}
                        <div className="flex-1">
                          {message.role === "assistant" ? (
                            <div className="text-sm prose prose-sm max-w-none">
                              <ReactMarkdown>{message.content}</ReactMarkdown>
                              {message.isTyping && (
                                <span className="inline-block animate-pulse">▋</span>
                              )}
                            </div>
                          ) : (
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          )}

                          {message.role === "assistant" && message.content && (
                            <div className="mt-2 flex justify-end">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 rounded-full hover:bg-gray-200"
                                onClick={() =>
                                  isSpeaking
                                    ? stopSpeaking()
                                    : speakText(message.content, language)
                                }
                                aria-label={isSpeaking ? "Stop speaking" : "Read message aloud"}
                              >
                                {isSpeaking ? (
                                  <VolumeX className="h-4 w-4 text-gray-600" />
                                ) : (
                                  <Volume2 className="h-4 w-4 text-[#138808]" />
                                )}
                              </Button>
                            </div>
                          )}
                        </div>
                        {message.role === "user" && (
                          <User className="h-5 w-5 mt-1 flex-shrink-0" aria-hidden="true" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-lg p-3 bg-gray-100 border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-2">
                        <Bot className="h-5 w-5 text-[#138808]" />
                        <div className="flex gap-1" aria-label="Loading response">
                          <span className="h-2 w-2 rounded-full bg-[#138808] animate-pulse"></span>
                          <span style={{animationDelay: '0.15s'}} className="h-2 w-2 rounded-full bg-[#138808] animate-pulse"></span>
                          <span style={{animationDelay: '0.3s'}} className="h-2 w-2 rounded-full bg-[#138808] animate-pulse"></span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <form
              onSubmit={handleSubmit}
              className="border-t p-4 flex items-center gap-2 bg-white"
            >
              {isListening ? (
                <div className="flex-1 flex items-center gap-2">
                  <Button
                    type="button"
                    size="icon"
                    onClick={stopSpeechRecognition}
                    className={`transition-colors flex-shrink-0 ${
                      voiceMode ? "bg-green-500 hover:bg-red-600" : "bg-red-500 hover:bg-red-600"
                    }`}
                    aria-label="Stop listening"
                  >
                    <Mic className="h-5 w-5 text-white animate-pulse" />
                  </Button>
                  <div className="flex-1 px-3 py-2 bg-gray-100 rounded-md text-sm text-gray-700 border border-gray-300 min-h-[40px] flex items-center">
                    <span className="italic">{transcript || getListeningText()}</span>
                  </div>
                </div>
              ) : (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => startSpeechRecognition()}
                    disabled={isLoading}
                    className={`border-[#138808] text-[#138808] hover:bg-[#138808]/10 flex-shrink-0 ${
                      voiceMode ? "ring-2 ring-green-500" : ""
                    }`}
                    aria-label="Start voice input"
                  >
                    <Mic className="h-5 w-5" />
                  </Button>

                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={getPlaceholder()}
                    className="flex-1 border-gray-300 focus-visible:ring-1 focus-visible:ring-[#138808] focus-visible:ring-offset-0"
                    disabled={isLoading}
                    aria-label="Type your message"
                  />
                </>
              )}

              <Button
                type="submit"
                size="icon"
                disabled={isLoading || (!isListening && !input.trim())}
                className="bg-[#138808] hover:bg-[#138808]/90 transition-colors flex-shrink-0 disabled:opacity-50"
                aria-label="Send message"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                ) : (
                  <Send className="h-5 w-5 text-white" />
                )}
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default KrishiMitra;