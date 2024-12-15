import React, { useState, useRef, useEffect } from 'react';
import { useLoggerStore } from '../../lib/store-logger';
import { useLiveAPIContext } from '../../contexts/LiveAPIContext';
import Logger from '../logger/Logger';
import './mobile-chat.scss';

export const MobileChat: React.FC = () => {
  const [textInput, setTextInput] = useState("");
  const { client } = useLiveAPIContext();
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const { logs } = useLoggerStore();

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const handleSubmit = () => {
    if (textInput.trim()) {
      client.send([{ text: textInput }]);
      setTextInput("");
    }
  };

  return (
    <div className="mobile-chat">
      <div className="chat-messages" ref={chatContainerRef}>
        <Logger filter="conversations" />
      </div>
      
      <div className="chat-input">
        <textarea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Type a message..."
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
        />
        <button 
          className="send-button"
          onClick={handleSubmit}
          disabled={!textInput.trim()}
        >
          Send
        </button>
      </div>
    </div>
  );
};
