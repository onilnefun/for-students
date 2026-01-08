import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Audio Contexts
let inputAudioContext: AudioContext | null = null;
let outputAudioContext: AudioContext | null = null;
let inputNode: MediaStreamAudioSourceNode | null = null;
let scriptProcessor: ScriptProcessorNode | null = null;
let outputNode: GainNode | null = null;
let stream: MediaStream | null = null;
let nextStartTime = 0;
let sources = new Set<AudioBufferSourceNode>();
let activeSessionPromise: Promise<any> | null = null;
let closeSessionCallback: (() => void) | null = null;

// Helpers
function createBlob(data: Float32Array): { data: string; mimeType: string } {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  
  let binary = '';
  const bytes = new Uint8Array(int16.buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);

  return {
    data: base64,
    mimeType: 'audio/pcm;rate=16000',
  };
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const startLiveSession = async (
    onClose: () => void, 
    onError: (e: any) => void
) => {
    try {
        // 1. Get Stream FIRST to confirm device availability
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
             throw new Error("Media API not supported in this browser");
        }
        
        try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (err) {
            console.error("Error accessing microphone:", err);
            throw new Error("Requested device not found. Please ensure a microphone is connected and allowed.");
        }

        // 2. Initialize Audio Contexts
        inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        
        outputNode = outputAudioContext.createGain();
        outputNode.connect(outputAudioContext.destination);

        const config = {
            model: 'gemini-2.5-flash-native-audio-preview-12-2025',
            config: {
                responseModalities: [Modality.AUDIO],
                systemInstruction: "You are GyanAI, a helpful, friendly and concise AI tutor. Keep your answers brief and conversational.",
            },
        };

        const sessionPromise = ai.live.connect({
            ...config,
            callbacks: {
                onopen: () => {
                    console.log('Live Session Opened');
                    if (!inputAudioContext || !stream) return;
                    
                    inputNode = inputAudioContext.createMediaStreamSource(stream);
                    scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
                    
                    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const pcmBlob = createBlob(inputData);
                        
                        // Check if sessionPromise is still the active one to prevent stale closures
                        if (activeSessionPromise === sessionPromise) {
                             sessionPromise.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            });
                        }
                    };

                    inputNode.connect(scriptProcessor);
                    scriptProcessor.connect(inputAudioContext.destination);
                },
                onmessage: async (message: LiveServerMessage) => {
                    const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                    
                    if (base64Audio && outputAudioContext && outputNode) {
                        nextStartTime = Math.max(nextStartTime, outputAudioContext.currentTime);
                        
                        const audioBuffer = await decodeAudioData(
                            decode(base64Audio),
                            outputAudioContext,
                            24000,
                            1
                        );
                        
                        const source = outputAudioContext.createBufferSource();
                        source.buffer = audioBuffer;
                        source.connect(outputNode);
                        
                        source.addEventListener('ended', () => {
                            sources.delete(source);
                        });

                        source.start(nextStartTime);
                        nextStartTime += audioBuffer.duration;
                        sources.add(source);
                    }
                    
                    const interrupted = message.serverContent?.interrupted;
                    if (interrupted) {
                        for (const source of sources.values()) {
                            source.stop();
                            sources.delete(source);
                        }
                        nextStartTime = 0;
                    }
                },
                onclose: () => {
                    console.log('Live Session Closed');
                    cleanup();
                    onClose();
                },
                onerror: (e) => {
                    console.error('Live Session Error', e);
                    cleanup();
                    onError(e);
                }
            }
        });

        activeSessionPromise = sessionPromise;
        closeSessionCallback = () => {
             sessionPromise.then(session => session.close());
        };

    } catch (error) {
        cleanup();
        throw error;
    }
};

export const stopLiveSession = () => {
    if (closeSessionCallback) {
        closeSessionCallback();
        closeSessionCallback = null;
    } else {
        cleanup();
    }
    activeSessionPromise = null;
};

function cleanup() {
    if (scriptProcessor && inputNode) {
        inputNode.disconnect();
        scriptProcessor.disconnect();
    }
    
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }

    if (inputAudioContext) {
        inputAudioContext.close();
        inputAudioContext = null;
    }
    if (outputAudioContext) {
        outputAudioContext.close();
        outputAudioContext = null;
    }

    sources.forEach(source => source.stop());
    sources.clear();
    nextStartTime = 0;
}