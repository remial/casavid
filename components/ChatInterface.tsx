"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Send, MessageCircle, Loader2 } from "lucide-react";

function TypingDots() {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-gray-500">Typing</span>
      <span className="flex gap-1 items-center">
        <span 
          className="w-2 h-2 bg-blue-400 rounded-full"
          style={{ 
            animation: "pulse-dot 1.4s ease-in-out infinite",
            animationDelay: "0ms"
          }} 
        />
        <span 
          className="w-2 h-2 bg-blue-400 rounded-full"
          style={{ 
            animation: "pulse-dot 1.4s ease-in-out infinite",
            animationDelay: "200ms"
          }} 
        />
        <span 
          className="w-2 h-2 bg-blue-400 rounded-full"
          style={{ 
            animation: "pulse-dot 1.4s ease-in-out infinite",
            animationDelay: "400ms"
          }} 
        />
      </span>
      <style jsx>{`
        @keyframes pulse-dot {
          0%, 80%, 100% {
            opacity: 0.3;
            transform: scale(0.8);
          }
          40% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
    </span>
  );
}

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds

function parseLinks(text: string): React.ReactNode[] {
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    
    const [, linkText, url] = match;
    parts.push(
      <a
        key={match.index}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 underline font-medium"
      >
        {linkText}
      </a>
    );
    
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

function formatMessageContent(content: string): React.ReactNode {
  const lines = content.split("\n");
  
  return lines.map((line, index) => (
    <span key={index}>
      {parseLinks(line)}
      {index < lines.length - 1 && <br />}
    </span>
  ));
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionStart] = useState<string>(new Date().toISOString());
  const [emailSent, setEmailSent] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesRef = useRef<Message[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const sendEmailLog = useCallback(async () => {
    const currentMessages = messagesRef.current;
    if (currentMessages.length === 0 || emailSent) return;

    try {
      const response = await fetch("/api/contact/send-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: currentMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp,
          })),
          sessionStart,
        }),
      });

      if (response.ok) {
        setEmailSent(true);
        console.log("Chat log email sent successfully");
      }
    } catch (error) {
      console.error("Failed to send chat log email:", error);
    }
  }, [sessionStart, emailSent]);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    if (messagesRef.current.length > 0 && !emailSent) {
      inactivityTimerRef.current = setTimeout(() => {
        sendEmailLog();
      }, INACTIVITY_TIMEOUT);
    }
  }, [emailSent, sendEmailLog]);

  useEffect(() => {
    resetInactivityTimer();

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [messages.length, resetInactivityTimer]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      const currentMessages = messagesRef.current;
      if (currentMessages.length > 0 && !emailSent) {
        const data = JSON.stringify({
          messages: currentMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp,
          })),
          sessionStart,
        });
        const blob = new Blob([data], { type: "application/json" });
        navigator.sendBeacon("/api/contact/send-log", blob);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [sessionStart, emailSent]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const assistantMessage: Message = {
      role: "assistant",
      content: "",
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const response = await fetch("/api/contact/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();
      let fullContent = "";

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          // Final decode to flush any remaining bytes
          const remaining = decoder.decode();
          if (remaining) {
            fullContent += remaining;
            setMessages((prev) => {
              const newMessages = [...prev];
              const lastMessage = newMessages[newMessages.length - 1];
              if (lastMessage.role === "assistant") {
                lastMessage.content = fullContent;
              }
              return newMessages;
            });
          }
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        fullContent += chunk;

        setMessages((prev) => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage.role === "assistant") {
            lastMessage.content = fullContent;
          }
          return newMessages;
        });
      }
      
      console.log("[Chat UI] Stream complete, total content length:", fullContent.length);
    } catch (error) {
      console.error("[Chat UI] Error:", error);
      setMessages((prev) => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.role === "assistant") {
          lastMessage.content =
            "I apologize, but I encountered an error. Please try again in a moment.";
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[600px] max-w-3xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-green-600 text-white px-6 py-4 flex items-center gap-3">
        <MessageCircle className="w-6 h-6" />
        <div>
          <h2 className="font-bold text-lg">CasaVid Support</h2>
          <p className="text-green-100 text-sm">
            We typically respond instantly
          </p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">Welcome to CasaVid Support!</p>
            <p className="text-sm mt-2">
              Ask me anything about creating property videos, credits, or
              features.
            </p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === "user"
                  ? "bg-blue-600 text-white rounded-br-md"
                  : "bg-white text-gray-800 border border-gray-200 rounded-bl-md shadow-sm"
              }`}
            >
              <div className="whitespace-pre-wrap break-words">
                {message.role === "assistant" ? (
                  formatMessageContent(message.content)
                ) : (
                  message.content
                )}
                {message.role === "assistant" &&
                  isLoading &&
                  index === messages.length - 1 &&
                  !message.content && (
                    <TypingDots />
                  )}
              </div>
              <div
                className={`text-xs mt-1 ${
                  message.role === "user" ? "text-blue-200" : "text-gray-400"
                }`}
              >
                {message.timestamp}
              </div>
            </div>
          </div>
        ))}

        <div ref={messagesEndRef} />
      </div>

      {emailSent && (
        <div className="bg-green-50 text-green-700 text-sm px-4 py-2 text-center border-t border-green-200">
          Chat log has been saved for our records.
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="rounded-full px-6 bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
