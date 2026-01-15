'use client';

import { useState } from 'react';
import { Send, Loader2, Mail, Users, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function NewsletterPage() {
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [target, setTarget] = useState<'all' | 'creators' | 'fans'>('all');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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
        body: JSON.stringify({ subject, content, target }),
      });

      if (!res.ok) throw new Error('Failed to send newsletter');
      
      setSuccess(true);
      toast.success('Newsletter sent successfully!');
      setSubject('');
      setContent('');
    } catch (err) {
      console.error(err);
      toast.error('Failed to send newsletter');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
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
        <form onSubmit={handleSend} className="bg-white rounded-[32px] border border-gray-100 shadow-xl overflow-hidden">
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Recipient Group</label>
                <div className="flex gap-2">
                  {(['all', 'creators', 'fans'] as const).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setTarget(g)}
                      className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm transition-all border ${
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
                <p>Sending to roughly <span className="font-bold underline cursor-help">5,230</span> users in this group.</p>
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

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider">Content (HTML Supported)</label>
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
               className="px-10 py-4 bg-gradient-to-r from-[#9810fa] to-[#e60076] text-white rounded-2xl font-bold shadow-2xl shadow-purple-200 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 flex items-center gap-3"
             >
               {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
               Send Newsletter Now
             </button>
          </div>
        </form>
      )}
    </div>
  );
}
