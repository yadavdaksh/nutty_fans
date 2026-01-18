'use client';

import { useState, useEffect, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { useMessaging } from '@/hooks/useMessaging';
import { useStorage } from '@/hooks/useStorage';
import { useUsersInfo } from '@/hooks/useUsersInfo';
import { 
  sendMessage, 
  markAsRead, 
  setTypingStatus, 
  setUserOnlineStatus,
  unlockMessage
} from '@/lib/messaging';
import { db, getWalletBalance, processTransaction, CreatorProfile, Conversation } from '@/lib/db';
import { toast } from 'react-hot-toast';
import { Search, MoreVertical, Smile, Send, MessageSquare, Image as ImageIcon, Lock, X, Camera, Phone, Video, Loader2 } from 'lucide-react';
import { useCall } from '@/hooks/useCall';
import WatermarkMedia from '@/components/WatermarkMedia';
import { format } from 'date-fns';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Timestamp, doc, onSnapshot } from 'firebase/firestore';

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

  const { startCall, loading: callLoading } = useCall();

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
  
  // Image Upload State
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [price, setPrice] = useState<string>('');
  const [unlockingMessageId, setUnlockingMessageId] = useState<string | null>(null);

  // Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeConversation = conversations.find(c => c.id === activeChatId);

  // Live User Updates
  const allParticipantIds = conversations.flatMap(c => c.participants).filter(id => id !== user?.uid);
  const { users: liveUsers } = useUsersInfo(allParticipantIds);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView();
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


  // Real-time Creator Profile for Call Prices & Availability
  const [recipientCreatorProfile, setRecipientCreatorProfile] = useState<CreatorProfile | null>(null);
  
  useEffect(() => {
    const recipientId = activeConversation?.participants.find((p: string) => p !== user?.uid);
    
    if (!recipientId) {
      setRecipientCreatorProfile(null);
      return;
    }

    // Subscribe to Creator Profile changes in real-time
    const creatorRef = doc(db, 'creators', recipientId);
    const unsubscribe = onSnapshot(creatorRef, (docSnap) => {
      if (docSnap.exists()) {
        setRecipientCreatorProfile(docSnap.data() as CreatorProfile);
      } else {
        setRecipientCreatorProfile(null);
      }
    }, (error) => {
      console.error("Error listening to creator profile:", error);
    });

    return () => unsubscribe();
  }, [activeChatId, activeConversation, user]);

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

  const { uploadFile, isUploading } = useStorage();
  const fileInputRef = useRef<HTMLInputElement>(null);




  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPendingFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setIsLocked(false);
      setPrice('');
    }
    // Reset input so validation logic doesn't block re-selecting same file
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const cancelUpload = () => {
    setPendingFile(null);
    setPreviewUrl(null);
    setIsLocked(false);
    setPrice('');
  };

  const handleSendImage = async () => {
    if (!pendingFile || !activeChatId || !user?.uid) return;

    const recipientId = activeConversation?.participants.find((p: string) => p !== user.uid);
    if (!recipientId) return;

    try {
      // 1. Upload Image
      const timestamp = Date.now();
      const path = `messages/${activeChatId}/${timestamp}_${pendingFile.name}`;
      const downloadURL = await uploadFile(pendingFile, path);

      // 2. Send Image Message
      const priceValue = isLocked && price ? parseFloat(price) : undefined;
      await sendMessage(activeChatId, user.uid, recipientId, downloadURL, 'image', isLocked, priceValue);
      
      cancelUpload();
    } catch (error) {
      console.error("Error sending image:", error);
      alert("Failed to upload image. Please try again.");
    }
  };

  const handleUnlock = async (messageId: string, price: number) => {
    if (!activeChatId || !user?.uid) return;
    
    // Check Price
    const priceCents = Math.round(price * 100);

    // 1. Check Wallet Balance
    const balance = await getWalletBalance(user.uid);
    if (balance < priceCents) {
       toast.error(`Insufficient wallet balance. You need $${price.toFixed(2)}.`);
       // Optional: Router push to wallet?
       return;
    }

    const confirmUnlock = window.confirm(`Unlock for $${price.toFixed(2)}? This will be deducted from your wallet.`);
    if (!confirmUnlock) return;

    setUnlockingMessageId(messageId);
    try {
      // 2. Process Transaction
      const recipientId = activeConversation?.participants.find(p => p !== user.uid);
      await processTransaction(
        user.uid,
        priceCents,
        `Unlock message`,
        { contentType: 'message_unlock', contentId: messageId, creatorId: recipientId, category: 'message_unlock' }
      );
      
      // 3. Unlock Content
      await unlockMessage(activeChatId, messageId, user.uid);
      toast.success("Content unlocked!");
    } catch (error) {
      console.error("Error unlocking message:", error);
      toast.error("Failed to unlock message.");
    } finally {
      setUnlockingMessageId(null);
    }
  };

  const startCamera = async () => {
    try {
      setIsCameraOpen(true);
      // Give React a moment to render the video element
      setTimeout(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          streamRef.current = stream;
        }
      }, 100);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please allow camera permissions.");
      setIsCameraOpen(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        canvas.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], `camera_${Date.now()}.jpg`, { type: "image/jpeg" });
                setPendingFile(file);
                setPreviewUrl(URL.createObjectURL(file));
                setIsLocked(false);
                setPrice('');
                stopCamera();
            }
        }, 'image/jpeg');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !activeChatId || !user?.uid) return;

    const recipientId = activeConversation?.participants.find((p: string) => p !== user.uid);
    if (!recipientId) return;

    const text = messageText;
    setMessageText(''); // Clear input instantly (Optimistic UI)

    try {
      await sendMessage(activeChatId, user.uid, recipientId, text, 'text');
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
                     // Get static metadata
                     const otherUserMeta = Object.entries(conv.participantMetadata).find(([id]) => id !== user?.uid);
                     const otherUserId = otherUserMeta?.[0];
                     const otherUserStatic = otherUserMeta?.[1] as ParticipantMetadata;

                     // Prefer live data if available
                     const liveUser = otherUserId ? liveUsers[otherUserId] : null;
                     const displayPhoto = liveUser?.photoURL || otherUserStatic?.photoURL || 'https://i.pravatar.cc/150';
                     const displayName = liveUser?.displayName || otherUserStatic?.displayName || 'User';

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
                               src={displayPhoto} 
                               alt={displayName} 
                               fill
                               className="object-cover" 
                             />
                           </div>
                         </div>
                         <div className="flex-1 min-w-0">
                           <div className="flex justify-between items-start mb-0.5">
                             <h3 className={`text-sm ${hasUnread ? 'font-bold' : 'font-semibold'} text-[#101828]`}>
                               {displayName}
                             </h3>
                             {conv.lastTimestamp && (
                               <span className="text-[10px] text-gray-400">
                                 {format(conv.lastTimestamp instanceof Timestamp ? conv.lastTimestamp.toDate() : new Date(), 'h:mm a')}
                               </span>
                             )}
                           </div>
                            <p className={`text-xs ${hasUnread ? 'text-[#101828] font-medium' : 'text-[#475467]'} truncate leading-relaxed flex items-center gap-1`}>
                              {conv.lastMessageType === 'image' || (!conv.lastMessageType && conv.lastMessage && conv.lastMessage.startsWith('https://firebasestorage')) ? (
                                <>
                                  <ImageIcon className="w-3 h-3" />
                                  <span>Image</span>
                                </>
                              ) : (
                                conv.lastMessage
                              )}
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
                             {(() => {
                               const otherUserId = activeConversation?.participants.find(id => id !== user?.uid);
                               const liveUser = otherUserId ? liveUsers[otherUserId] : null;
                               const staticMeta = otherUserId ? activeConversation?.participantMetadata[otherUserId] : null;

                               return (
                                 <Image 
                                   src={liveUser?.photoURL || staticMeta?.photoURL || 'https://i.pravatar.cc/150'} 
                                   alt="Recipient" 
                                   fill
                                   className="object-cover" 
                                 />
                               );
                             })()}
                            </div>

                         </div>
                          <div>
                            <h3 className="font-semibold text-[#101828] text-sm">
                              {(() => {
                                const otherUserId = activeConversation?.participants.find(id => id !== user?.uid);
                                const liveUser = otherUserId ? liveUsers[otherUserId] : null;
                                const staticMeta = otherUserId ? activeConversation?.participantMetadata[otherUserId] : null;
                                return liveUser?.displayName || staticMeta?.displayName || 'User';
                              })()}
                            </h3>
                            <div className="flex items-center gap-1.5">
                              <span className={`w-1.5 h-1.5 rounded-full ${(recipientPresence as UserPresence)?.state === 'online' ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                              <span className="text-xs text-[#475467]">
                                {(recipientPresence as UserPresence)?.state === 'online' ? 'Online' : 'Offline'}
                              </span>
                            </div>
                          </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {(() => {
                           const recipientId = activeConversation?.participants.find((p: string) => p !== user?.uid);
                           const recipientUser = recipientId ? liveUsers[recipientId] : null;
                           const isRecipientCreator = recipientUser?.role === 'creator';
                           
                           const isCallsEnabled = recipientCreatorProfile?.isCallsEnabled !== false;
                           
                           if (userProfile?.role === 'creator' || !isRecipientCreator || !isCallsEnabled) return null;

                           const audioPrice = recipientCreatorProfile?.callPrices?.audioPerMinute ?? 2.00;
                           const videoPrice = recipientCreatorProfile?.callPrices?.videoPerMinute ?? 5.00;

                           return (
                             <>
                               {/* Audio Call Button */}
                               {audioPrice > 0 && (
                                 <div className="group relative">
                                   <button 
                                     onClick={() => {
                                       if (recipientId && user?.uid) {
                                           startCall(
                                             user.uid, 
                                             recipientId, 
                                             'audio', 
                                             audioPrice, 
                                             user.displayName || 'User',
                                             user.photoURL || undefined
                                           );
                                       }
                                     }}
                                     disabled={callLoading}
                                     className="p-2 text-gray-400 hover:text-purple-600 rounded-full hover:bg-purple-50 transition-colors disabled:opacity-50"
                                     title="Start Audio Call"
                                   >
                                     {callLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Phone className="w-5 h-5" />}
                                   </button>
                                   <span className="absolute top-full right-0 mt-1 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                     ${audioPrice.toFixed(2)}/min
                                   </span>
                                 </div>
                               )}

                               {/* Video Call Button */}
                               {videoPrice > 0 && (
                                 <div className="group relative">
                                   <button 
                                     onClick={() => {
                                       if (recipientId && user?.uid) {
                                           startCall(
                                             user.uid, 
                                             recipientId, 
                                             'video', 
                                             videoPrice,
                                             user.displayName || 'User',
                                             user.photoURL || undefined
                                           );
                                       }
                                     }}
                                     disabled={callLoading}
                                     className="p-2 text-gray-400 hover:text-purple-600 rounded-full hover:bg-purple-50 transition-colors disabled:opacity-50"
                                     title="Start Video Call"
                                   >
                                     {callLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Video className="w-5 h-5" />}
                                   </button>
                                   <span className="absolute top-full right-0 mt-1 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
                                     ${videoPrice.toFixed(2)}/min
                                   </span>
                                 </div>
                               )}
                             </>
                           );
                        })()}
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50">
                          <MoreVertical className="w-5 h-5" />
                        </button>
                      </div>
                   </div>

                   {/* Messages Area */}
                   <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
                      {messagesLoading ? (
                        <div className="text-center text-gray-400 text-sm py-8">Loading history...</div>
                      ) : activeChatMessages.map((msg) => {
                        if (msg.type === 'call') {
                          return (
                            <div key={msg.id} className="flex justify-center my-4">
                              <div className="flex items-center gap-2 px-4 py-1.5 bg-gray-100 rounded-full text-xs font-semibold text-gray-500 shadow-sm border border-gray-200">
                                {msg.text.toLowerCase().includes('video') ? (
                                  <Video className="w-3 h-3 text-purple-600" />
                                ) : (
                                  <Phone className="w-3 h-3 text-purple-600" />
                                )}
                                <span>{msg.text}</span>
                                <span className="text-gray-400 font-normal ml-1 border-l border-gray-300 pl-2">
                                  {msg.timestamp instanceof Timestamp ? format(msg.timestamp.toDate(), 'h:mm a') : ''}
                                </span>
                              </div>
                            </div>
                          );
                        }

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
                                 } overflow-hidden`}
                               >
                                 {msg.type === 'image' ? (
                                   <div className="relative w-60 h-60 -mx-2 -my-1 rounded-lg overflow-hidden bg-gray-100">
                                     {(() => {
                                       const isLocked = msg.isLocked;
                                       const isUnlocked = isMe || (msg.unlockedBy && msg.unlockedBy.includes(user?.uid || ''));
                                       
                                       // Check purchase status for the creator (sender)
                                       if (isMe && isLocked) {
                                          const recipientId = activeConversation?.participants.find(p => p !== user?.uid);
                                          const isPurchased = recipientId && msg.unlockedBy?.includes(recipientId);
                                          
                                          return (
                                            <>
                                              <WatermarkMedia
                                                src={msg.text}
                                                alt="Shared image"
                                                className="w-full h-full object-cover opacity-90"
                                                watermarkText={user?.displayName || 'Private Content'}
                                              />
                                              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-[1px]">
                                                <div className="bg-black/60 rounded-full px-3 py-1 mb-2 flex items-center gap-1.5 backdrop-blur-md">
                                                  <Lock className="w-3 h-3 text-white" />
                                                  <span className="text-white text-xs font-medium">${msg.price}</span>
                                                </div>
                                                <div className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1.5 ${isPurchased ? 'bg-green-500 text-white' : 'bg-white/90 text-gray-600'}`}>
                                                  {isPurchased ? (
                                                    <>
                                                      <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                                                      <span>Purchased</span>
                                                    </>
                                                  ) : (
                                                    <>
                                                      <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                                                      <span>Pending</span>
                                                    </>
                                                  )}
                                                </div>
                                              </div>
                                            </>
                                          );
                                       }

                                       if (isLocked && !isUnlocked) {
                                         return (
                                           <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/10 backdrop-blur-md z-10 p-4 text-center">
                                              <Lock className="w-8 h-8 text-white mb-2" />
                                              <p className="text-white font-bold text-sm mb-3">
                                                Locked Content
                                              </p>
                                              <button 
                                                onClick={() => msg.id && msg.price && handleUnlock(msg.id, msg.price)}
                                                disabled={unlockingMessageId === msg.id}
                                                className="px-4 py-2 bg-white text-purple-600 rounded-full text-xs font-bold hover:bg-gray-100 transition-colors shadow-lg flex items-center gap-2"
                                              >
                                                {unlockingMessageId === msg.id ? (
                                                  <div className="w-3 h-3 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                  <span>Unlock for ${msg.price}</span>
                                                )}
                                              </button>
                                           </div>
                                         );
                                       }

                                       return (
                                          <WatermarkMedia
                                            src={msg.text} // In 'image' type, 'text' field holds the URL
                                            alt="Shared image"
                                            className={`w-full h-full object-cover ${isLocked && !isUnlocked ? 'blur-xl' : ''}`}
                                            watermarkText={user?.displayName || 'Private Content'}
                                          />
                                       );
                                     })()}
                                   </div>
                                 ) : msg.text}
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
                        {userProfile?.role === 'creator' && (
                          <>
                            <input 
                              type="file" 
                              ref={fileInputRef}
                              onChange={handleFileChange}
                              className="hidden" 
                              accept="image/*"
                            />
                            <button 
                              type="button" 
                              onClick={handleImageClick}
                              disabled={isUploading}
                              className="p-2.5 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                              {isUploading ? <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                            </button>
                            <button 
                              type="button" 
                              onClick={startCamera}
                              disabled={isUploading}
                              className="p-2.5 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                              <Camera className="w-5 h-5" />
                            </button>
                          </>
                        )}
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



               {/* Camera Modal */}
               {isCameraOpen && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
                    <div className="relative w-full max-w-2xl bg-black rounded-3xl overflow-hidden shadow-2xl flex flex-col">
                      <div className="relative aspect-[4/3] bg-black">
                        <video 
                          ref={videoRef} 
                          autoPlay 
                          playsInline 
                          className="w-full h-full object-cover"
                        />
                         <button 
                          onClick={stopCamera}
                          className="absolute top-4 right-4 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-md transition-colors"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      </div>
                      
                      <div className="p-6 flex items-center justify-center gap-8 bg-gray-900 border-t border-white/10">
                         <button 
                           onClick={capturePhoto}
                           className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center p-1 hover:scale-105 transition-transform"
                         >
                           <div className="w-full h-full bg-white rounded-full"></div>
                         </button>
                      </div>
                    </div>
                 </div>
               )}

               {/* Image Upload Modal */}
               {pendingFile && activeChatId && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                   <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                     <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                       <h3 className="font-semibold text-gray-900">Send Image</h3>
                       <button onClick={cancelUpload} className="text-gray-400 hover:text-gray-600 p-1">
                         <X className="w-5 h-5" />
                       </button>
                     </div>
                     
                     <div className="p-6">
                       <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-100 mb-6 border border-gray-200">
                         {previewUrl && (
                           <Image 
                             src={previewUrl} 
                             alt="Preview" 
                             fill 
                             className="object-contain" 
                           />
                         )}
                       </div>
                       
                       {userProfile?.role === 'creator' && (
                         <div className="mb-6 space-y-4">
                           <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                             <div className="flex items-center gap-3">
                               <div className={`p-2 rounded-lg ${isLocked ? 'bg-purple-100 text-purple-600' : 'bg-gray-200 text-gray-500'}`}>
                                 <Lock className="w-5 h-5" />
                               </div>
                               <div>
                                 <p className="text-sm font-semibold text-gray-900">Paid Content</p>
                                 <p className="text-xs text-gray-500">Lock this image behind a paywall</p>
                               </div>
                             </div>
                             
                             <button 
                               type="button"
                               onClick={() => setIsLocked(!isLocked)}
                               className={`relative w-11 h-6 rounded-full transition-colors ${isLocked ? 'bg-purple-600' : 'bg-gray-300'}`}
                             >
                               <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${isLocked ? 'translate-x-5' : 'translate-x-0'}`} />
                             </button>
                           </div>
                           
                           {isLocked && (
                             <div className="animate-in slide-in-from-top-2 duration-200">
                               <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                                 Price ($)
                               </label>
                               <div className="relative">
                                 <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                                 <input 
                                   type="number" 
                                   min="1"
                                   step="0.01"
                                   value={price}
                                   onChange={(e) => setPrice(e.target.value)}
                                   placeholder="5.00"
                                   className="w-full pl-7 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-medium"
                                 />
                               </div>
                             </div>
                           )}
                         </div>
                       )}

                       <div className="flex gap-3">
                         <button 
                           onClick={cancelUpload}
                           className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                         >
                           Cancel
                         </button>
                         <button 
                           onClick={handleSendImage}
                           disabled={isUploading || (isLocked && !price)}
                           className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#9810fa] to-[#e60076] text-white font-semibold rounded-xl hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center gap-2"
                         >
                           {isUploading ? (
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                           ) : (
                             <>
                               <Send className="w-4 h-4" />
                               <span>Send {isLocked && price ? `for $${price}` : ''}</span>
                             </>
                           )}
                         </button>
                       </div>
                     </div>
                   </div>
                 </div>
               )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


