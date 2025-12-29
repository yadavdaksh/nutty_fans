import { useState } from 'react';
import { storage } from '@/lib/firebase';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';

interface UseStorageReturn {
  uploadFile: (file: File, path: string) => Promise<string>;
  progress: number;
  error: string | null;
  isUploading: boolean;
}

export const useStorage = (): UseStorageReturn => {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file: File, path: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      // Basic validation
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

  return { uploadFile, progress, error, isUploading };
};
