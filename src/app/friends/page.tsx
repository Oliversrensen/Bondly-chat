"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/Toast";
import { UserPlus, MessageCircle, Users, UserCheck, UserX } from "lucide-react";

type Friend = {
  id: string;
  friend: {
    id: string;
    name: string | null;
    sillyName: string | null;
    image: string | null;
  };
  createdAt: string;
};

type FriendRequest = {
  id: string;
  requester: {
    id: string;
    name: string | null;
    sillyName: string | null;
    image: string | null;
  };
  createdAt: string;
};

export default function FriendsPage() {
  const { data: session } = useSession();
  const { addToast } = useToast();
  
  const [friends, setFriends] = useState<Friend[]>([]);
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"friends" | "requests">("friends");

  useEffect(() => {
    if (session?.user?.id) {
      fetchFriends();
      fetchRequests();
    }
  }, [session?.user?.id]);

  const fetchFriends = async () => {
    try {
      const response = await fetch("/api/friends");
      if (response.ok) {
        const data = await response.json();
        setFriends(data.friends);
      }
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  const fetchRequests = async () => {
    try {
      const response = await fetch("/api/friends/requests");
      if (response.ok) {
        const data = await response.json();
        setRequests(data.requests);
      }
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFriendRequest = async (action: "ACCEPT" | "DECLINE", friendId: string) => {
    try {
      const response = await fetch("/api/friends/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ friendId, action })
      });

      if (response.ok) {
        addToast({
          type: "success",
          message: `Friend request ${action.toLowerCase()}ed`
        });
        fetchFriends();
        fetchRequests();
      } else {
        const error = await response.json();
        addToast({
          type: "error",
          message: error.error || "Failed to update friend request"
        });
      }
    } catch (error) {
      addToast({
        type: "error",
        message: "Failed to update friend request"
      });
    }
  };

  const getDisplayName = (user: { name: string | null; sillyName: string | null }) => {
    return user.sillyName || user.name || "Anonymous";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-8 text-center">
            Friends
          </h1>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-8 bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab("friends")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === "friends"
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              <Users className="w-5 h-5" />
              Friends ({friends.length})
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === "requests"
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              <UserPlus className="w-5 h-5" />
              Requests ({requests.length})
            </button>
          </div>

          {/* Friends Tab */}
          {activeTab === "friends" && (
            <div className="space-y-4">
              {friends.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300 text-lg">No friends yet</p>
                  <p className="text-gray-400">Start chatting with people to add them as friends!</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {friends.map((friend) => (
                    <div
                      key={friend.id}
                      className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 hover:bg-white/20 transition-colors"
                    >
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {getDisplayName(friend.friend).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">
                            {getDisplayName(friend.friend)}
                          </h3>
                          <p className="text-gray-300 text-sm">
                            Friends since {new Date(friend.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          window.location.href = `/friends/${friend.friend.id}`;
                        }}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4" />
                        Message
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Requests Tab */}
          {activeTab === "requests" && (
            <div className="space-y-4">
              {requests.length === 0 ? (
                <div className="text-center py-12">
                  <UserPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300 text-lg">No pending requests</p>
                  <p className="text-gray-400">Friend requests will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {requests.map((request) => (
                    <div
                      key={request.id}
                      className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20"
                    >
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {getDisplayName(request.requester).charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-white font-semibold">
                            {getDisplayName(request.requester)}
                          </h3>
                          <p className="text-gray-300 text-sm">
                            Sent {new Date(request.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleFriendRequest("ACCEPT", request.id)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <UserCheck className="w-4 h-4" />
                          Accept
                        </button>
                        <button
                          onClick={() => handleFriendRequest("DECLINE", request.id)}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <UserX className="w-4 h-4" />
                          Decline
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
