import { useRef, useState, useEffect } from 'react';
import { FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash } from 'react-icons/fa';
import { Logo } from '../logo/Logo';
import { VoiceSelector } from '../voice-selector/VoiceSelector';
import { useLiveAPIContext } from '../../contexts/LiveAPIContext';
import cn from 'classnames';

interface MobileStreamProps {
  onStreamStart?: (stream: MediaStream) => void;
  onStreamEnd?: () => void;
}

export const MobileStream: React.FC<MobileStreamProps> = ({ onStreamStart, onStreamEnd }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [hasAudio, setHasAudio] = useState(true);
  const [hasVideo, setHasVideo] = useState(true);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [selectedVoice, setSelectedVoice] = useState("Kore");
  const { setConfig } = useLiveAPIContext();

  const startStream = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      
      setStream(mediaStream);
      setIsStreaming(true);
      onStreamStart?.(mediaStream);
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
      onStreamEnd?.();
    }
  };

  const toggleAudio = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setHasAudio(audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setHasVideo(videoTrack.enabled);
      }
    }
  };

  useEffect(() => {
    startStream();
    return () => {
      stopStream();
    };
  }, []);

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

  return (
    <div className="mobile-streaming-interface">
      <div className="stream-header">
        <Logo />
        <VoiceSelector value={selectedVoice} onChange={setSelectedVoice} />
      </div>
      
      <div className="stream-content">
        <video 
          ref={videoRef}
          autoPlay
          playsInline
          muted
        />
        
        {isStreaming && (
          <div className="stream-status">
            Stream is live
          </div>
        )}
      </div>

      <div className="stream-controls">
        <button 
          onClick={toggleAudio}
          className={cn({ disabled: !hasAudio })}
        >
          {hasAudio ? <FaMicrophone /> : <FaMicrophoneSlash />}
        </button>
        
        <button 
          onClick={toggleVideo}
          className={cn({ disabled: !hasVideo })}
        >
          {hasVideo ? <FaVideo /> : <FaVideoSlash />}
        </button>
      </div>
    </div>
  );
};
