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
    
    console.log("Setting up WebSocket connection with:", { myId, friendId, sessionLoaded: !!session });

    const wsUrl = process.env.NODE_ENV === 'production' 
      ? process.env.NEXT_PUBLIC_WS_URL || "wss://bondly-websocket.onrender.com"
      : "ws://localhost:3001";
    
    socketRef.current = io(wsUrl, {
      auth: { userId: myId }
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("Connected to friend chat socket");
      console.log("Joining with friendId:", friendId, "myId:", myId);
      
      if (friendId && myId) {
        socket.emit("join_friend_chat", { friendId, myId });
      } else {
        console.error("Cannot join friend chat: missing friendId or myId", { friendId, myId });
      }
    });

    socket.on("friend_message", (message: FriendMessage) => {
      console.log("Received friend message:", message);
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

    socket.on("disconnect", () => {
      console.log("Disconnected from friend chat socket");
    });

    socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error);
    });

    socket.on("error", (error) => {
      console.error("WebSocket error:", error);
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-sm border-b border-white/20 p-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={() => router.push("/friends")}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          
          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {getDisplayName(friend.friend).charAt(0).toUpperCase()}
          </div>
          
          <div className="flex-1">
            <h1 className="text-white font-semibold text-lg">
              {getDisplayName(friend.friend)}
            </h1>
            <p className="text-gray-300 text-sm">
              {friendTyping ? "Typing..." : "Online"}
            </p>
          </div>
          
          <button className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <MoreVertical className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col">
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-300 text-lg">Start your conversation!</p>
              <p className="text-gray-400">Send your first message to {getDisplayName(friend.friend)}</p>
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
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      isMine
                        ? "bg-blue-600 text-white"
                        : "bg-white/20 text-white backdrop-blur-sm"
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p className={`text-xs mt-1 ${
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

        {/* Message Input */}
        <div className="p-4 bg-white/5 backdrop-blur-sm border-t border-white/10">
          <div className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={handleTyping}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
              placeholder={`Message ${getDisplayName(friend.friend)}...`}
              className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-3 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={sendMessage}
              disabled={!newMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-3 rounded-full transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
