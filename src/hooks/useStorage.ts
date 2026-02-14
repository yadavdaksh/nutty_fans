import { useState } from 'react';
import { storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

interface UseStorageReturn {
  uploadFile: (file: File, path: string) => Promise<string>;
  deleteFile: (url: string) => Promise<void>;
  progress: number;
  error: string | null;
  isUploading: boolean;
}

export const useStorage = (): UseStorageReturn => {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file: File, path: string): Promise<string> => {
    // ... (keep existing implementation)
    return new Promise((resolve, reject) => {
      if (!file) {
        reject(new Error('No file provided'));
        return;
      }

      setError(null);
      setIsUploading(true);
      setProgress(0);

      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(p);
        },
        (err) => {
          console.error('Upload error:', err);
          setError(err.message);
          setIsUploading(false);
          reject(err);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            setIsUploading(false);
            setProgress(100);
            resolve(downloadURL);
          } catch (err) {
             console.error('GetDownloadURL error:', err);
             setError(err instanceof Error ? err.message : 'Failed to get download URL');
             setIsUploading(false);
             reject(err);
          }
        }
      );
    });
  };

  const deleteFile = async (url: string): Promise<void> => {
    if (!url || !url.startsWith('http')) return;
    try {
      const fileRef = ref(storage, url);
      await deleteObject(fileRef);
    } catch (err) {
      console.error('Delete error:', err);
      // We don't necessarily want to fail the whole process if delete fails 
      // (e.g. if the file was already deleted or doesn't exist)
    }
  };

  return { uploadFile, deleteFile, progress, error, isUploading };
};
