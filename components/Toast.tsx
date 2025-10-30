'use client';

import { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'loading';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

export default function Toast({ 
  message, 
  type = 'info', 
  duration = 4000,
  onClose 
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);
    
    if (type !== 'loading' && duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 400);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, type, onClose]);

  const icons = {
    success: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M6 10l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M7 7l6 6M13 7l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M10 10v4M10 6v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
    ),
    loading: <Loader2 className="w-5 h-5 animate-spin" />,
  };

  const styles = {
    success: 'bg-white border-black/10 text-black',
    error: 'bg-white border-black/10 text-black',
    info: 'bg-white border-black/10 text-black',
    loading: 'bg-white border-black/10 text-black',
  };

  return (
    <div
      className={`fixed top-4 right-4 z-[60] max-w-sm transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
        isVisible 
          ? 'opacity-100 translate-x-0 scale-100' 
          : 'opacity-0 translate-x-12 scale-95 pointer-events-none'
      }`}
    >
      <div
        className={`flex items-center gap-3 px-4 py-3.5 border shadow-xl backdrop-blur-lg rounded-2xl ${styles[type]}`}
      >
        <div className="flex-shrink-0 text-black/60">{icons[type]}</div>
        
        <p className="flex-1 text-xs sm:text-sm font-light leading-relaxed text-black/80 tracking-wide">{message}</p>
        
        {type !== 'loading' && (
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onClose, 400);
            }}
            className="flex-shrink-0 p-1.5 hover:bg-black/5 rounded-md transition-all duration-300"
          >
            <X className="w-4 h-4 text-black/30" />
          </button>
        )}
      </div>
    </div>
  );
}

