import { useState } from 'react';
import { MessageCircle, Send, ArrowLeft, Package, Clock, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
  isOwn: boolean;
}

interface Conversation {
  id: string;
  parcelId: string;
  trackingCode: string;
  otherPartyName: string;
  otherPartyRole: string;
  route: string;
  lastMessage: string;
  lastMessageTime: Date;
  unreadCount: number;
  messages: Message[];
}

// Mock conversations for demo
const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    parcelId: 'p-001',
    trackingCode: 'BHJ-7A3F-9D2B',
    otherPartyName: 'Rahul Sharma',
    otherPartyRole: 'Traveler',
    route: 'Mumbai → Delhi',
    lastMessage: 'I will pick up the parcel tomorrow morning around 10 AM',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 30),
    unreadCount: 2,
    messages: [
      { id: 'm1', senderId: 'other', text: 'Hi! I accepted your parcel delivery request.', timestamp: new Date(Date.now() - 1000 * 60 * 120), isOwn: false },
      { id: 'm2', senderId: 'me', text: 'Great! When can you pick it up?', timestamp: new Date(Date.now() - 1000 * 60 * 90), isOwn: true },
      { id: 'm3', senderId: 'other', text: 'I will pick up the parcel tomorrow morning around 10 AM', timestamp: new Date(Date.now() - 1000 * 60 * 30), isOwn: false },
    ],
  },
  {
    id: 'conv-2',
    parcelId: 'p-002',
    trackingCode: 'BHJ-5C8E-1F4A',
    otherPartyName: 'Priya Patel',
    otherPartyRole: 'Sender',
    route: 'Bangalore → Chennai',
    lastMessage: 'Thank you! The parcel is ready for pickup.',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 3),
    unreadCount: 0,
    messages: [
      { id: 'm4', senderId: 'me', text: 'Hello! I can carry your parcel on my trip to Chennai this weekend.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), isOwn: true },
      { id: 'm5', senderId: 'other', text: 'That would be wonderful! Its a small box, about 2kg.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), isOwn: false },
      { id: 'm6', senderId: 'me', text: 'No problem! I can pick it up Friday evening. Will that work?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3.5), isOwn: true },
      { id: 'm7', senderId: 'other', text: 'Thank you! The parcel is ready for pickup.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), isOwn: false },
    ],
  },
  {
    id: 'conv-3',
    parcelId: 'p-003',
    trackingCode: 'BHJ-2D9G-7H5K',
    otherPartyName: 'Amit Kumar',
    otherPartyRole: 'Traveler',
    route: 'Pune → Hyderabad',
    lastMessage: 'Parcel delivered successfully! Please confirm.',
    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 24),
    unreadCount: 0,
    messages: [
      { id: 'm8', senderId: 'other', text: 'I have reached Hyderabad. Where should I deliver?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26), isOwn: false },
      { id: 'm9', senderId: 'me', text: 'Please deliver to: 42 Tech Park, Madhapur. My friend will receive it.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 25), isOwn: true },
      { id: 'm10', senderId: 'other', text: 'Parcel delivered successfully! Please confirm.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), isOwn: false },
    ],
  },
];

function formatTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>(MOCK_CONVERSATIONS);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeConversation) return;

    const message: Message = {
      id: `m-${Date.now()}`,
      senderId: user?.id || 'me',
      text: newMessage.trim(),
      timestamp: new Date(),
      isOwn: true,
    };

    const updatedConversation = {
      ...activeConversation,
      messages: [...activeConversation.messages, message],
      lastMessage: newMessage.trim(),
      lastMessageTime: new Date(),
    };

    setActiveConversation(updatedConversation);
    setConversations((prev) =>
      prev.map((c) => (c.id === activeConversation.id ? updatedConversation : c))
    );
    setNewMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0);

  return (
    <div className="warm-canvas min-h-screen">
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-display">
          Messages
        </h1>
        <p className="text-slate-600 mt-1">
          Communicate with senders and travelers about your parcels
          {totalUnread > 0 && (
            <span className="ml-2 inline-flex items-center px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
              {totalUnread} unread
            </span>
          )}
        </p>
      </div>

      <div className="soft-card shadow-sm overflow-hidden" style={{ height: '70vh' }}>
        <div className="flex h-full">
          {/* Conversation List */}
          <div className={`w-full md:w-1/3 border-r border-gray-200 flex flex-col ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 text-sm">All Conversations</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No conversations yet</p>
                  <p className="text-gray-400 text-xs mt-1">
                    Messages will appear here when you have active deliveries
                  </p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => {
                      setActiveConversation(conv);
                      // Mark as read
                      setConversations((prev) =>
                        prev.map((c) => (c.id === conv.id ? { ...c, unreadCount: 0 } : c))
                      );
                    }}
                    className={`w-full p-4 text-left hover:bg-slate-50 transition-colors border-b border-gray-50 ${
                      activeConversation?.id === conv.id ? 'bg-indigo-50 border-l-4 border-l-indigo-600' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-indigo-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium text-gray-900 text-sm truncate">
                            {conv.otherPartyName}
                          </span>
                          <span className="text-xs text-gray-400 flex-shrink-0">
                            {formatTime(conv.lastMessageTime)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">{conv.otherPartyRole} - {conv.route}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm text-gray-600 truncate">{conv.lastMessage}</p>
                          {conv.unreadCount > 0 && (
                            <span className="ml-2 w-5 h-5 bg-orange-500 text-white text-xs font-bold rounded-full flex items-center justify-center flex-shrink-0">
                              {conv.unreadCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`flex-1 flex flex-col ${activeConversation ? 'flex' : 'hidden md:flex'}`}>
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 flex items-center gap-3 bg-white">
                  <button
                    onClick={() => setActiveConversation(null)}
                    className="md:hidden p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                    <User className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{activeConversation.otherPartyName}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <Package className="w-3 h-3" />
                      {activeConversation.trackingCode} - {activeConversation.route}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                  {activeConversation.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                          msg.isOwn
                            ? 'bg-indigo-600 text-white rounded-br-md'
                            : 'bg-white text-gray-900 border border-gray-200 rounded-bl-md'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        <p
                          className={`text-xs mt-1 flex items-center gap-1 ${
                            msg.isOwn ? 'text-indigo-200' : 'text-gray-400'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex items-end gap-2">
                    <textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Type a message..."
                      rows={1}
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none text-sm"
                      style={{ maxHeight: '100px' }}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">Press Enter to send, Shift+Enter for new line</p>
                </div>
              </>
            ) : (
              /* Empty State */
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <MessageCircle className="w-10 h-10 text-indigo-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Select a Conversation</h3>
                <p className="text-sm text-gray-500 max-w-sm">
                  Choose a conversation from the list to start chatting with senders or travelers about your parcels
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
