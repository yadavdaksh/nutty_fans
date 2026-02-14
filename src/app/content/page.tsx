'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import Sidebar from '@/components/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { useState, useRef } from 'react';
import { Upload, X, Lock, Loader2, Send } from 'lucide-react';
import { useStorage } from '@/hooks/useStorage';
import { createPost } from '@/lib/db';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function CreateContentPage() {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const { uploadFile, isUploading, progress } = useStorage();
  
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [isLocked, setIsLocked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      
      if (selectedFile.type.startsWith('video/')) {
        setMediaType('video');
      } else {
        setMediaType('image');
      }
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !file) return;
    
    setIsSubmitting(true);
    
    try {
      // 1. Upload File
      const path = `posts/${user.uid}/${Date.now()}_${file.name}`;
      const mediaURL = await uploadFile(file, path);
      
      // 2. Create Post in Firestore
      await createPost({
        creatorId: user.uid,
        content: caption,
        mediaURL,
        type: mediaType,
        isLocked,
      });

      alert("Post created successfully!");
      router.push('/dashboard');
    } catch (err) {
      console.error("Error creating post:", err);
      alert("Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (userProfile?.role !== 'creator') {
     // Basic redirect if not creator
     if (typeof window !== 'undefined') router.push('/dashboard');
     return null;
  }

  return (
    <ProtectedRoute>
      <div 
        className="flex min-h-screen"
        style={{ backgroundColor: '#F9FAFB' }}
      >
        <Sidebar />
        <div className="flex-1">
          <div className="px-8 py-10 max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-[#101828] mb-8">
              Create New Post
            </h1>

            <div 
              className="rounded-2xl shadow-sm p-6"
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.05)',
              }}
            >
              <form onSubmit={handleSubmit}>
                {/* Caption */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-[#344054] mb-2">
                    Caption
                  </label>
                  <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Write something exciting..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-[#101828] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all resize-none h-32"
                  />
                </div>

                {/* Media Upload */}
                <div className="mb-6">
                  <label className="block text-sm font-bold text-[#344054] mb-2">
                    Media (Image or Video)
                  </label>
                  
                  {!file ? (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-purple-200 transition-all group"
                    >
                      <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6 text-purple-600" />
                      </div>
                      <p className="text-sm font-bold text-[#344054] mb-1">
                        Click to upload
                      </p>
                      <p className="text-xs text-[#667085]">
                        SVG, PNG, JPG or MP4 (max. 50MB)
                      </p>
                    </div>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden bg-black border border-gray-200 group">
                      {mediaType === 'image' ? (
                        <div className="relative h-64 w-full">
                           <Image src={previewUrl!} alt="Preview" fill className="object-contain" />
                        </div>
                      ) : (
                        <video src={previewUrl!} className="w-full h-64 object-contain" controls />
                      )}
                      
                      <button
                        type="button"
                        onClick={clearFile}
                        className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>

                      {/* Upload Progress Overlay */}
                      {isUploading && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center flex-col text-white">
                          <Loader2 className="w-8 h-8 animate-spin mb-2" />
                          <p className="font-bold">{Math.round(progress)}%</p>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*,video/*"
                    onChange={handleFileSelect}
                  />
                </div>

                {/* Settings */}
                <div className="mb-8 p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isLocked ? 'bg-amber-100 text-amber-600' : 'bg-gray-200 text-gray-500'}`}>
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#344054]">
                        Premium Content
                      </p>
                      <p className="text-xs text-[#667085]">
                        Only subscribers can view this
                      </p>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => setIsLocked(!isLocked)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${isLocked ? 'bg-purple-600' : 'bg-gray-300'}`}
                  >
                     <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${isLocked ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Submit Action */}
                <div className="flex justify-end">
                   <button
                    type="submit"
                    disabled={!file || isSubmitting || isUploading}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold shadow-md hover:shadow-lg disabled:opacity-50 disabled:shadow-none transition-all"
                  >
                    {isSubmitting || isUploading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Send className="w-5 h-5" />
                    )}
                    {isUploading ? 'Uploading...' : isSubmitting ? 'Posting...' : 'Post Content'}
                  </button>
                </div>

              </form>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
