import React, { useState, useEffect, useRef } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Mic, MicOff, X, BotMessageSquare, Send } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatRef = useRef(null);

  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    if (!browserSupportsSpeechRecognition) {
      alert('Your browser does not support speech recognition.');
    }
  }, [browserSupportsSpeechRecognition]);

  useEffect(() => {
    if (transcript && listening === false) {
      handleSend(transcript);
    }
  }, [listening]);

  const handleToggleChat = () => setIsOpen(!isOpen);

  const handleSend = async (text) => {
    if (!text.trim()) return;
    const userMessage = { sender: 'user', text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    resetTranscript();

    try {
      const genAI = new GoogleGenerativeAI(process.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const result = await model.generateContent(text);
      const response = await result.response;
      const responseText = response.text();

      const botMessage = { sender: 'bot', text: responseText };
      setMessages(prev => [...prev, botMessage]);
      handleSpeak(responseText);
    } catch (err) {
      const errorMessage = { sender: 'bot', text: 'Sorry, something went wrong.' };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleSpeak = (text) => {
    if ('speechSynthesis' in window) {
      const speech = new SpeechSynthesisUtterance(text);
      window.speechSynthesis.speak(speech);
      setIsSpeaking(true);
      speech.onend = () => setIsSpeaking(false);
    }
  };

  const handleVoiceInput = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      SpeechRecognition.startListening({ continuous: false });
    }
  };

  return (
    <div>
      {/* Chat Icon */}
      <button
        onClick={handleToggleChat}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg focus:outline-none"
      >
        <BotMessageSquare className="w-6 h-6" />
      </button>

      {/* Chat Popup */}
      {isOpen && (
        <div className="fixed bottom-20 right-6 w-80 bg-white shadow-2xl rounded-2xl z-50 flex flex-col overflow-hidden border border-gray-200">
          <div className="flex items-center justify-between p-4 bg-blue-600 text-white">
            <span className="font-semibold">AI Assistant</span>
            <X className="cursor-pointer" onClick={handleToggleChat} />
          </div>

          <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[80%] p-2 rounded-lg text-sm ${
                  msg.sender === 'user'
                    ? 'bg-blue-500 text-white self-end ml-auto'
                    : 'bg-gray-200 text-black'
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          <div className="flex items-center p-3 gap-2 border-t">
            <button
              onClick={handleVoiceInput}
              className="text-blue-600 hover:text-blue-800"
            >
              {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(input)}
              placeholder="Type a message..."
              className="flex-1 p-2 border rounded-lg text-sm focus:outline-none"
            />
            <button
              onClick={() => handleSend(input)}
              className="text-blue-600 hover:text-blue-800"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
