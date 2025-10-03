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
    <div className="h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col overflow-hidden">
      {/* Header - Fixed */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20 p-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={() => router.push("/friends")}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {getDisplayName(friend.friend).charAt(0).toUpperCase()}
          </div>
          
          <div className="flex-1 min-w-0">
            <h1 className="text-white font-semibold text-lg truncate">
              {getDisplayName(friend.friend)}
            </h1>
            <p className="text-gray-300 text-sm">
              {friendTyping ? (
                <span className="flex items-center gap-1">
                  <span className="animate-pulse">●</span>
                  Typing...
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                  Online
                </span>
              )}
            </p>
          </div>
          
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <MoreVertical className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Messages Container - Flexible */}
      <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col min-h-0">
        {/* Messages Area - Scrollable */}
        <div 
          ref={messagesContainerRef} 
          className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
        >
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full p-4">
              <div className="text-center max-w-md">
                {/* Chat bubble illustration */}
                <div className="relative mb-6 opacity-60">
                  {/* Friend's bubble */}
                  <div className="flex justify-start mb-4 animate-fade-in">
                    <div className="bg-white/20 text-white backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-3 shadow-sm max-w-[200px]">
                      <p className="text-sm">Hey there! 👋</p>
                      <p className="text-xs mt-2 text-gray-300">Just now</p>
                    </div>
                  </div>
                  
                  {/* Your bubble */}
                  <div className="flex justify-end mb-4 animate-fade-in" style={{ animationDelay: '0.5s' }}>
                    <div className="bg-blue-600 text-white rounded-2xl px-4 py-3 shadow-sm max-w-[200px]">
                      <p className="text-sm">Hello! Nice to meet you 😊</p>
                      <p className="text-xs mt-2 text-blue-100">Just now</p>
                    </div>
                  </div>
                  
                  {/* Another friend message */}
                  <div className="flex justify-start animate-fade-in" style={{ animationDelay: '1s' }}>
                    <div className="bg-white/20 text-white backdrop-blur-sm border border-white/10 rounded-2xl px-4 py-3 shadow-sm max-w-[180px]">
                      <p className="text-sm">How are you doing today?</p>
                      <p className="text-xs mt-2 text-gray-300">Just now</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Users className="w-12 h-12 text-gray-400 mx-auto" />
                  <p className="text-gray-300 text-lg font-medium">Start your conversation!</p>
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
                  <div
                    className={`max-w-[70%] rounded-2xl px-4 py-3 shadow-sm ${
                      isMine
                        ? "bg-blue-600 text-white"
                        : "bg-white/20 text-white backdrop-blur-sm border border-white/10"
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.text}</p>
                    <p className={`text-xs mt-2 ${
                      isMine ? "text-blue-100" : "text-gray-300"
                    }`}>
                      {new Date(message.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Message Input - Fixed */}
        <div className="flex-shrink-0 p-4 bg-white/5 backdrop-blur-sm border-t border-white/10">
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <input
                type="text"
                value={newMessage}
                onChange={handleTyping}
                onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                placeholder={`Message ${getDisplayName(friend.friend)}...`}
                className="w-full bg-white/10 border border-white/20 rounded-2xl px-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-3 rounded-2xl transition-colors shadow-lg disabled:shadow-none"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
