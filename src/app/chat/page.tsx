"use client";

import { useEffect, useRef, useState } from "react";
import io, { Socket } from "socket.io-client";
import { Send, Sparkles, Shuffle, SkipForward, Flag } from "lucide-react";
import { useSession } from "next-auth/react";
import { track } from '@vercel/analytics';

type ChatMessage = {
  text: string;
  authorId?: string;
  sillyName?: string;
  at: number;
};

export default function ChatPage() {
  const { data: session } = useSession();
  const myId = session?.user?.id;

  const [roomId, setRoomId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [status, setStatus] = useState("");
  const [finding, setFinding] = useState(false);
  const [partnerName, setPartnerName] = useState<string | null>(null);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [chatEnded, setChatEnded] = useState(false);
  const [lastMode, setLastMode] = useState<"random" | "interest">("random");

  const [genderFilter, setGenderFilter] = useState<"MALE" | "FEMALE" | null>(
    null
  );
  const [isPro, setIsPro] = useState(false);
  const [myDisplayName, setMyDisplayName] = useState("You");

  const [timedOut, setTimedOut] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const socketRef = useRef<Socket | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const hbRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cooldownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function stopPolling() {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }

  function scrollToBottom() {
    if (!scrollRef.current) {
      console.log("scrollRef.current is null");
      return;
    }
    console.log("Scrolling to bottom, scrollHeight:", scrollRef.current.scrollHeight);
    
    // Try smooth scroll first
    try {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    } catch (error) {
      // Fallback to instant scroll
      console.log("Smooth scroll failed, using instant scroll");
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }

  function clearQueueTimeout() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setTimedOut(false);
  }

  function startCooldown() {
    setCooldown(10);
    if (cooldownRef.current) clearInterval(cooldownRef.current);

    cooldownRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (cooldownRef.current) clearInterval(cooldownRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  useEffect(() => {
    fetch("/api/me")
      .then((r) => r.json())
      .then((me) => {
        setIsPro(me?.isPro ?? false);
        setMyDisplayName(me?.sillyName || me?.name || "You");
      });
  }, []);

  function startHeartbeat() {
    if (hbRef.current) return;
    const beat = () =>
      fetch("/api/presence/heartbeat", {
        method: "POST",
        credentials: "include",
      }).catch(() => {});
    beat();
    hbRef.current = setInterval(beat, 30000);
  }
  function stopHeartbeat() {
    if (!hbRef.current) return;
    clearInterval(hbRef.current);
    hbRef.current = null;
  }

  useEffect(() => {
    fetch("/api/match/leave", {
      method: "POST",
      credentials: "include",
    }).catch(() => {});
    return () => {
      stopHeartbeat();
      stopPolling();
    };
  }, []);

  useEffect(() => {
    const s = io(process.env.NEXT_PUBLIC_WS_URL!, { transports: ["websocket"] });
    socketRef.current = s;

    if (session?.user?.id) {
      s.emit("identify", { userId: session.user.id });
    }

    s.on("message", (m: ChatMessage) => {
      console.log("Received message:", m); // Debug log
      setMessages((prev) => [...prev, m]);
    });
    s.on("typing", () => setPartnerTyping(true));
    s.on("stop_typing", () => setPartnerTyping(false));
    s.on("ended", () => {
      setChatEnded(true);
      setStatus("Partner left the chat.");
      stopPolling();
    });

    // Handle page unload (close tab, navigate away, etc.)
    const handleBeforeUnload = () => {
      if (s.connected && roomId) {
        s.emit("leave_room", { roomId });
        s.disconnect();
      }
    };

    // Handle page visibility change (tab switching, minimizing, etc.)
    const handleVisibilityChange = () => {
      if (document.hidden && s.connected && roomId) {
        s.emit("leave_room", { roomId });
        s.disconnect();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      s.disconnect();
    };
  }, [session?.user?.id]);

  useEffect(() => {
    if (roomId && socketRef.current) {
      socketRef.current.emit("join_room", { roomId });
      fetch("/api/match/leave", {
        method: "POST",
        credentials: "include",
      }).catch(() => {});
      stopHeartbeat();
      stopPolling();
      // Scroll to bottom when joining a new room
      setTimeout(scrollToBottom, 100);
    }
  }, [roomId]);

  useEffect(() => {
    if (!scrollRef.current) {
      console.log("Auto-scroll: scrollRef.current is null");
      return;
    }
    console.log("Auto-scroll: New message, scrolling to bottom");
    // Use the scrollToBottom function for consistency
    scrollToBottom();
  }, [messages]);

  // Also scroll when typing indicator changes
  useEffect(() => {
    if (!scrollRef.current) return;
    scrollToBottom();
  }, [partnerTyping]);

  async function start(mode: "random" | "interest") {
    setFinding(true);
    setLastMode(mode);
    setStatus("Finding a partner…");
    startHeartbeat();
    clearQueueTimeout();
    
    // Track search start
    track('chat_search_started', { mode, genderFilter, isPro });

    const res = await fetch("/api/match/enqueue", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode, genderFilter }),
    });

    if (!res.ok) {
      const txt = await res.text();
      setFinding(false);
      setStatus(`Match failed (${res.status}): ${txt}`);
      return;
    }

    const data = await res.json();
    if (data.roomId) {
      setPartnerName(data.partnerName ?? null);
      setStatus(`Matched with ${data.partnerName ?? "Anonymous"}, say hi!`);
      setRoomId(data.roomId);
      stopPolling();
    } else if (data.queued) {
      setStatus("Waiting in queue…");

      // 🔥 start a 2 min timeout
      timeoutRef.current = setTimeout(() => {
        setTimedOut(true);
        setStatus("No match found. Try again?");
        stopPolling();
        fetch("/api/match/leave", { method: "POST", credentials: "include" }).catch(
          () => {}
        );
      }, 120_000);

      if (!pollRef.current) {
        pollRef.current = setInterval(async () => {
          const res = await fetch("/api/match/pending", {
            credentials: "include",
          });
          if (!res.ok) return;
          const data = await res.json();
          if (data.roomId) {
            clearQueueTimeout();
            setPartnerName(data.partnerName ?? null);
            setStatus(
              `Matched with ${data.partnerName ?? "Anonymous"}, say hi!`
            );
            setRoomId(data.roomId);
            stopPolling();
            
            // Track successful match
            track('chat_match_found', { mode: lastMode, genderFilter, isPro });
          }
        }, 3000);
      }
    } else {
      setStatus("No match yet, try again.");
    }
    setFinding(false);
  }

  function send() {
    if (!text.trim() || !roomId || !socketRef.current || chatEnded) return;
    socketRef.current.emit("message", {
      roomId,
      text,
      userId: session?.user?.id,
    });
    socketRef.current.emit("stop_typing", { roomId });
    setText("");
    
    // Track message sent
    track('chat_message_sent', { mode: lastMode, messageLength: text.length });
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

  async function reportUser() {
    if (!roomId) return;
    const payload = {
      roomId,
      reason: "User report from chat UI",
      messages,
    };
    await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    
    // Track user report
    track('user_reported', { mode: lastMode, messageCount: messages.length });
    
    alert("Report submitted. Thank you for helping keep Kindred safe.");
  }

  function nextChat() {
    if (roomId && socketRef.current) {
      socketRef.current.emit("leave_room", { roomId });
    }
    setRoomId(null);
    setMessages([]);
    setPartnerName(null);
    setChatEnded(false);
    stopPolling();
    clearQueueTimeout();
    
    // Track chat ended by user
    track('chat_ended_by_user', { mode: lastMode, messageCount: messages.length });
    
    start(lastMode);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-800">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Modern Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-2">
            <span className="bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
              Anonymous Chat
            </span>
          </h1>
          <p className="text-center text-dark-300">
            Connect with strangers and make meaningful conversations
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:gap-6 h-[calc(100vh-8rem)] sm:h-[calc(100vh-12rem)]">
          {/* Modern Controls */}
          <div className="card card-elevated">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
              {/* Matching Controls */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <button
                  className="btn btn-primary flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-3 group"
                  onClick={() => start("random")}
                  disabled={finding || !!roomId}
                >
                  <Shuffle className="h-3 w-3 sm:h-4 sm:w-4 group-hover:rotate-180 transition-transform duration-300" /> 
                  <span className="hidden sm:inline">Random Match</span>
                  <span className="sm:hidden">Random</span>
                </button>
                <button
                  className="btn btn-secondary flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-3 sm:px-4 py-2 sm:py-3 group"
                  onClick={() => start("interest")}
                  disabled={finding || !!roomId}
                >
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform duration-300" /> 
                  <span className="hidden sm:inline">By Interests</span>
                  <span className="sm:hidden">Interests</span>
                </button>
                
                {/* Gender Filter */}
                <div className="gender-toggle">
                  {(["MALE", null, "FEMALE"] as const).map((option, idx) => {
                    const label =
                      option === "MALE"
                        ? "Male"
                        : option === "FEMALE"
                        ? "Female"
                        : "Any";
                    const isActive = genderFilter === option;
                    return (
                      <button
                        key={label}
                        className={`px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? "active"
                            : "text-dark-300 hover:text-dark-100"
                        }`}
                        onClick={() => isPro && setGenderFilter(option)}
                        disabled={!isPro || !!roomId}
                        title={!isPro ? "Only available to Pro users" : ""}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Chat Actions */}
              {roomId && (
                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    className="btn btn-ghost flex items-center gap-1 sm:gap-2 text-dark-300 hover:text-primary-400 group text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
                    onClick={nextChat}
                  >
                    <SkipForward className="h-3 w-3 sm:h-4 sm:w-4 group-hover:translate-x-1 transition-transform duration-200" /> 
                    <span className="hidden sm:inline">Next Chat</span>
                    <span className="sm:hidden">Next</span>
                  </button>
                  <button
                    className="btn btn-ghost flex items-center gap-1 sm:gap-2 text-dark-300 hover:text-red-400 group text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2"
                    onClick={reportUser}
                  >
                    <Flag className="h-3 w-3 sm:h-4 sm:w-4 group-hover:scale-110 transition-transform duration-200" /> 
                    <span className="hidden sm:inline">Report</span>
                    <span className="sm:hidden">!</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Modern Chat Area */}
          <div
            className={`card card-elevated overflow-hidden transition-all duration-300 flex-1 flex flex-col ${
              roomId
                ? "card-glow animate-glow"
                : ""
            }`}
          >
            {/* Status Bar */}
            <div className="border-b border-dark-700/50 p-4">
              <div
                className={`flex justify-center items-center gap-3 text-sm ${
                  roomId
                    ? "text-accent-400 font-medium"
                    : timedOut
                    ? "text-yellow-400 font-medium"
                    : "text-dark-400"
                }`}
              >
                {(finding || (pollRef.current && !roomId && !timedOut)) && (
                  <div className="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                )}

                <span className="text-center">{status}</span>

                {timedOut && (
                  <>
                    {cooldown > 0 ? (
                      <span className="text-xs text-dark-500 bg-dark-800 px-2 py-1 rounded-full">
                        Retry in {cooldown}s
                      </span>
                    ) : (
                      <button
                        className="btn btn-ghost text-xs px-3 py-1"
                        onClick={() => {
                          clearQueueTimeout();
                          start(lastMode);
                          startCooldown();
                        }}
                      >
                        Retry
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Messages Container */}
            <div ref={scrollRef} className="flex-1 p-4 sm:p-6 min-h-0 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center min-h-[200px] sm:min-h-[300px] text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-dark-400 text-lg font-medium mb-2">No messages yet</p>
                  <p className="text-dark-500 text-sm">Start the conversation and make a new friend!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((m, i) => {
                    const mine = m.authorId && myId ? m.authorId === myId : false;
                    return (
                      <div
                        key={i}
                        className={`flex ${mine ? "justify-end" : "justify-start"} animate-fade-in-up`}
                      >
                        <div className={`message-bubble ${mine ? "own" : "other"} max-w-[280px] sm:max-w-xs`}>
                          <div className="flex items-start justify-between mb-2 gap-2">
                            <span className="text-xs font-semibold text-white flex-shrink-0">
                              {mine ? myDisplayName : (m.sillyName && m.sillyName !== "Anonymous" ? m.sillyName : "Anonymous")}
                            </span>
                            <span className="text-xs text-white/70 flex-shrink-0">
                              {new Date(m.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="text-white leading-relaxed text-sm">
                            {m.text}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Typing Indicator */}
              {partnerTyping && !chatEnded && (
                <div className="flex items-center gap-3 mt-4 animate-slide-in-up">
                  <div className="w-8 h-8 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {(partnerName ?? "Partner").charAt(0)}
                    </span>
                  </div>
                  <div className="bg-dark-800/50 rounded-2xl px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-dark-300">
                        {partnerName ?? "Partner"} is typing
                      </span>
                      <div className="status-typing">
                        <span></span>
                        <span></span>
                        <span></span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Chat Ended */}
              {chatEnded && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <p className="text-red-400 font-medium mb-2">Your partner has left the chat</p>
                  <p className="text-dark-400 text-sm">Press "Next Chat" to find someone else</p>
                </div>
              )}
            </div>
          </div>

          {/* Modern Input Area */}
          <div className="card">
            <div className="flex gap-2 sm:gap-3 items-end">
              <div className="flex-1 input-group">
                <input
                  className="input w-full resize-none text-sm sm:text-base"
                  placeholder={
                    roomId
                      ? chatEnded
                        ? "Partner left. Press Next to find someone else."
                        : "Type a message…"
                      : "Match first to start chatting"
                  }
                  value={text}
                  onChange={(e) => handleTyping(e.target.value)}
                  disabled={!roomId || chatEnded}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      send();
                    }
                  }}
                />
              </div>
              <button
                className="btn btn-primary p-2 sm:p-3 group"
                onClick={send}
                disabled={!roomId || !text.trim() || chatEnded}
              >
                <Send className="h-4 w-4 sm:h-5 sm:w-5 group-hover:scale-110 transition-transform duration-200" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
