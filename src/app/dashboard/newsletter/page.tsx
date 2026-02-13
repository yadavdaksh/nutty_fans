'use client';

import { useState } from 'react';
import { Send, Loader2, Mail, Users, AlertCircle, CheckCircle2, Image as ImageIcon, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import { useStorage } from '@/hooks/useStorage';
import Image from 'next/image';

const EMAIL_TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank Canvas',
    subject: '',
    content: ''
  },
  {
    id: 'weekly',
    name: 'Weekly Update',
    subject: '📅 Weekly Roundup: What I\'ve been up to!',
    content: '<h2>Hey everyone! 👋</h2><p>Here’s a quick look at what I’ve been working on this week...</p><h3>📸 New Content</h3><p>I just posted some new photos that I think you\'ll love.</p><h3>🔜 Coming Soon</h3><p>Next week, I\'m planning to...</p>'
  },
  {
    id: 'teaser',
    name: 'Exclusive Teaser',
    subject: '👀 Sneak Peek: Something special is coming...',
    content: '<h2>Shhh... 🤫</h2><p>You\'re getting an exclusive first look at my upcoming project.</p><p>Check out the preview image above!</p><p><strong>Releasing on:</strong> [Date]</p>'
  }
];

export default function CreatorNewsletterPage() {
  const { user } = useAuth();
  const { uploadFile, isUploading } = useStorage();
  
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [target, setTarget] = useState<'active' | 'past' | 'all'>('active');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [lastSentCount, setLastSentCount] = useState(0);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      const path = `newsletter-images/creators/${user.uid}/${Date.now()}_${file.name}`;
      const url = await uploadFile(file, path);
      setImageUrl(url);
      toast.success('Image uploaded!');
    } catch (error) {
      toast.error('Failed to upload image');
      console.error(error);
    }
  };

  const applyTemplate = (templateId: string) => {
    const template = EMAIL_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      if (template.subject) setSubject(template.subject);
      if (template.content) setContent(template.content);
      toast.success(`Applied "${template.name}" template`);
    }
  };

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
            imageUrl,
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
      setImageUrl('');
    } catch (err) {
      console.error(err);
      toast.error((err as Error).message || 'Failed to send newsletter');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] py-12 px-4 sm:px-6 lg:px-8 font-inter">
      <div className="max-w-7xl mx-auto space-y-8">
        
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Left Column: Form */}
            <form onSubmit={handleSend} className="bg-white rounded-[24px] border border-gray-200 shadow-xl shadow-gray-100/50 overflow-hidden">
              {/* Audience Selector */}
              <div className="p-8 border-b border-gray-100 bg-gray-50/50">
                 <h3 className="text-sm font-bold text-[#344054] uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    Select Audience
                 </h3>
                 <div className="grid grid-cols-1 gap-4">
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
                                className={`block p-4 border rounded-xl cursor-pointer transition-all duration-200 ${
                                  isActive 
                                    ? 'bg-purple-50 border-purple-500 ring-2 ring-purple-500 shadow-sm' 
                                    : 'bg-white border-gray-200 hover:border-purple-200 hover:bg-purple-50/30'
                                }`}
                            >
                                <div className="flex items-center justify-between mb-1">
                                  <span className={`font-bold capitalize ${isActive ? 'text-purple-900' : 'text-gray-700'}`}>
                                    {g === 'active' ? 'Current' : g === 'past' ? 'Past' : 'All'}
                                  </span>
                                  {isActive && <Users className="w-4 h-4 text-purple-600" />}
                                </div>
                                <p className={`text-xs ${isActive ? 'text-purple-700' : 'text-gray-500'}`}>
                                    {g === 'active' && 'Active subscribers.'}
                                    {g === 'past' && 'Expired/Cancelled.'}
                                    {g === 'all' && 'Everyone.'}
                                </p>
                            </label>
                        </div>
                      );
                    })}
                 </div>
              </div>

              <div className="p-8 space-y-6">
                  
                  {/* Templates */}
                  <div>
                     <label className="block text-sm font-bold text-[#344054] mb-3">Quick Templates</label>
                     <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {EMAIL_TEMPLATES.map(t => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => applyTemplate(t.id)}
                            className="flex-shrink-0 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-colors"
                          >
                            {t.name}
                          </button>
                        ))}
                     </div>
                  </div>

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

                  {/* Image Upload */}
                  <div>
                     <label className="block text-sm font-bold text-[#344054] mb-2">Attached Image (Optional)</label>
                     {imageUrl ? (
                       <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                          <Image src={imageUrl} alt="Newsletter attachment" fill className="object-cover" />
                          <button 
                            type="button"
                            onClick={() => setImageUrl('')}
                            className="absolute top-3 right-3 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                       </div>
                     ) : (
                       <div className="flex items-center justify-center w-full">
                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  {isUploading ? (
                                     <Loader2 className="w-8 h-8 text-gray-400 animate-spin mb-2" />
                                  ) : (
                                     <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                                  )}
                                  <p className="text-xs text-gray-500 font-medium">Click to upload</p>
                              </div>
                              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
                          </label>
                       </div>
                     )}
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

                  <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
                    <div className="flex gap-2">
                        <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <div className="text-sm">
                        <p className="font-bold text-blue-900 mb-1">Writing Tips</p>
                        <p className="text-blue-700 leading-relaxed">
                            Keep it short. Use emojis.
                        </p>
                        </div>
                    </div>
                  </div>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-end items-center gap-4">
                 <button 
                   type="submit"
                   disabled={loading || !subject || !content}
                   className="w-full sm:w-auto px-8 py-3.5 bg-[#101828] hover:bg-black text-white rounded-xl font-bold shadow-lg shadow-gray-200 transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
                 >
                   {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                   Send Newsletter
                 </button>
              </div>
            </form>

            {/* Right Column: Live Preview */}
            <div className="lg:sticky lg:top-8 space-y-4">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Live Preview
                </h3>
                
                {/* Email Preview Container - Mimics Email Client */}
                <div className="bg-white rounded-[24px] border border-gray-200 shadow-xl overflow-hidden">
                    {/* Fake Email Header */}
                    <div className="bg-gray-50 border-b border-gray-100 p-4 space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold border border-purple-200">
                                {user?.displayName?.[0] || 'C'}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-bold text-gray-900 truncate">
                                    {user?.displayName || 'Creator Name'} <span className="text-gray-400 font-normal">&lt;noreply@nuttyfans.com&gt;</span>
                                </p>
                                <p className="text-xs text-gray-500">to me</p>
                            </div>
                            <div className="text-xs text-gray-400">Now</div>
                        </div>
                        <div className="text-sm text-gray-900 font-medium truncate">
                            {subject || <span className="text-gray-300 italic">Subject line...</span>}
                        </div>
                    </div>

                    {/* Email Content Body */}
                    <div className="bg-white p-0">
                         {/* This inner div mimics the HTML structure sent by the API */}
                         <div className="font-sans text-[#333] max-w-full mx-auto">
                            <div className="bg-[#fdfbfd] p-8 border-b border-[#eee]">
                                <h1 className="text-[#9810fa] m-0 text-2xl font-bold">New Update from Creator</h1>
                            </div>
                            <div className="p-8 bg-white">
                                {imageUrl && (
                                    <div className="mb-6 rounded-xl overflow-hidden border border-gray-100">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={imageUrl} alt="Update" className="w-full h-auto block" />
                                    </div>
                                )}
                                <h2 className="mt-0 text-xl font-bold mb-4">{subject || 'Your Subject Here'}</h2>
                                <div 
                                    className="leading-relaxed text-[#555] prose prose-sm max-w-none prose-p:my-2 prose-h3:text-lg prose-h3:mt-4 prose-h3:mb-2"
                                    dangerouslySetInnerHTML={{ __html: content || '<p class="text-gray-300 italic">Start typing your message to see it appear here...</p>' }}
                                />
                            </div>
                            <div className="p-5 text-center text-xs text-[#999] bg-[#f9fafb] border-t border-[#eee]">
                                &copy; {new Date().getFullYear()} NuttyFans. <br/>
                                You received this email because you subscribed to this creator.
                            </div>
                         </div>
                    </div>
                </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
