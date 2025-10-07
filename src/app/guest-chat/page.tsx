"use client";

import { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";
import { Send, Sparkles, Shuffle, UserPlus, Clock } from "lucide-react";
import { useToast } from "@/components/Toast";
import { MessageSkeleton } from "@/components/Skeleton";

type ChatMessage = {
  text: string;
  authorId?: string;
  sillyName?: string;
  at: number;
  isGuest?: boolean;
};

export default function GuestChatPage() {
  const { addToast } = useToast();

  const [roomId, setRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [status, setStatus] = useState("");
  const [finding, setFinding] = useState(false);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [chatEnded, setChatEnded] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [isPartnerRealUser, setIsPartnerRealUser] = useState(false);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(30 * 60); // 30 minutes in seconds
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sessionTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize guest session
  useEffect(() => {
    const initGuestSession = async () => {
      try {
        const response = await fetch('/api/guest/session', {
          method: 'POST',
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log('Guest session created:', data.guestId);
        }
      } catch (error) {
        console.error('Failed to create guest session:', error);
        addToast({
          type: 'error',
          title: 'Session Error',
          message: 'Failed to start guest session',
          duration: 5000
        });
      }
    };

    initGuestSession();
  }, [addToast]);

  // Start session timer
  useEffect(() => {
    sessionTimerRef.current = setInterval(() => {
      setSessionTimeLeft(prev => {
        if (prev <= 0) {
          setShowUpgradePrompt(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (sessionTimerRef.current) {
        clearInterval(sessionTimerRef.current);
      }
    };
  }, []);

  // Show upgrade prompt after 5 messages
  useEffect(() => {
    if (messageCount >= 5 && !showUpgradePrompt) {
      setShowUpgradePrompt(true);
    }
  }, [messageCount, showUpgradePrompt]);

  // Initialize WebSocket connection
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080');
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Guest WebSocket connected");
      // Identify as guest user using the session guest ID
      socket.emit("identify", { 
        userId: guestId,
        isGuest: true 
      });
    });

    socket.on("message", (data: ChatMessage) => {
      setMessages(prev => [...prev, data]);
      setMessageCount(prev => prev + 1);
      setTimeout(scrollToBottom, 100);
    });

    socket.on("typing", () => {
      setPartnerTyping(true);
    });

    socket.on("stop_typing", () => {
      setPartnerTyping(false);
    });

    socket.on("user_left", () => {
      setChatEnded(true);
      setStatus("Your chat partner left the conversation");
      addToast({
        type: 'info',
        title: 'Partner Left',
        message: 'Your chat partner has left the conversation',
        duration: 5000
      });
    });

    socket.on("disconnect", () => {
      console.log("Guest WebSocket disconnected");
    });

    return () => {
      if (socket.connected && roomId) {
        socket.emit("leave_room", { roomId });
      }
      socket.disconnect();
    };
  }, [roomId, addToast]);

  function scrollToBottom() {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  function clearQueueTimeout() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setTimedOut(false);
  }

  async function startFinding() {
    if (finding) return;
    
    setFinding(true);
    setStatus("Finding someone to chat with...");
    clearQueueTimeout();
    
    try {
      const response = await fetch("/api/guest/match", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to find match");
      }

      const data = await response.json();

      if (data.roomId) {
        // Found a match immediately
        setPartnerId(data.partnerId);
        setIsPartnerRealUser(data.isRealUser || false);
        setStatus(`Matched! Say hi to your new chat partner`);
        setRoomId(data.roomId);
        clearQueueTimeout();
        addToast({
          type: 'success',
          title: 'Match Found!',
          message: data.isRealUser 
            ? 'You\'ve been matched with a registered user' 
            : 'You\'ve been matched with someone',
          duration: 3000
        });
      } else if (data.queued) {
        setStatus("Waiting for someone to join...");
        
        // Start polling for matches
        pollRef.current = setInterval(async () => {
          const res = await fetch("/api/guest/match", {
            credentials: "include",
          });
          if (!res.ok) return;
          
          const matchData = await res.json();
          if (matchData.roomId) {
            clearQueueTimeout();
            setPartnerId(matchData.partnerId);
            setIsPartnerRealUser(matchData.isRealUser || false);
            setStatus(`Matched! Say hi to your new chat partner`);
            setRoomId(matchData.roomId);
            stopPolling();
            addToast({
              type: 'success',
              title: 'Match Found!',
              message: matchData.isRealUser 
                ? 'You\'ve been matched with a registered user' 
                : 'You\'ve been matched with someone',
              duration: 3000
            });
          }
        }, 3000);

        // Set a 45-second timeout for guest users (shorter than regular users)
        timeoutRef.current = setTimeout(() => {
          setTimedOut(true);
          setStatus("No one's available right now. Try again?");
          stopPolling();
        }, 45000);
      }
    } catch (error) {
      console.error("Error finding match:", error);
      setStatus("Something went wrong. Try again?");
      addToast({
        type: 'error',
        title: 'Connection Error',
        message: 'Failed to find a match. Please try again.',
        duration: 5000
      });
    }
    
    setFinding(false);
  }

  function send() {
    if (!text.trim() || !roomId || !socketRef.current || chatEnded) return;
    
    socketRef.current.emit("guest_message", {
      roomId,
      text,
      isGuest: true
    });
    
    socketRef.current.emit("stop_typing", { roomId });
    setText("");
    setMessageCount(prev => prev + 1);
  }

  function handleTyping(value: string) {
    setText(value);
    if (!roomId || !socketRef.current) return;

    socketRef.current.emit("typing", { roomId });

    if (typingTimeout.current) clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socketRef.current?.emit("stop_typing", { roomId });
    }, 1500);
  }

  function leaveChat() {
    if (socketRef.current && roomId) {
      socketRef.current.emit("leave_room", { roomId });
    }
    setRoomId(null);
    setMessages([]);
    setPartnerId(null);
    setChatEnded(false);
    setPartnerTyping(false);
    setMessageCount(0);
    stopPolling();
    clearQueueTimeout();
    setStatus("");
  }

  function formatTime(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800">
      {/* Guest Session Info */}
      <div className="bg-blue-500/10 border-b border-blue-500/20 px-4 py-2">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-blue-400">
            <UserPlus className="w-4 h-4" />
            <span>Guest Mode</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-blue-400">
              <Clock className="w-4 h-4" />
              <span>{formatTime(sessionTimeLeft)} left</span>
            </div>
            <button
              onClick={() => window.location.href = '/auth'}
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Sign up for full features
            </button>
          </div>
        </div>
      </div>

      {/* Upgrade Prompt */}
      {showUpgradePrompt && (
        <div className="bg-gradient-to-r from-primary-500/20 to-secondary-500/20 border-b border-primary-500/30 px-4 py-3">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-semibold">Love chatting? Get the full experience!</h3>
                <p className="text-sm text-primary-300">Unlimited time, interest matching, friend requests, and more!</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => window.location.href = '/auth'}
                  className="btn btn-primary px-4 py-2 text-sm"
                >
                  Sign Up Free
                </button>
                <button
                  onClick={() => setShowUpgradePrompt(false)}
                  className="btn btn-ghost px-4 py-2 text-sm"
                >
                  Continue as Guest
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-6">
        {!roomId ? (
          <div className="text-center space-y-8">
            <div className="card card-elevated max-w-lg mx-auto">
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold mb-2">Start Chatting as Guest</h2>
                  <p className="text-dark-300 mb-4">
                    Chat anonymously with strangers instantly. No signup required!
                  </p>
                  
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
                    <h3 className="text-blue-400 font-semibold mb-2">Guest Mode Features:</h3>
                    <ul className="text-sm text-blue-300 space-y-1 text-left">
                      <li>• 30-minute chat sessions</li>
                      <li>• Random matching only</li>
                      <li>• Anonymous chat</li>
                      <li>• No message history</li>
                    </ul>
                  </div>
                </div>

                {timedOut ? (
                  <div className="space-y-4">
                    <p className="text-dark-300">No one's available right now.</p>
                    <button
                      onClick={startFinding}
                      className="btn btn-primary px-8 py-4 text-lg font-semibold"
                    >
                      <Shuffle className="w-5 h-5 mr-2" />
                      Try Again
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={startFinding}
                    disabled={finding}
                    className="btn btn-primary px-8 py-4 text-lg font-semibold group"
                  >
                    {finding ? (
                      <div className="flex items-center gap-3">
                        <div className="loading-dots">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                        Finding someone...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5" />
                        Start Chatting Now
                      </div>
                    )}
                  </button>
                )}

                {status && (
                  <p className="text-dark-300 text-sm">{status}</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="card card-elevated">
            {/* Chat Header */}
            <div className="bg-dark-800/50 p-4 border-b border-dark-700 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">G</span>
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">
                      {isPartnerRealUser ? 'Registered User' : 'Anonymous Guest'}
                    </h3>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-400 text-sm">Online</span>
                      {isPartnerRealUser && (
                        <span className="text-xs text-blue-400 bg-blue-500/20 px-2 py-1 rounded-full">
                          Registered
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={leaveChat}
                  className="btn btn-ghost text-sm px-3 py-1"
                >
                  Leave Chat
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="h-96 overflow-y-auto p-4 space-y-4 scrollbar-thin"
            >
              {messages.length === 0 ? (
                <MessageSkeleton />
              ) : (
                messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.authorId === partnerId ? 'justify-start' : 'justify-end'}`}
                  >
                    <div className={`max-w-xs ${message.authorId === partnerId ? '' : 'ml-auto'}`}>
                      <div
                        className={`message-bubble ${
                          message.authorId === partnerId ? 'other' : 'own'
                        }`}
                      >
                        <p className="text-white text-sm">{message.text}</p>
                      </div>
                      <p className={`text-xs text-dark-500 mt-1 ${
                        message.authorId === partnerId ? 'ml-1' : 'mr-1 text-right'
                      }`}>
                        {message.authorId === partnerId 
                          ? (isPartnerRealUser ? 'Registered User' : 'Anonymous') 
                          : 'You'
                        } • {new Date(message.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              
              {partnerTyping && (
                <div className="flex justify-start">
                  <div className="bg-gradient-to-r from-secondary-500/20 to-secondary-600/20 rounded-2xl px-4 py-3">
                    <div className="status-typing">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-dark-700 rounded-b-2xl">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => handleTyping(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && send()}
                  placeholder="Type your message..."
                  className="flex-1 input"
                  disabled={chatEnded}
                />
                <button
                  onClick={send}
                  disabled={!text.trim() || chatEnded}
                  className="btn btn-primary px-4 py-2"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              
              {chatEnded && (
                <div className="mt-3 text-center">
                  <button
                    onClick={leaveChat}
                    className="btn btn-primary px-6 py-2"
                  >
                    Start New Chat
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
