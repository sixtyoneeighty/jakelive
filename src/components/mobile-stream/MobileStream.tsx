import { useRef, useState, useEffect } from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash } from 'react-icons/fa';
import { Logo } from '../logo/Logo';
import { VoiceSelector } from '../voice-selector/VoiceSelector';
import { MobileChat } from '../mobile-chat/MobileChat';
import { useLiveAPIContext } from '../../contexts/LiveAPIContext';
import cn from 'classnames';

interface MobileStreamProps {
  onStreamStart: (stream: MediaStream) => void;
  onStreamEnd: () => void;
}

export const MobileStream: React.FC<MobileStreamProps> = ({ onStreamStart, onStreamEnd }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const [hasVideo, setHasVideo] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [selectedVoice, setSelectedVoice] = useState("Kore");
  const { setConfig, client } = useLiveAPIContext();

  useEffect(() => {
    setConfig({
      model: "models/gemini-2.0-flash-exp",
      generationConfig: {
        responseModalities: "audio",
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: selectedVoice } },
        },
      },
      systemInstruction: {
        parts: [
          {
            text: 'act as if you\'ve been the users best friend their entire life, relaxed and casual tone. Most times user just wants to chat, if they need something, they\'ll ask. Talk movies, music, and about good times. Be funny, sarcastic, outgoing, and have fun. If you see a chihuahua, thats Todd, he sucks and dont let him forget it',
          },
        ],
      },
    });
  }, [setConfig, selectedVoice]);

  const startStream = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: hasVideo,
        audio: hasAudio,
      });

      if (videoRef.current && hasVideo) {
        videoRef.current.srcObject = mediaStream;
      }

      // Set up audio handling if enabled
      if (hasAudio) {
        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(mediaStream);
        const processor = audioContext.createScriptProcessor(1024, 1, 1);

        source.connect(processor);
        processor.connect(audioContext.destination);

        processor.onaudioprocess = (e) => {
          const inputData = e.inputBuffer.getChannelData(0);
          // Send audio data to the model
          if (isStreaming) {
            client.send([
              {
                inlineData: {
                  mimeType: "audio/wav",
                  data: Array.from(inputData),
                },
              },
            ]);
          }
        };
      }

      setStream(mediaStream);
      setIsStreaming(true);
      onStreamStart(mediaStream);
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      setStream(null);
      setIsStreaming(false);
      onStreamEnd();
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="mobile-streaming-interface">
      <div className="stream-header">
        <Logo />
        <VoiceSelector value={selectedVoice} onChange={setSelectedVoice} />
      </div>
      
      <div className={cn("stream-content", { active: isStreaming && hasVideo })}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={cn("video-preview", { active: isStreaming && hasVideo })}
        />

        <div className="controls">
          <button
            className={cn("control-button", { active: hasAudio })}
            onClick={() => {
              if (isStreaming) {
                stopStream();
              }
              setHasAudio(!hasAudio);
            }}
          >
            {hasAudio ? <FaMicrophone /> : <FaMicrophoneSlash />}
          </button>
          <button
            className={cn("control-button", { active: hasVideo })}
            onClick={() => {
              if (isStreaming) {
                stopStream();
              }
              setHasVideo(!hasVideo);
            }}
          >
            {hasVideo ? <FaVideo /> : <FaVideoSlash />}
          </button>
          <button
            className={cn("stream-button", { active: isStreaming })}
            onClick={isStreaming ? stopStream : startStream}
            disabled={!hasAudio && !hasVideo}
          >
            {isStreaming ? "Stop" : "Start"}
          </button>
        </div>
      </div>

      <div className="chat-container">
        <MobileChat />
      </div>
    </div>
  );
};
