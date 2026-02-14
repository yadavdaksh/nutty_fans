'use client';

import { useState } from 'react';
import { Send, Loader2, Mail, Users, AlertCircle, CheckCircle2, Image as ImageIcon, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useStorage } from '@/hooks/useStorage';
import Image from 'next/image';

const EMAIL_TEMPLATES = [
  {
    id: 'update',
    name: 'Platform Update',
    subject: '🚀 NuttyFans Update: New Features Live!',
    content: '<h2>Big News!</h2><p>We\'ve just released some exciting new features to help you earn more.</p><h3>✨ What\'s New</h3><ul><li>Feature 1...</li><li>Feature 2...</li></ul>'
  },
  {
    id: 'spotlight',
    name: 'Creator Spotlight',
    subject: '⭐ Creator Spotlight: Meet this week\'s stars',
    content: '<h2>Rising Stars</h2><p>Check out these amazing creators who are taking NuttyFans by storm!</p><p>[Creator Name] - [Link]</p>'
  },
  {
    id: 'maintenance',
    name: 'Maintenance Alert',
    subject: '⚠️ Scheduled Maintenance Notice',
    content: '<h2>System Update</h2><p>We will be performing scheduled maintenance on [Date] at [Time].</p><p>The site may be unavailable for approximately 1 hour.</p>'
  }
];

export default function NewsletterPage() {
  const { uploadFile, isUploading } = useStorage();

  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [target, setTarget] = useState<'all' | 'creators' | 'fans'>('all');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const path = `newsletter-images/admin/${Date.now()}_${file.name}`;
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

    setLoading(true);
    try {
      const res = await fetch('/api/admin/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject, content, imageUrl, target }),
      });

      if (!res.ok) throw new Error('Failed to send newsletter');
      
      setSuccess(true);
      toast.success('Newsletter sent successfully!');
      setSubject('');
      setContent('');
      setImageUrl('');
    } catch (err) {
      console.error(err);
      toast.error('Failed to send newsletter');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Mail className="w-8 h-8 text-purple-600" />
          Send Newsletter
        </h1>
        <p className="text-gray-500 mt-2">Communicate with your users platform-wide.</p>
      </div>

      {success ? (
        <div className="bg-green-50 border border-green-100 rounded-3xl p-12 text-center animate-in zoom-in duration-500">
           <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
           </div>
           <h2 className="text-2xl font-bold text-green-900 mb-2">Success!</h2>
           <p className="text-green-700 mb-8 font-medium">Your newsletter has been queued and is being sent to {target} users.</p>
           <button 
             onClick={() => setSuccess(false)}
             className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold transition-all"
           >
             Send Another
           </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <form onSubmit={handleSend} className="bg-white rounded-[32px] border border-gray-100 shadow-xl overflow-hidden">
            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Recipient Group</label>
                  <div className="flex gap-2">
                    {(['all', 'creators', 'fans'] as const).map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setTarget(g)}
                        className={`flex-1 py-3 px-2 rounded-xl font-bold text-xs sm:text-sm transition-all border ${
                          target === g 
                            ? 'bg-purple-600 border-purple-600 text-white shadow-lg shadow-purple-100' 
                            : 'bg-white border-gray-200 text-gray-500 hover:border-purple-300 hover:text-purple-600'
                        }`}
                      >
                        {g.charAt(0).toUpperCase() + g.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-purple-50 p-4 rounded-2xl text-purple-800 text-sm">
                  <Users className="w-5 h-5 shrink-0" />
                  <p>Sending to roughly <span className="font-bold underline cursor-help">5,230</span> users.</p>
                </div>
              </div>

              {/* Templates */}
              <div>
                 <label className="block text-sm font-bold text-[#344054] mb-3 uppercase tracking-wider">Quick Templates</label>
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
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Email Subject</label>
                <input 
                  type="text"
                  placeholder="Important updates for NuttyFans..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition-all font-medium text-gray-900"
                />
              </div>

              {/* Image Upload */}
              <div>
                 <label className="block text-sm font-bold text-[#344054] mb-2 uppercase tracking-wider">Attached Image</label>
                 {imageUrl ? (
                   <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                      <Image src={imageUrl} alt="Newsletter attachment" fill sizes="(max-width: 768px) 100vw, 800px" className="object-cover" />
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
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Content</label>
                <textarea 
                  rows={12}
                  placeholder="Write your message here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl border border-gray-200 focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-600/10 transition-all font-inter text-gray-800 resize-none"
                />
              </div>

              <div className="flex items-start gap-3 p-4 bg-yellow-50 rounded-2xl border border-yellow-100 text-yellow-800 text-xs leading-relaxed">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  <strong>Warning:</strong> Emails will be sent immediately after clicking &quot;Send Newsletter&quot;. 
                  This action cannot be undone. Please ensure you have triple-checked your content and recipients.
                </p>
              </div>
            </div>

            <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-end">
               <button 
                 type="submit"
                 disabled={loading}
                 className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-[#9810fa] to-[#e60076] text-white rounded-2xl font-bold shadow-2xl shadow-purple-200 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3"
               >
                 {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                 Send Newsletter Now
               </button>
            </div>
          </form>

          {/* Admin Live Preview */}
          <div className="lg:sticky lg:top-8 space-y-4">
               <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                   <Mail className="w-4 h-4" /> Live Preview
               </h3>
               
               {/* Email Preview Container */}
               <div className="bg-white rounded-[24px] border border-gray-200 shadow-xl overflow-hidden">
                   {/* Fake Email Header */}
                   <div className="bg-gray-50 border-b border-gray-100 p-4 space-y-3">
                       <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-pink-700 font-bold border border-pink-200">
                               A
                           </div>
                           <div className="min-w-0 flex-1">
                               <p className="text-sm font-bold text-gray-900 truncate">
                                   NuttyFans Admin <span className="text-gray-400 font-normal">&lt;admin@nuttyfans.com&gt;</span>
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
                        <div className="font-sans text-[#333] max-w-full mx-auto">
                           <div style={{ background: 'linear-gradient(to right, #9810fa, #e60076)' }} className="p-8 text-center">
                               <h1 className="text-white m-0 text-2xl font-bold">NuttyFans Updates</h1>
                           </div>
                           <div className="p-8 bg-white">
                               {imageUrl && (
                                   <div className="mb-6 rounded-xl overflow-hidden border border-gray-100">
                                       {/* eslint-disable-next-line @next/next/no-img-element */}
                                       <img src={imageUrl} alt="Update" className="w-full h-auto block" />
                                   </div>
                               )}
                               <div 
                                   className="leading-relaxed text-[#555] prose prose-sm max-w-none prose-p:my-2 prose-h3:text-lg prose-h3:mt-4 prose-h3:mb-2"
                                   dangerouslySetInnerHTML={{ __html: content || '<p class="text-gray-300 italic">Start typing your message to see it appear here...</p>' }}
                               />
                           </div>
                           <div className="p-5 text-center text-xs text-[#999] bg-[#f9fafb] border-t border-[#eee]">
                               &copy; {new Date().getFullYear()} NuttyFans. All rights reserved. <br/>
                               If you wish to unsubscribe, please update your notification settings in your profile.
                           </div>
                        </div>
                   </div>
               </div>
          </div>
        </div>
      )}
    </div>
  );
}
