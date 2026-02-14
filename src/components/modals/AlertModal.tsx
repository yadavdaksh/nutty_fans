'use client';

import { AlertCircle, Info, CheckCircle, AlertTriangle } from 'lucide-react';

export type AlertType = 'info' | 'success' | 'warning' | 'error';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: AlertType;
  onConfirm?: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
}

export default function AlertModal({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  onConfirm,
  confirmLabel = 'OK',
  cancelLabel = 'Cancel',
}: AlertModalProps) {
  if (!isOpen) return null;

  const icons = {
    info: <Info className="w-6 h-6 text-blue-500" />,
    success: <CheckCircle className="w-6 h-6 text-green-500" />,
    warning: <AlertTriangle className="w-6 h-6 text-amber-500" />,
    error: <AlertCircle className="w-6 h-6 text-red-500" />,
  };

  const colors = {
    info: 'bg-blue-50 text-blue-700',
    success: 'bg-green-50 text-green-700',
    warning: 'bg-amber-50 text-amber-700',
    error: 'bg-red-50 text-red-700',
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className={`p-2 rounded-xl ${colors[type]}`}>
              {icons[type]}
            </div>
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          </div>
          
          <p className="text-gray-600 mb-8 leading-relaxed">
            {message}
          </p>
          
          <div className="flex gap-3">
            {onConfirm && (
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition-all"
              >
                {cancelLabel}
              </button>
            )}
            <button
              onClick={() => {
                if (onConfirm) onConfirm();
                onClose();
              }}
              className={`flex-1 py-3 px-4 text-white rounded-xl font-bold transition-all shadow-lg ${
                type === 'error' ? 'bg-red-600 hover:bg-red-700 shadow-red-100' :
                type === 'warning' ? 'bg-amber-500 hover:bg-amber-600 shadow-amber-100' :
                type === 'success' ? 'bg-green-600 hover:bg-green-700 shadow-green-100' :
                'bg-gray-900 hover:bg-black shadow-gray-100'
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
