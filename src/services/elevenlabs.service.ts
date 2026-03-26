import { toast } from "@/hooks/use-toast";
import { Language } from "@/contexts/LanguageContext";

const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;

// Voice IDs for different languages
const VOICE_IDS = {
  english: import.meta.env.VITE_ELEVENLABS_VOICE_ID_EN || 'pNInz6obpgDQGcFmaJgB',
  hindi: import.meta.env.VITE_ELEVENLABS_VOICE_ID_HI,
  punjabi: import.meta.env.VITE_ELEVENLABS_VOICE_ID_PA,
} as const;

interface TextToSpeechOptions {
  text: string;
  language: Language;
  modelId?: string;
}

class ElevenLabsService {
  private apiKey: string;
  private baseUrl = 'https://api.elevenlabs.io/v1';

  constructor(apiKey: string = ELEVENLABS_API_KEY) {
    this.apiKey = apiKey;
  }

  async textToSpeech({ 
    text, 
    language,
    modelId = 'eleven_multilingual_v2'
  }: TextToSpeechOptions): Promise<ArrayBuffer | null> {
    try {
      if (!this.apiKey) {
        throw new Error('ElevenLabs API key is not configured');
      }

      // Get the appropriate voice ID for the language
      const voiceId = VOICE_IDS[language] || VOICE_IDS.english;

      const response = await fetch(
        `${this.baseUrl}/text-to-speech/${voiceId}/stream`,
        {
          method: 'POST',
          headers: {
            'Accept': 'audio/mpeg',
            'Content-Type': 'application/json',
            'xi-api-key': this.apiKey,
          },
          body: JSON.stringify({
            text,
            model_id: modelId,
            voice_settings: {
              stability: 0.5,
              similarity_boost: 0.75,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.statusText}`);
      }

      return await response.arrayBuffer();
    } catch (error) {
      console.error('Error in text-to-speech:', error);
      toast({
        title: "Text-to-Speech Error",
        description: error instanceof Error ? error.message : "Failed to convert text to speech",
        variant: "destructive",
      });
      return null;
    }
  }

  async playAudio(audioBuffer: ArrayBuffer): Promise<void> {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const audioSource = audioContext.createBufferSource();
      
      const audioData = await audioContext.decodeAudioData(audioBuffer);
      audioSource.buffer = audioData;
      audioSource.connect(audioContext.destination);
      audioSource.start(0);

      return new Promise((resolve) => {
        audioSource.onended = () => {
          audioContext.close();
          resolve();
        };
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      toast({
        title: "Audio Playback Error",
        description: "Failed to play the generated speech",
        variant: "destructive",
      });
    }
  }
}

export const elevenLabsService = new ElevenLabsService(); 