"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/Toast";
import { Send, ArrowLeft, Users, MoreVertical } from "lucide-react";
import io, { Socket } from "socket.io-client";

type FriendMessage = {
  id: string;
  text: string;
  authorId: string;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    sillyName: string | null;
    image: string | null;
  };
};

type Friend = {
  id: string;
  friend: {
    id: string;
    name: string | null;
    sillyName: string | null;
    image: string | null;
  };
};

export default function FriendChatPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const { addToast } = useToast();
  
  const friendId = params.friendId as string;
  const myId = session?.user?.id;
  
  const [friend, setFriend] = useState<Friend | null>(null);
  const [messages, setMessages] = useState<FriendMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [friendTyping, setFriendTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastMessageCount, setLastMessageCount] = useState(0);
  
  const socketRef = useRef<Socket | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load friend data and messages
  useEffect(() => {
    if (!myId || !friendId) return;

    const loadFriendData = async () => {
      try {
        // Load friends list to get friend info
        const friendsResponse = await fetch("/api/friends");
        if (friendsResponse.ok) {
          const friendsData = await friendsResponse.json();
          const foundFriend = friendsData.friends.find((f: Friend) => f.friend.id === friendId);
          if (foundFriend) {
            setFriend(foundFriend);
          } else {
            addToast({
              type: "error",
              title: "Error",
              message: "Friend not found"
            });
            router.push("/friends");
            return;
          }
        }

        // Load messages
        const messagesResponse = await fetch(`/api/friends/messages?friendId=${friendId}`);
        if (messagesResponse.ok) {
          const messagesData = await messagesResponse.json();
          setMessages(messagesData.messages);
          setLastMessageCount(messagesData.messages.length);
        }
      } catch (error) {
        console.error("Error loading friend data:", error);
        addToast({
          type: "error",
          title: "Error",
          message: "Failed to load chat"
        });
      } finally {
        setLoading(false);
      }
    };

    loadFriendData();
  }, [myId, friendId, router, addToast]);

  // Socket connection for real-time messaging
  useEffect(() => {
    if (!myId || !friendId || !session) return;
    
    const wsUrl = process.env.NODE_ENV === 'production' 
      ? (process.env.NEXT_PUBLIC_WS_URL || "wss://bondly-websocket.onrender.com").replace(/^https?:\/\//, 'wss://')
      : "ws://localhost:3001";
    
    socketRef.current = io(wsUrl, {
      auth: { userId: myId }
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      if (friendId && myId) {
        socket.emit("join_friend_chat", { friendId, myId });
      }
    });

    socket.on("friend_message", (message: FriendMessage) => {
      setMessages(prev => {
        const newMessages = [...prev, message];
        setLastMessageCount(prev.length);
        return newMessages;
      });
    });

    socket.on("friend_typing", (data: { friendId: string; isTyping: boolean }) => {
      if (data.friendId === friendId) {
        setFriendTyping(data.isTyping);
      }
    });

    socket.on("reconnect", () => {
      // Rejoin the friend chat room after reconnection
      if (friendId && myId) {
        socket.emit("join_friend_chat", { friendId, myId });
      }
    });


    return () => {
      socket.disconnect();
    };
  }, [myId, friendId, session]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !myId || !friendId) return;

    const messageText = newMessage.trim();
    setNewMessage("");

    try {
      const response = await fetch("/api/friends/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          friendId,
          text: messageText
        })
      });

      if (response.ok) {
        const messageData = await response.json();
        setMessages(prev => [...prev, messageData.message]);
        
        // Emit to socket for real-time delivery
        if (socketRef.current) {
          socketRef.current.emit("send_friend_message", {
            friendId,
            message: messageData.message
          });
        }
      } else {
        addToast({
          type: "error",
          title: "Error",
          message: "Failed to send message"
        });
        setNewMessage(messageText); // Restore message on failure
      }
    } catch (error) {
      addToast({
        type: "error",
        title: "Error",
        message: "Failed to send message"
      });
      setNewMessage(messageText);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    
    if (socketRef.current) {
      socketRef.current.emit("friend_typing", { friendId, isTyping: true });
      
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
      
      typingTimeout.current = setTimeout(() => {
        socketRef.current?.emit("friend_typing", { friendId, isTyping: false });
      }, 1000);
    }
  };

  const getDisplayName = (user: { name: string | null; sillyName: string | null }) => {
    return user.sillyName || user.name || "Anonymous";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading chat...</div>
      </div>
    );
  }

  if (!friend) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white text-xl mb-4">Friend not found</div>
          <button
            onClick={() => router.push("/friends")}
            className="btn btn-primary"
          >
            Back to Friends
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col overflow-hidden">
      {/* Header - Fixed */}
      <div className="bg-white/5 backdrop-blur-xl border-b border-white/10 p-6 flex-shrink-0 shadow-2xl">
        <div className="max-w-5xl mx-auto flex items-center gap-6">
          <button
            onClick={() => router.push("/friends")}
            className="p-3 hover:bg-white/10 rounded-2xl transition-all duration-300 group"
          >
            <ArrowLeft className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
          </button>
          
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-xl ring-4 ring-white/10">
              {getDisplayName(friend.friend).charAt(0).toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-slate-900"></div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h1 className="text-white font-bold text-xl truncate mb-1">
              {getDisplayName(friend.friend)}
            </h1>
            <p className="text-gray-300 text-sm">
              {friendTyping ? (
                <span className="flex items-center gap-2 text-emerald-400">
                  <div className="flex gap-1">
                    <div className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce"></div>
                    <div className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1 h-1 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  Typing...
                </span>
              ) : (
                <span className="flex items-center gap-2 text-emerald-400">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  Online now
                </span>
              )}
            </p>
          </div>
          
          <div className="flex gap-2">
            <button className="p-3 hover:bg-white/10 rounded-2xl transition-all duration-300 group">
              <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </button>
            <button className="p-3 hover:bg-white/10 rounded-2xl transition-all duration-300 group">
              <MoreVertical className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Messages Container - Flexible */}
      <div className="flex-1 max-w-5xl mx-auto w-full flex flex-col min-h-0 relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20"></div>
        </div>
        
        {/* Messages Area - Scrollable */}
        <div 
          ref={messagesContainerRef} 
          className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent relative z-10"
        >
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full p-4">
              <div className="text-center max-w-lg">
                {/* Chat bubble illustration */}
                <div className="relative mb-8 opacity-60">
                  {/* Friend's bubble */}
                  <div className="flex justify-start mb-6 animate-fade-in">
                    <div className="max-w-[75%] mr-12">
                      <div className="bg-white/10 text-white border border-white/20 rounded-3xl px-6 py-4 shadow-xl backdrop-blur-sm">
                        <p className="text-sm font-medium">Hey there! 👋</p>
                        <p className="text-xs mt-3 text-gray-300">Just now</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Your bubble */}
                  <div className="flex justify-end mb-6 animate-fade-in" style={{ animationDelay: '0.5s' }}>
                    <div className="max-w-[75%] ml-12">
                      <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-3xl px-6 py-4 shadow-xl">
                        <p className="text-sm font-medium">Hello! Nice to meet you 😊</p>
                        <p className="text-xs mt-3 text-blue-100">Just now</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Another friend message */}
                  <div className="flex justify-start animate-fade-in" style={{ animationDelay: '1s' }}>
                    <div className="max-w-[75%] mr-12">
                      <div className="bg-white/10 text-white border border-white/20 rounded-3xl px-6 py-4 shadow-xl backdrop-blur-sm">
                        <p className="text-sm font-medium">How are you doing today?</p>
                        <p className="text-xs mt-3 text-gray-300">Just now</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-xl ring-4 ring-white/10 mx-auto">
                    <Users className="w-8 h-8" />
                  </div>
                  <p className="text-gray-200 text-xl font-bold">Start your conversation!</p>
                  <p className="text-gray-400 text-sm">Send your first message to {getDisplayName(friend.friend)}</p>
                </div>
              </div>
            </div>
          ) : (
            messages.map((message, index) => {
              const isMine = message.authorId === myId;
              const isNewMessage = index >= lastMessageCount;
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isMine ? "justify-end" : "justify-start"} ${
                    isNewMessage ? "animate-slide-in-up" : ""
                  }`}
                >
                  <div className={`max-w-[75%] ${isMine ? "ml-12" : "mr-12"}`}>
                    <div
                      className={`rounded-3xl px-6 py-4 shadow-xl backdrop-blur-sm ${
                        isMine
                          ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
                          : "bg-white/10 text-white border border-white/20"
                      }`}
                    >
                      <p className="text-sm leading-relaxed font-medium">{message.text}</p>
                      <p className={`text-xs mt-3 ${
                        isMine ? "text-blue-100" : "text-gray-300"
                      }`}>
                        {new Date(message.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Message Input - Fixed */}
        <div className="flex-shrink-0 p-6 bg-white/5 backdrop-blur-xl border-t border-white/10 relative">
          <div className="flex gap-4 items-end">
            <div className="flex-1 relative">
              <div className="relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleTyping}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  placeholder={`Message ${getDisplayName(friend.friend)}...`}
                  className="w-full bg-white/10 border border-white/20 rounded-3xl px-6 py-4 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none shadow-xl backdrop-blur-sm"
                />
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </div>
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white p-4 rounded-3xl transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 disabled:scale-100 disabled:shadow-lg group"
            >
              <Send className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
