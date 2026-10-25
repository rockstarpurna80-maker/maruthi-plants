import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Sparkles, 
  MapPin, 
  Video, 
  MessageSquare, 
  Bot, 
  User as UserIcon, 
  Loader2, 
  ExternalLink, 
  Upload, 
  Play, 
  Download, 
  MessageCircle,
  RefreshCw
} from 'lucide-react';
import { NURSERY_PHONE } from '../utils/whatsapp';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface GroundingLink {
  uri: string;
  title: string;
}

interface GeminiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'chat' | 'maps' | 'video';
}

export const GeminiAssistantModal: React.FC<GeminiAssistantModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'chat',
}) => {
  const [activeTab, setActiveTab] = useState<'chat' | 'maps' | 'video'>(initialTab);

  // Chat State
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: 'Namaste! 🌿 I am Maruthi Haritha, your AI horticultural advisor from Maruthi Nursery in Malladi Village, Amaravathi Road, Guntur. How can I help you today with fruit saplings, soil care, terrace gardening, or pest treatment?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [selectedModel, setSelectedModel] = useState<'gemini-3.8-flash' | 'gemini-3.1-flash-lite' | 'gemini-4-argon'>('gemini-3.8-flash');
  const [isSendingChat, setIsSendingChat] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Audio Recording & Transcription State (gemini-3.5-transcribe)
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Maps Grounding State (gemini-3.8-flash with googleMaps)
  const [mapsQuery, setMapsQuery] = useState('How to reach Maruthi Nursery in Malladi Village from Guntur city along Amaravathi Road?');
  const [mapsAnswer, setMapsAnswer] = useState<string | null>(null);
  const [mapsGroundingLinks, setMapsGroundingLinks] = useState<GroundingLink[]>([]);
  const [isQueryingMaps, setIsQueryingMaps] = useState(false);

  // Video Animation State (gemini-omni-1.1-flash)
  const [videoImageBase64, setVideoImageBase64] = useState<string | null>(null);
  const [videoImageMime, setVideoImageMime] = useState('image/jpeg');
  const [videoPrompt, setVideoPrompt] = useState('A gentle tropical breeze sways through the healthy green leaves while warm morning sunlight filters through.');
  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSendingChat]);

  if (!isOpen) return null;

  // --- 1. Send Chat Message ---
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || chatInput).trim();
    if (!text || isSendingChat) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setChatInput('');
    setIsSendingChat(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.text }],
          })),
          model: selectedModel,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get answer from Gemini.');
      }

      const botMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        text: data.text || 'I could not generate a response. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errMsg: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        text: `Error: ${err.message || 'Unable to connect to Gemini API. Ensure server environment is active.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsSendingChat(false);
    }
  };

  // --- 2. Microphone Audio Recording & Transcription (gemini-3.5-transcribe) ---
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((track) => track.stop());

        // Convert blob to base64
        setIsTranscribing(true);
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          try {
            const base64Data = (reader.result as string).split(',')[1];
            const res = await fetch('/api/gemini/transcribe', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                audioBase64: base64Data,
                mimeType: 'audio/webm',
              }),
            });
            const data = await res.json();
            if (data.text) {
              setChatInput((prev) => (prev ? `${prev} ${data.text}` : data.text));
            }
          } catch (err) {
            console.error('Transcription API error:', err);
          } finally {
            setIsTranscribing(false);
          }
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Could not access microphone:', err);
      alert('Microphone access was denied or is unavailable.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // --- 3. Google Maps Grounding Query (gemini-3.8-flash with googleMaps) ---
  const handleMapsQuery = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!mapsQuery.trim() || isQueryingMaps) return;

    setIsQueryingMaps(true);
    setMapsAnswer(null);
    setMapsGroundingLinks([]);

    try {
      const res = await fetch('/api/gemini/maps-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: mapsQuery,
          latitude: 16.38,
          longitude: 80.37,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Maps grounding query failed.');

      setMapsAnswer(data.text);

      // Extract Maps Grounding URLs
      const extractedLinks: GroundingLink[] = [];
      if (Array.isArray(data.groundingChunks)) {
        data.groundingChunks.forEach((chunk: any) => {
          if (chunk.maps?.uri) {
            extractedLinks.push({
              uri: chunk.maps.uri,
              title: chunk.maps.title || 'Google Maps Location',
            });
          }
          if (Array.isArray(chunk.maps?.placeAnswerSources?.reviewSnippets)) {
            chunk.maps.placeAnswerSources.reviewSnippets.forEach((rev: any) => {
              if (rev.uri) {
                extractedLinks.push({
                  uri: rev.uri,
                  title: rev.title || 'Google Maps Review / Place Source',
                });
              }
            });
          }
        });
      }
      setMapsGroundingLinks(extractedLinks);
    } catch (err: any) {
      console.error('Maps grounding error:', err);
      setMapsAnswer(`Error retrieving Maps data: ${err.message}`);
    } finally {
      setIsQueryingMaps(false);
    }
  };

  // --- 4. Animate Image into Video (gemini-omni-1.1-flash via Interactions API) ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoImageMime(file.type || 'image/jpeg');
    const reader = new FileReader();
    reader.onload = () => {
      const b64 = (reader.result as string).split(',')[1];
      setVideoImageBase64(b64);
      setGeneratedVideoUrl(null);
      setVideoError(null);
    };
    reader.readAsDataURL(file);
  };

  const selectSampleImageForAnimation = async (url: string) => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      setVideoImageMime(blob.type);
      const reader = new FileReader();
      reader.onload = () => {
        const b64 = (reader.result as string).split(',')[1];
        setVideoImageBase64(b64);
        setGeneratedVideoUrl(null);
        setVideoError(null);
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error('Failed to load sample image:', err);
    }
  };

  const handleGenerateVideo = async () => {
    if (!videoImageBase64 || isGeneratingVideo) return;

    setIsGeneratingVideo(true);
    setVideoError(null);
    setGeneratedVideoUrl(null);

    try {
      const res = await fetch('/api/gemini/animate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: videoImageBase64,
          mimeType: videoImageMime,
          prompt: videoPrompt,
          aspectRatio: videoAspectRatio,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Video generation failed.');

      if (data.videoBase64) {
        const videoDataUrl = `data:${data.mimeType || 'video/mp4'};base64,${data.videoBase64}`;
        setGeneratedVideoUrl(videoDataUrl);
      } else {
        throw new Error('No video data returned.');
      }
    } catch (err: any) {
      console.error('Video generation error:', err);
      setVideoError(err.message || 'Video generation encountered an error.');
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Modal Dialog */}
      <div 
        className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-stone-200 flex flex-col h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-4 sm:p-5 bg-stone-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif font-bold text-base sm:text-lg">
                  Maruthi AI Horticultural Suite
                </h3>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                  Google Gemini Powered
                </span>
              </div>
              <p className="text-xs text-stone-400">
                Malladi Village • Amaravathi Road, Guntur District
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="px-6 border-b border-stone-200 bg-stone-50 flex items-center gap-2 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('chat')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'chat'
                ? 'border-emerald-600 text-emerald-900 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>AI Plant Chatbot</span>
          </button>

          <button
            onClick={() => setActiveTab('maps')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'maps'
                ? 'border-emerald-600 text-emerald-900 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Google Maps Grounding</span>
          </button>

          <button
            onClick={() => setActiveTab('video')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'video'
                ? 'border-emerald-600 text-emerald-900 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Video className="w-4 h-4 text-emerald-600" />
            <span>Animate Photo into Video (Omni Flash)</span>
          </button>
        </div>

        {/* Tab 1: AI Chatbot */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col justify-between overflow-hidden bg-stone-50/50">
            
            {/* Model Selector Bar */}
            <div className="px-6 py-2.5 bg-stone-100 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-stone-500 font-semibold">Gemini Model:</span>
                <div className="flex items-center bg-white rounded-lg p-0.5 border border-stone-200">
                  <button
                    onClick={() => setSelectedModel('gemini-3.8-flash')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                      selectedModel === 'gemini-3.8-flash'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    gemini-3.8-flash (General)
                  </button>
                  <button
                    onClick={() => setSelectedModel('gemini-3.1-flash-lite')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                      selectedModel === 'gemini-3.1-flash-lite'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    gemini-3.1-flash-lite (Fast)
                  </button>
                  <button
                    onClick={() => setSelectedModel('gemini-4-argon')}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                      selectedModel === 'gemini-4-argon'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    gemini-4-argon (Complex)
                  </button>
                </div>
              </div>

              <div className="text-[11px] text-stone-500">
                Role: <strong>Maruthi Haritha</strong> (Horticulturist)
              </div>
            </div>

            {/* Scrollable Message Thread */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-3 max-w-[85%] ${
                    m.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      m.role === 'user'
                        ? 'bg-stone-900 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {m.role === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-stone-900 text-white rounded-tr-none'
                        : 'bg-white text-stone-800 border border-stone-200 shadow-xs rounded-tl-none'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{m.text}</p>
                    <span className={`block text-[10px] mt-1.5 ${m.role === 'user' ? 'text-stone-400' : 'text-stone-400'}`}>
                      {m.timestamp}
                    </span>
                  </div>
                </div>
              ))}

              {isSendingChat && (
                <div className="flex gap-3 max-w-[80%] mr-auto items-center">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-3 bg-white rounded-2xl border border-stone-200 text-xs text-stone-600 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                    <span>Maruthi Haritha is analyzing your gardening question...</span>
                  </div>
                </div>
              )}

              <div ref={chatBottomRef} />
            </div>

            {/* Input Bar with Audio Mic Transcription */}
            <div className="p-4 bg-white border-t border-stone-200 space-y-2">
              {isTranscribing && (
                <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Transcribing speech using <strong>gemini-3.5-transcribe</strong>...</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isRecording
                      ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                      : 'border-stone-200 text-stone-600 hover:border-emerald-600 hover:text-emerald-700'
                  }`}
                  title={isRecording ? 'Click to stop & transcribe' : 'Speak your question (gemini-3.5-transcribe)'}
                >
                  {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>

                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={
                    isRecording
                      ? 'Listening to your microphone...'
                      : 'Ask about mango grafting, Guntur black soil drainage, jasmine blooms, or sapling prices...'
                  }
                  className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />

                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!chatInput.trim() || isSendingChat}
                  className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden sm:inline">Send</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-stone-400">
                <span>Microphone speech transcribed via <code>gemini-3.5-transcribe</code>.</span>
                <a
                  href={`https://wa.me/${NURSERY_PHONE}?text=Hello%20Maruthi%20Nursery,%20I%20have%20a%20gardening%20question.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-700 hover:underline font-semibold"
                >
                  Or WhatsApp nursery directly
                </a>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Google Maps Grounding */}
        {activeTab === 'maps' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="space-y-1">
              <h4 className="font-serif font-bold text-lg text-stone-900">
                Google Maps Grounding with Gemini 3.8 Flash
              </h4>
              <p className="text-xs text-stone-600">
                Ask questions about directions to Malladi Village, landmarks on Amaravathi Road, nearby towns (Guntur, Amaravathi, Vijayawada), or nursery logistics. The model searches real Google Maps place data and returns verified map URLs.
              </p>
            </div>

            <form onSubmit={handleMapsQuery} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={mapsQuery}
                  onChange={(e) => setMapsQuery(e.target.value)}
                  placeholder="e.g. Best driving route to Malladi Village Amaravathi Road from Guntur railway station"
                  className="flex-1 px-4 py-2.5 text-xs sm:text-sm rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
                <button
                  type="submit"
                  disabled={isQueryingMaps}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer"
                >
                  {isQueryingMaps ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                  <span>{isQueryingMaps ? 'Grounding...' : 'Query Maps'}</span>
                </button>
              </div>
            </form>

            {/* Answer Display */}
            {mapsAnswer && (
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-4">
                <div>
                  <h5 className="font-bold text-stone-900 text-xs uppercase tracking-wider mb-1">
                    Google Maps Grounded Response:
                  </h5>
                  <div className="text-xs sm:text-sm text-stone-800 leading-relaxed whitespace-pre-wrap">
                    {mapsAnswer}
                  </div>
                </div>

                {/* Grounding URLs extracted from groundingChunks */}
                {mapsGroundingLinks.length > 0 && (
                  <div className="pt-3 border-t border-stone-200 space-y-2">
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">
                      Google Maps Sources & Places (from Grounding Metadata):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {mapsGroundingLinks.map((link, idx) => (
                        <a
                          key={idx}
                          href={link.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-white hover:bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                        >
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{link.title}</span>
                          <ExternalLink className="w-3 h-3 text-stone-400" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Animate Photo into Video (gemini-omni-1.1-flash) */}
        {activeTab === 'video' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="space-y-1">
              <h4 className="font-serif font-bold text-lg text-stone-900">
                Animate Plant Photos into Video (Gemini Omni Flash)
              </h4>
              <p className="text-xs text-stone-600">
                Upload a plant photo (or select a nursery sample) to generate an organic animated video using model <code>gemini-omni-1.1-flash</code> via the Gemini Interactions API.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              
              {/* Left Column: Image Selection & Config */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    1. Choose Starting Photo
                  </label>
                  
                  {videoImageBase64 ? (
                    <div className="relative aspect-video rounded-2xl overflow-hidden border border-stone-300 bg-stone-100">
                      <img
                        src={`data:${videoImageMime};base64,${videoImageBase64}`}
                        alt="Selected plant frame"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => setVideoImageBase64(null)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-stone-300 rounded-2xl p-6 text-center hover:border-emerald-600 transition-colors">
                      <Upload className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                      <p className="text-xs font-semibold text-stone-800">
                        Upload plant photo from device
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="mt-2 text-xs text-stone-500"
                      />
                    </div>
                  )}

                  {/* Sample Nursery Photos */}
                  <div className="mt-3">
                    <span className="text-[11px] text-stone-500 block mb-1">Or choose a Maruthi Nursery plant:</span>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => selectSampleImageForAnimation('https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80')}
                        className="px-2.5 py-1 text-[11px] rounded-lg bg-stone-100 hover:bg-emerald-50 text-stone-800 border border-stone-200"
                      >
                        Mango Sapling
                      </button>
                      <button
                        type="button"
                        onClick={() => selectSampleImageForAnimation('https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=600&q=80')}
                        className="px-2.5 py-1 text-[11px] rounded-lg bg-stone-100 hover:bg-emerald-50 text-stone-800 border border-stone-200"
                      >
                        Jasmine Blooms
                      </button>
                      <button
                        type="button"
                        onClick={() => selectSampleImageForAnimation('https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=600&q=80')}
                        className="px-2.5 py-1 text-[11px] rounded-lg bg-stone-100 hover:bg-emerald-50 text-stone-800 border border-stone-200"
                      >
                        Adenium Bonsai
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    2. Motion Prompt
                  </label>
                  <textarea
                    rows={2}
                    value={videoPrompt}
                    onChange={(e) => setVideoPrompt(e.target.value)}
                    placeholder="Describe how the plant moves (e.g. gentle breeze, petals swaying, sunbeams passing)..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                    3. Video Aspect Ratio
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setVideoAspectRatio('16:9')}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold ${
                        videoAspectRatio === '16:9'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950'
                          : 'border-stone-200 text-stone-600'
                      }`}
                    >
                      16:9 Landscape (Desktop/Widescreen)
                    </button>
                    <button
                      type="button"
                      onClick={() => setVideoAspectRatio('9:16')}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold ${
                        videoAspectRatio === '9:16'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-950'
                          : 'border-stone-200 text-stone-600'
                      }`}
                    >
                      9:16 Portrait (Mobile/Reels)
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateVideo}
                  disabled={!videoImageBase64 || isGeneratingVideo}
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-300 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  {isGeneratingVideo ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating Video via Omni Flash (takes ~30-60s)...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Animate Photo into Video</span>
                    </>
                  )}
                </button>
              </div>

              {/* Right Column: Video Output */}
              <div className="p-5 rounded-2xl bg-stone-900 text-white min-h-[300px] flex flex-col justify-between">
                <div>
                  <h5 className="font-bold text-xs uppercase tracking-wider text-stone-400 mb-2">
                    Generated Video Result (gemini-omni-1.1-flash)
                  </h5>

                  {isGeneratingVideo && (
                    <div className="py-16 text-center space-y-3">
                      <Loader2 className="w-10 h-10 animate-spin text-emerald-400 mx-auto" />
                      <p className="text-sm font-semibold text-stone-200">
                        Synthesizing Motion Frames...
                      </p>
                      <p className="text-xs text-stone-400 max-w-xs mx-auto">
                        Calling the Gemini Interactions API with model <code>gemini-omni-1.1-flash</code>. Please wait while video is compiled.
                      </p>
                    </div>
                  )}

                  {videoError && (
                    <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs">
                      <strong>Generation Error:</strong> {videoError}
                    </div>
                  )}

                  {generatedVideoUrl && (
                    <div className="space-y-3">
                      <div className="rounded-xl overflow-hidden bg-black border border-stone-800">
                        <video
                          src={generatedVideoUrl}
                          controls
                          autoPlay
                          loop
                          className="w-full max-h-[320px] mx-auto object-contain"
                        />
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={generatedVideoUrl}
                          download="maruthi-nursery-plant-animation.mp4"
                          className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                        >
                          <Download className="w-4 h-4" />
                          <span>Download MP4</span>
                        </a>
                      </div>
                    </div>
                  )}

                  {!isGeneratingVideo && !generatedVideoUrl && !videoError && (
                    <div className="py-20 text-center text-stone-500 text-xs">
                      Upload or select a photo on the left and click "Animate Photo into Video" to see the output here.
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-stone-800 text-[10px] text-stone-500 flex justify-between">
                  <span>Aspect: {videoAspectRatio} • 720p Resolution</span>
                  <span>Model: gemini-omni-1.1-flash</span>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
};
