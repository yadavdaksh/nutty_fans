'use client';

import { useState, FormEvent } from 'react';
import { useChat } from '@livekit/components-react';
import { useAuth } from '@/context/AuthContext';
import { getWalletBalance, processTransaction, recordStreamEarning } from '@/lib/db';
import { toast } from 'react-hot-toast';
import { Send, DollarSign, Loader2, Coins } from 'lucide-react';
import RechargeModal from './RechargeModal';


interface LiveChatProps {
  streamId: string; // The LiveKit room name is essentially the stream ID
  creatorId: string;
  chatPrice: number; // Price per message in dollars (0 if free)
}

export default function LiveChat({ streamId, creatorId, chatPrice }: LiveChatProps) {
  const { chatMessages, send, isSending } = useChat();
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Handling Tips
  const [showTipInput, setShowTipInput] = useState(false);
  const [tipAmount, setTipAmount] = useState('5');
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  
  const handleSend = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!message.trim() || !user || isSending || isProcessing) return;

    setIsProcessing(true);
    try {
      if (chatPrice > 0) {
        // 1. Process Message Payment
        const priceCents = Math.round(chatPrice * 100);
        
        // 1.1 Check Balance
        const balance = await getWalletBalance(user.uid);
        if (balance < priceCents) {
            setShowRechargeModal(true);
            setIsProcessing(false);
            return;
        }

        // 1.2 Deduct
        await processTransaction(
            user.uid,
            priceCents,
            `Paid message in stream`,
            { streamId, creatorId, category: 'stream_chat' }
        );

        // 1.3 Record Earning for Stream
        await recordStreamEarning(creatorId, priceCents);
      }

      // 2. Send via LiveKit
      await send(message);
      setMessage('');
    } catch (err) {
      console.error(err);
      toast.error('Failed to send message');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTip = async () => {
      if(!tipAmount || isProcessing || !user) return;
      const amount = parseFloat(tipAmount);
      if(isNaN(amount) || amount <= 0) {
          toast.error("Invalid tip amount");
          return;
      }
      
      setIsProcessing(true);
      try {
          const priceCents = Math.round(amount * 100);

          // Check Balance
          const balance = await getWalletBalance(user.uid);
          if (balance < priceCents) {
              setShowRechargeModal(true);
              setIsProcessing(false);
              return;
          }
          
          await processTransaction(
            user.uid,
            priceCents,
            `Tip to creator`,
            { streamId, creatorId, category: 'tip' }
          );
          
          await recordStreamEarning(creatorId, priceCents);
          
          // Send a special "System" like message or just a highlighted message
          // LiveKit messages are just text. We can prefix it.
          await send(`🎉 TIPPED $${amount.toFixed(2)}: ${message || 'Keep it up!'}`);
          
          setShowTipInput(false);
          setMessage('');
          toast.success(`Sent $${amount} tip!`);
      } catch (err) {
          console.error(err);
          toast.error("Tip failed. Please try again.");
      } finally {
          setIsProcessing(false);
      }
  };


  return (
    <div className="flex flex-col h-full bg-gray-900 border-l border-gray-800">
      {/* Header */}
      <div className="p-4 border-b border-gray-800 text-white font-bold flex justify-between items-center">
        <span>Live Chat</span>
        {chatPrice > 0 && <span className="text-xs bg-purple-600 px-2 py-1 rounded text-white">${chatPrice}/msg</span>}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.length === 0 && (
            <div className="text-center text-gray-500 mt-10 text-sm">No messages yet. Say hi!</div>
        )}
        {chatMessages.map((msg) => {
            const isTip = msg.message.includes('🎉 TIPPED');
            return (
              <div key={msg.timestamp} className={`text-sm ${isTip ? 'bg-yellow-500/10 p-2 rounded-lg border border-yellow-500/20' : ''}`}>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className={`font-bold ${isTip ? 'text-yellow-500' : 'text-purple-400'}`}>
                    {msg.from?.name || 'Viewer'}
                  </span>
                  <span className="text-xs text-gray-600">
                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
                <p className={`text-gray-300 break-words ${isTip ? 'font-medium text-yellow-100' : ''}`}>
                    {msg.message}
                </p>
              </div>
            );
        })}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-gray-900 border-t border-gray-800">
        {!showTipInput ? (
            <form onSubmit={handleSend} className="flex gap-2">
                <button
                    type="button"
                    onClick={() => setShowTipInput(true)}
                    className="p-3 bg-gray-800 hover:bg-gray-700 text-yellow-500 rounded-xl transition-colors"
                    title="Send Tip"
                >
                    <Coins className="w-5 h-5" />
                </button>
                <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={chatPrice > 0 ? `Message ($${chatPrice})...` : "Type a message..."}
                    className="flex-1 bg-gray-800 text-white px-4 rounded-xl focus:ring-2 focus:ring-purple-600 outline-none border border-gray-700 placeholder-gray-500"
                />
                <button 
                  type="submit"
                  disabled={isProcessing || !message.trim()}
                  className="bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white p-3 rounded-xl transition-colors font-bold flex items-center gap-2"
                >
                    {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    {chatPrice > 0 && <span className="text-xs">${chatPrice}</span>}
                </button>
            </form>
        ) : (
            <div className="bg-gray-800 p-3 rounded-xl animate-in slide-in-from-bottom-2">
                <div className="flex justify-between items-center mb-3">
                    <span className="text-yellow-500 font-bold flex items-center gap-1">
                        <Coins className="w-4 h-4" /> Send Tip
                    </span>
                    <button onClick={() => setShowTipInput(false)} className="text-gray-400 hover:text-white text-xs">Cancel</button>
                </div>
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="number"
                            value={tipAmount}
                            onChange={(e) => setTipAmount(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:ring-1 focus:ring-yellow-500 outline-none"
                            placeholder="Amount"
                        />
                    </div>
                    <button 
                        onClick={handleTip}
                        disabled={isProcessing}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg font-bold disabled:opacity-50"
                    >
                        {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Tip'}
                    </button>
                </div>
            </div>
        )}
      </div>
      <RechargeModal 
        isOpen={showRechargeModal} 
        onClose={() => setShowRechargeModal(false)} 
      />
    </div>
  );
}

