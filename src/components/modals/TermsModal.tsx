'use client';

import React from 'react';
import { FileText, X, Check } from 'lucide-react';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
  showAcceptButton?: boolean;
}

export default function TermsModal({ isOpen, onClose, onAccept, showAcceptButton = false }: TermsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-xl rounded-[32px] overflow-hidden shadow-2xl flex flex-col max-h-[80vh] animate-in slide-in-from-bottom-8 duration-500">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-2 rounded-xl">
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Terms & Conditions</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-900"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 font-inter">
          <div className="prose prose-sm prose-purple max-w-none text-gray-600">
            <h3 className="text-gray-900 font-bold">1. Agreement to Terms</h3>
            <p>By using our services, you agree to be bound by these Terms and Conditions. Please read them carefully before proceeding.</p>
            
            <h3 className="text-gray-900 font-bold mt-6">2. Content Policy</h3>
            <p>Users are responsible for the content they post. Explicit content is permitted but must be tagged appropriately and complies with our safety guidelines.</p>
            
            <h3 className="text-gray-900 font-bold mt-6">3. Privacy & Safety</h3>
            <p>We value your privacy. Your data is handled according to our Privacy Policy. Harassment or unauthorized sharing of media is strictly prohibited.</p>
            
            <h3 className="text-gray-900 font-bold mt-6">4. Payments & Payouts</h3>
            <p>All payments made on the platform are processed securely. Creators receive payouts according to the established commission model.</p>
            
            <h3 className="text-gray-900 font-bold mt-6">5. Age Restriction</h3>
            <p>You must be at least 18 years of age to access and use this platform. Accessing the platform implies you meet this requirement.</p>
          </div>
        </div>

        {showAcceptButton && onAccept && (
          <div className="p-6 bg-gray-50 border-t border-gray-100">
            <button 
              onClick={onAccept}
              className="w-full py-4 bg-gradient-to-r from-[#9810fa] to-[#e60076] text-white rounded-2xl font-bold shadow-xl shadow-purple-200 transition-all hover:opacity-90 flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              I Agree to Terms & Conditions
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
