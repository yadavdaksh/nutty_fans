'use client';

import { useState } from 'react';
import { Send, Loader2, Mail, Users, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

export default function CreatorNewsletterPage() {
  const { user } = useAuth();
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [target, setTarget] = useState<'active' | 'past' | 'all'>('active');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [lastSentCount, setLastSentCount] = useState(0);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !content) {
      toast.error('Please fill in all fields');
      return;
    }
    
    if (!user) {
        toast.error('You must be logged in');
        return;
    }

    const confirmSend = window.confirm(`Are you sure you want to send this to ${target === 'all' ? 'ALL' : target} members? This action cannot be undone.`);
    if (!confirmSend) return;

    setLoading(true);
    try {
      const res = await fetch('/api/newsletter/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            subject, 
            content, 
            target,
            creatorId: user.uid 
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to send newsletter');
      
      setLastSentCount(data.count);
      setSuccess(true);
      toast.success('Newsletter sent successfully!');
      setSubject('');
      setContent('');
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message || 'Failed to send newsletter');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] py-12 px-4 sm:px-6 lg:px-8 font-inter">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-bold text-[#101828] mb-2 flex items-center justify-center sm:justify-start gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Mail className="w-6 h-6 text-purple-600" />
            </div>
            Member Newsletter
          </h1>
          <p className="text-[#475467] text-lg max-w-2xl">
            Keep your subscribers engaged with exclusive updates, behind-the-scenes content, and special offers.
          </p>
        </div>

        {success ? (
          <div className="bg-white border border-green-100 rounded-3xl p-12 text-center shadow-lg animate-in zoom-in duration-300">
             <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-green-50/50">
                <CheckCircle2 className="w-10 h-10 text-green-600" />
             </div>
             <h2 className="text-2xl font-bold text-gray-900 mb-2">Sent Successfully!</h2>
             <p className="text-gray-600 mb-8 font-medium max-w-sm mx-auto">
               Your newsletter has been queued and is being sent to <span className="text-gray-900 font-bold">{lastSentCount}</span> {target === 'all' ? 'total' : target} members.
             </p>
             <button 
               onClick={() => setSuccess(false)}
               className="px-8 py-3 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-xl font-bold transition-all shadow-sm"
             >
               Send Another Update
             </button>
          </div>
        ) : (
          <form onSubmit={handleSend} className="bg-white rounded-[24px] border border-gray-200 shadow-xl shadow-gray-100/50 overflow-hidden">
            {/* Audience Selector */}
            <div className="p-8 border-b border-gray-100 bg-gray-50/50">
               <h3 className="text-sm font-bold text-[#344054] uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
                  Select Audience
               </h3>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(['active', 'past', 'all'] as const).map((g) => {
                    const isActive = target === g;
                    return (
                      <div key={g} className="relative group">
                          <input
                              type="radio"
                              name="target"
                              id={`target-${g}`}
                              value={g}
                              checked={isActive}
                              onChange={() => setTarget(g)}
                              className="peer sr-only"
                          />
                          <label 
                              htmlFor={`target-${g}`}
                              className={`block p-5 h-full border rounded-2xl cursor-pointer transition-all duration-200 ${
                                isActive 
                                  ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-500 shadow-sm' 
                                  : 'bg-white border-gray-200 hover:border-purple-200 hover:bg-purple-50/30'
                              }`}
                          >
                              <div className="flex items-center justify-between mb-2">
                                <span className={`font-bold capitalize text-lg ${isActive ? 'text-purple-900' : 'text-gray-700'}`}>
                                  {g === 'active' ? 'Current' : g === 'past' ? 'Past' : 'All'}
                                </span>
                                {isActive && <Users className="w-5 h-5 text-purple-600" />}
                              </div>
                              <p className={`text-sm ${isActive ? 'text-purple-700' : 'text-gray-500'}`}>
                                  {g === 'active' && 'Active subscribers with current access.'}
                                  {g === 'past' && 'Users who cancelled or expired.'}
                                  {g === 'all' && 'Reach your entire audience history.'}
                              </p>
                          </label>
                      </div>
                    );
                  })}
               </div>
            </div>

            <div className="p-8 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-[#344054] mb-2">Subject Line</label>
                  <input 
                      type="text"
                      placeholder="e.g. 🎁 Special Gift for my subscribers!"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all font-medium text-gray-900 placeholder:text-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#344054] mb-2">Message Content</label>
                  <div className="relative group">
                      <textarea 
                          rows={12}
                          placeholder="Write your update here...&#10;&#10;Supports basic HTML for formatting."
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          className="w-full px-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all font-inter text-gray-900 resize-y placeholder:text-gray-400 min-h-[300px]"
                      />
                      <div className="absolute bottom-4 right-4 text-xs font-medium text-gray-400 bg-white/50 px-2 py-1 rounded-md backdrop-blur-sm border border-gray-100">
                          {content.length} characters
                      </div>
                  </div>
                </div>

                <div className="flex gap-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
                  <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-bold text-blue-900 mb-1">Writing Tips</p>
                    <p className="text-blue-700 leading-relaxed">
                      Keep your subject lines short and punchy. Use emojis to increase open rates. 
                      For past members, try offering a discount code to win them back!
                    </p>
                  </div>
                </div>
            </div>

            <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end items-center gap-4">
               <span className="text-sm text-gray-500 font-medium hidden sm:inline-block">
                 Ready to launch?
               </span>
               <button 
                 type="submit"
                 disabled={loading || !subject || !content}
                 className="px-8 py-3.5 bg-[#101828] hover:bg-black text-white rounded-xl font-bold shadow-lg shadow-gray-200 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed flex items-center gap-2.5"
               >
                 {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                 Send Newsletter
               </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
