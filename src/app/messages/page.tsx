'use client';

import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { Search, MoreVertical, Smile } from 'lucide-react';

const CONVERSATIONS = [
  {
    id: 1,
    name: 'Sarah Johnson',
    avatar: 'https://i.pravatar.cc/150?u=sarah',
    lastMessage: 'Thanks for subscribing! Check out my latest workout video 💪',
    online: true,
    active: true,
  },
  {
    id: 2,
    name: 'Marcus Chen',
    avatar: 'https://i.pravatar.cc/150?u=marcus',
    lastMessage: 'New album drops next week! Exclusive preview for VIPs tomorrow.',
    online: true,
    active: false,
  },
  {
    id: 3,
    name: 'Emma Rose',
    avatar: 'https://i.pravatar.cc/150?u=emma',
    lastMessage: 'I loved your feedback on my latest piece! 🎨',
    online: false,
    active: false,
  },
  {
    id: 4,
    name: 'Alex Rivera',
    avatar: 'https://i.pravatar.cc/150?u=alex',
    lastMessage: 'Join my live training session tomorrow at 6 PM',
    online: false,
    active: false,
  },
];

const MESSAGES = [
  {
    id: 1,
    sender: 'Sarah Johnson',
    text: 'Hey! Thanks so much for subscribing to my premium tier! 🎉',
    time: '10:30 AM',
    isMe: false,
  },
  {
    id: 2,
    sender: 'Me',
    text: 'Thanks! I love your content. Looking forward to the exclusive workouts!',
    time: '10:32 AM',
    isMe: true,
  },
  {
    id: 3,
    sender: 'Sarah Johnson',
    text: 'That means a lot! I just uploaded a new 30-day challenge for premium members. Check it out!',
    time: '10:35 AM',
    isMe: false,
  },
  {
    id: 4,
    sender: 'Sarah Johnson',
    text: 'Also, feel free to message me anytime if you have questions about the workouts 💪',
    time: '10:35 AM',
    isMe: false,
  },
  {
    id: 5,
    sender: 'Me',
    text: 'Will do! Thanks for being so responsive 😊',
    time: '10:40 AM',
    isMe: true,
  },
  {
    id: 6,
    sender: 'Sarah Johnson',
    text: 'Thanks for subscribing! Check out my latest workout plan 💪',
    time: '10:42 AM',
    isMe: false,
  },
];

export default function MessagesPage() {
  const { userProfile } = useAuth();
  return (
    <div className="flex min-h-screen bg-[#fdfbfd]" style={{ fontFamily: 'Inter, sans-serif' }}>
      <Sidebar />
      
      <main className={`flex-1 ${userProfile?.role === 'creator' ? '' : 'ml-[276px]'} p-8`}>
        <div className="max-w-6xl mx-auto h-[calc(100vh-64px)] flex flex-col">
          {/* Header */}
          <div className="mb-6 flex-shrink-0">
            <h1 className="text-3xl font-semibold text-[#101828] mb-1">Messages</h1>
            <p className="text-[#475467]">Chat with your favorite creators</p>
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
                     className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow"
                   />
                 </div>
               </div>

               {/* List */}
               <div className="flex-1 overflow-y-auto">
                 {CONVERSATIONS.map((conv) => (
                   <div 
                     key={conv.id} 
                     className={`p-4 flex gap-3 cursor-pointer transition-colors hover:bg-gray-50 ${conv.active ? 'bg-gray-50' : ''}`}
                   >
                     <div className="relative flex-shrink-0">
                       <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                         <img src={conv.avatar} alt={conv.name} className="w-full h-full object-cover" />
                       </div>
                       {conv.online && (
                         <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                       )}
                     </div>
                     <div className="flex-1 min-w-0">
                       <div className="flex justify-between items-start mb-0.5">
                         <h3 className="text-sm font-semibold text-[#101828]">{conv.name}</h3>
                         {/* Optional date could go here */}
                       </div>
                       <p className="text-xs text-[#475467] truncate leading-relaxed">
                         {conv.lastMessage}
                       </p>
                     </div>
                   </div>
                 ))}
               </div>
            </div>

            {/* Active Chat - Right Side */}
            <div className="flex-1 flex flex-col bg-white">
               
               {/* Chat Header */}
               <div className="p-4 border-b border-gray-100 flex justify-between items-center flex-shrink-0">
                  <div className="flex items-center gap-3">
                     <div className="relative">
                       <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                         <img src="https://i.pravatar.cc/150?u=sarah" alt="Sarah Johnson" className="w-full h-full object-cover" />
                       </div>
                       <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                     </div>
                     <div>
                       <h3 className="font-semibold text-[#101828] text-sm">Sarah Johnson</h3>
                       <div className="flex items-center gap-1.5">
                         <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                         <span className="text-xs text-[#475467]">Online</span>
                       </div>
                     </div>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-50">
                    <MoreVertical className="w-5 h-5" />
                  </button>
               </div>

               {/* Messages Area */}
               <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
                  {MESSAGES.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[70%] group`}>
                         <div 
                           className={`px-5 py-3 rounded-2xl text-[14px] leading-relaxed shadow-sm ${
                             msg.isMe 
                               ? 'bg-gradient-to-r from-[#9810fa] to-[#e60076] text-white rounded-tr-none' 
                               : 'bg-white text-[#344054] border border-gray-100 rounded-tl-none'
                           }`}
                         >
                           {msg.text}
                         </div>
                         <div className={`text-[10px] text-gray-400 mt-1.5 ${msg.isMe ? 'text-right' : 'text-left'}`}>
                           {msg.time}
                         </div>
                      </div>
                    </div>
                  ))}
               </div>

               {/* Input Area (Implied by bottom of design, though cut off) */}
               {/* Adding a placeholder input to make it functional/complete UI */}
               {/* <div className="p-4 border-t border-gray-100 bg-white">
                  ...
               </div> */}
               {/* Design cut off at bottom, leaving as view only or adding simple input? 
                   The user said "messages should look like this", implying the view. 
                   I will omit the input for now to strictly match the view space, 
                   or just leave the empty space at bottom as per crop. 
                   Actually, a chat usually has an input. I'll add a clean one to look finished. */}
               
               <div className="p-4 border-t border-gray-100 bg-white flex-shrink-0">
                 <div className="flex gap-3">
                   <div className="flex-1 relative">
                     <input 
                       type="text" 
                       placeholder="Type a message..." 
                       className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                     />
                     <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                       <Smile className="w-5 h-5" />
                     </button>
                   </div>
                 </div>
               </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
