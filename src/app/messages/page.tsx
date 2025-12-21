'use client';

import { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { useMessaging } from '@/hooks/useMessaging';
import { 
  sendMessage, 
  markAsRead, 
  setTypingStatus, 
  setUserOnlineStatus,
} from '@/lib/messaging';
import { Search, MoreVertical, Smile, Send, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Timestamp } from 'firebase/firestore';
import { Conversation } from '@/lib/db';

type ParticipantMetadata = {
  displayName: string;
  photoURL?: string;
};

type UserPresence = {
  state: string;
  last_changed: number;
};

export default function MessagesPage() {
  const { user, userProfile } = useAuth();
  const searchParams = useSearchParams();
  const initialChatId = searchParams.get('chatId');

  const { 
    conversations, 
    activeChatMessages, 
    inboxLoading, 
    messagesLoading,
    typingUsers,
    subscribeToMessages,
    subscribeToUserPresence
  } = useMessaging(user?.uid);

  const [activeChatId, setActiveChatId] = useState<string | null>(initialChatId);
  const [prevInitialChatId, setPrevInitialChatId] = useState<string | null>(initialChatId);

  // Sync activeChatId with URL search parameters during render to avoid cascading renders
  if (initialChatId !== prevInitialChatId) {
    setPrevInitialChatId(initialChatId);
    setActiveChatId(initialChatId);
  }

  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [recipientPresence, setRecipientPresence] = useState<unknown>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find(c => c.id === activeChatId);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChatMessages]);

  // Handle conversation subscription
  useEffect(() => {
    if (!activeChatId) return;

    // Reset presence
    Promise.resolve().then(() => setRecipientPresence(null));

    // Subscribe to messages
    const unsubscribe = subscribeToMessages(activeChatId);

    // Mark as read
    markAsRead(activeChatId, user!.uid);

    // Subscribe to recipient presence
    const recipientId = activeConversation?.participants.find((p: string) => p !== user?.uid);
    let unsubPresence: (() => void) | undefined;
    
    if (recipientId) {
      unsubPresence = subscribeToUserPresence(recipientId, (status: unknown) => {
        setRecipientPresence(status);
      });
    }

    return () => {
      unsubscribe();
      unsubPresence?.();
    };
  }, [activeChatId, activeConversation, subscribeToMessages, subscribeToUserPresence, user]);

  // Set typing status with debounce
  useEffect(() => {
    if (!activeChatId || !user?.uid) return;

    if (messageText.length > 0) {
      setTypingStatus(activeChatId, user.uid, true);
    }

    const timeout = setTimeout(() => {
      if (activeChatId && user?.uid) {
        setTypingStatus(activeChatId, user.uid, false);
      }
    }, 2000);

    return () => {
      clearTimeout(timeout);
      if (activeChatId && user?.uid) {
        setTypingStatus(activeChatId, user.uid, false);
      }
    };
  }, [messageText, activeChatId, user]);

  // Set user online status
  useEffect(() => {
    if (user?.uid) {
      setUserOnlineStatus(user.uid);
    }
  }, [user]);

  // Keyboard shortcuts
  useEffect(() => {
    const handlers: Record<string, (e: KeyboardEvent) => void> = {
      'p': (e: KeyboardEvent) => (e.metaKey || e.ctrlKey) && (e.preventDefault(), setSearchQuery('')),
      'n': (e: KeyboardEvent) => (e.metaKey || e.ctrlKey) && (e.preventDefault(), setMessageText('')),
    };
    const handleKeyDown = (e: KeyboardEvent) => handlers[e.key]?.(e);
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeChatId || !user?.uid) return;

    const recipientId = activeConversation?.participants.find((p: string) => p !== user.uid);
    if (!recipientId) return;

    const text = messageText;
    setMessageText(''); // Clear input instantly (Optimistic UI)

    try {
      await sendMessage(activeChatId, user.uid, recipientId, text);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const filteredConversations = !user?.uid ? [] : conversations.filter((conv: Conversation) => {
    const otherUser = Object.entries(conv.participantMetadata).find(([id]) => id !== user?.uid)?.[1] as ParticipantMetadata;
    return otherUser?.displayName?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="flex min-h-screen bg-[#fdfbfd]" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Sidebar />
      
      <main className={`flex-1 ${userProfile?.role === 'creator' ? '' : 'ml-[276px]'} p-8`}>
        <div className="max-w-6xl mx-auto h-[calc(100vh-64px)] flex flex-col">
          {/* Header */}
          <div className="mb-6 flex-shrink-0">
            <h1 className="text-3xl font-semibold text-[#101828] mb-1">Messages</h1>
            <p className="text-[#475467]">
              {userProfile?.role === 'creator' ? 'Chat with your subscribers' : 'Chat with your favorite creators'}
            </p>
          </div>

          {/* Chat Interface */}
          <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex min-h-0">
            
            {/* Conversations List - Left Side */}
            <div className="w-[320px] border-r border-gray-200 flex flex-col">
               {/* Search */}
               <div className="p-4 border-b border-gray-100">
                 <div className="relative">
                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                   <input 
                     type="text" 
                     placeholder="Search messages..." 
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#101828] placeholder-[#98a2b3] focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow"
                   />
                 </div>
               </div>

               {/* List */}
                <div className="flex-1 overflow-y-auto">
                  {inboxLoading || !user?.uid ? (
                    <div className="p-8 text-center text-gray-400 text-sm">Loading chats...</div>
                  ) : filteredConversations.length === 0 ? (
                   <div className="p-8 text-center text-gray-400 text-sm">No conversations found</div>
                 ) : (
                   filteredConversations.map((conv: Conversation) => {
                     const otherUser = Object.entries(conv.participantMetadata).find(([id]) => id !== user?.uid)?.[1] as ParticipantMetadata;
                     const isActive = conv.id === activeChatId;
                     const hasUnread = (conv.unreadCount?.[user?.uid || ''] || 0) > 0;

                     return (
                       <div 
                         key={conv.id} 
                         onClick={() => setActiveChatId(conv.id)}
                         className={`p-4 flex gap-3 cursor-pointer transition-colors hover:bg-gray-50 ${isActive ? 'bg-gray-50' : ''}`}
                       >
                         <div className="relative flex-shrink-0">
                           <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden relative">
                             <Image 
                               src={otherUser?.photoURL || 'https://i.pravatar.cc/150'} 
                               alt={otherUser?.displayName || 'User'} 
                               fill
                               className="object-cover" 
                             />
                           </div>
                         </div>
                         <div className="flex-1 min-w-0">
                           <div className="flex justify-between items-start mb-0.5">
                             <h3 className={`text-sm ${hasUnread ? 'font-bold' : 'font-semibold'} text-[#101828]`}>
                               {otherUser?.displayName}
                             </h3>
                             {conv.lastTimestamp && (
                               <span className="text-[10px] text-gray-400">
                                 {format(conv.lastTimestamp instanceof Timestamp ? conv.lastTimestamp.toDate() : new Date(), 'h:mm a')}
                               </span>
                             )}
                           </div>
                           <p className={`text-xs ${hasUnread ? 'text-[#101828] font-medium' : 'text-[#475467]'} truncate leading-relaxed`}>
                             {conv.lastMessage}
                           </p>
                         </div>
                         {hasUnread && (
                           <div className="w-2 h-2 bg-purple-600 rounded-full self-center"></div>
                         )}
                       </div>
                     );
                   })
                 )}
               </div>
            </div>

            {/* Active Chat - Right Side */}
            <div className="flex-1 flex flex-col bg-white">
               {activeChatId ? (
                 <>
                   {/* Chat Header */}
                   <div className="p-4 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
                      <div className="flex items-center gap-3">
                         <div className="relative">
                           <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden relative">
                              <Image 
                                src={(Object.entries(activeConversation?.participantMetadata || {}).find(([id]) => id !== user?.uid)?.[1] as ParticipantMetadata)?.photoURL || 'https://i.pravatar.cc/150'} 
                                alt="Recipient" 
                                fill
                                className="object-cover" 
                              />
                            </div>
                            {(recipientPresence as UserPresence)?.state === 'online' && (
                              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                            )}
                         </div>
                          <div>
                            <h3 className="font-semibold text-[#101828] text-sm">
                              {(Object.entries(activeConversation?.participantMetadata || {}).find(([id]) => id !== user?.uid)?.[1] as ParticipantMetadata)?.displayName}
                            </h3>
                            <div className="flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${(recipientPresence as UserPresence)?.state === 'online' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                              <span className="text-xs text-[#475467]">
                                {(recipientPresence as UserPresence)?.state === 'online' ? 'Online' : 'Offline'}
                              </span>
                            </div>
                          </div>
                      </div>
                      <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                   </div>

                   {/* Messages Area */}
                   <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
                      {messagesLoading ? (
                        <div className="text-center text-gray-400 text-sm py-8">Loading history...</div>
                      ) : activeChatMessages.map((msg) => {
                        const isMe = msg.senderId === user?.uid;
                        return (
                          <div 
                            key={msg.id} 
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`max-w-[70%] group`}>
                               <div 
                                 className={`px-5 py-3 rounded-2xl text-[14px] leading-relaxed shadow-sm ${
                                   isMe 
                                     ? 'bg-gradient-to-r from-[#9810fa] to-[#e60076] text-white rounded-tr-none' 
                                     : 'bg-white text-[#344054] border border-gray-100 rounded-tl-none'
                                 }`}
                               >
                                 {msg.text}
                               </div>
                               <div className={`text-[10px] text-gray-400 mt-1.5 ${isMe ? 'text-right' : 'text-left'}`}>
                                 {msg.timestamp instanceof Timestamp ? format(msg.timestamp.toDate(), 'h:mm a') : 'Sending...'}
                               </div>
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* Typing indicator */}
                      {Object.entries(typingUsers).map(([uid, isTyping]) => {
                        if (uid !== user?.uid && isTyping) {
                          return (
                            <div key={uid} className="flex justify-start">
                              <div className="bg-white border border-gray-100 px-4 py-2 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                                <div className="flex gap-1">
                                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                                  <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                                </div>
                                <span className="text-[10px] text-gray-400">Typing...</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      })}
                      
                      <div ref={messagesEndRef} />
                   </div>

                   {/* Input Area */}
                   <div className="p-4 border-t border-gray-100 bg-white flex-shrink-0">
                      <form onSubmit={handleSendMessage} className="flex gap-3">
                        <div className="flex-1 relative">
                          <input 
                            type="text" 
                            value={messageText}
                            onChange={(e) => setMessageText(e.target.value)}
                            placeholder="Type a message..." 
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#101828] placeholder-[#98a2b3] focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                          <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            <Smile className="w-5 h-5" />
                          </button>
                        </div>
                        <button 
                          type="submit"
                          disabled={!messageText.trim()}
                          className="p-2.5 bg-gradient-to-r from-[#9810fa] to-[#e60076] text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </form>
                   </div>
                 </>
               ) : (
                 <div className="flex-1 flex flex-col items-center justify-center bg-gray-50/30 p-8 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <MessageSquare className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a conversation</h3>
                    <p className="text-sm text-gray-500 max-w-xs">
                      Choose from your existing conversations on the left to start chatting.
                    </p>
                 </div>
               )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


