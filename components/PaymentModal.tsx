'use client';

import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  modelName: string;
  generationId: string;
  onPaymentComplete: () => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  amount,
  modelName,
  generationId,
  onPaymentComplete,
}: PaymentModalProps) {
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'completed'>('pending');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setPaymentStatus('pending');
    } else {
      setTimeout(() => setIsVisible(false), 400);
    }
  }, [isOpen]);

  const handlePayment = async () => {
    setPaymentStatus('processing');
    
    setTimeout(() => {
      setPaymentStatus('completed');
      setTimeout(() => {
        onPaymentComplete();
        onClose();
      }, 1200);
    }, 2000);
  };

  if (!isVisible) return null;

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-6 transition-all duration-400 ease-out ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget && paymentStatus !== 'processing') {
          onClose();
        }
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" />

      {/* Modal */}
      <div 
        className={`relative w-full max-w-lg bg-white transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-12'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-8 right-8 p-2.5 hover:bg-black/5 transition-all duration-300 group disabled:opacity-30"
          disabled={paymentStatus === 'processing'}
        >
          <X className="w-5 h-5 text-black/30 group-hover:text-black/70 transition-colors duration-300" />
        </button>

        {/* Content */}
        <div className="px-12 py-14">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="mb-8">
              <div className={`inline-block transition-all duration-700 ${
                paymentStatus === 'completed' 
                  ? 'scale-0 opacity-0' 
                  : paymentStatus === 'processing'
                  ? 'scale-110 opacity-100'
                  : 'scale-100 opacity-100'
              }`}>
                {paymentStatus === 'processing' ? (
                  <Loader2 className="w-12 h-12 text-black animate-spin" />
                ) : (
                  <div className="w-12 h-12 border-2 border-black/10" />
                )}
              </div>
              
              {/* Success checkmark */}
              <div className={`absolute left-1/2 -translate-x-1/2 transition-all duration-700 ${
                paymentStatus === 'completed' 
                  ? 'scale-100 opacity-100 rotate-0' 
                  : 'scale-0 opacity-0 -rotate-180'
              }`}>
                <svg className="w-12 h-12" viewBox="0 0 48 48" fill="none">
                  <circle cx="24" cy="24" r="22" stroke="black" strokeWidth="2"/>
                  <path d="M14 24l8 8 12-12" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            <h2 className="text-3xl font-extralight mb-3 tracking-tight text-black">
              {paymentStatus === 'completed' 
                ? 'Complete' 
                : paymentStatus === 'processing'
                ? 'Processing'
                : 'Payment Required'}
            </h2>
            <p className="text-sm text-black/40 font-light tracking-wide">
              {paymentStatus === 'completed' 
                ? 'Your generation is ready' 
                : paymentStatus === 'processing'
                ? 'Confirming transaction'
                : 'Complete payment to generate'}
            </p>
          </div>

          {/* Payment Details - Slide out when completed */}
          <div className={`space-y-8 transition-all duration-700 ${
            paymentStatus === 'completed' 
              ? 'opacity-0 -translate-y-4 max-h-0 overflow-hidden pointer-events-none' 
              : 'opacity-100 translate-y-0 max-h-[600px]'
          }`}>
            {/* Amount Display */}
            <div className="py-12 border-t border-b border-black/10">
              <div className="text-7xl font-extralight mb-3 tabular-nums text-black tracking-tight">
                ${amount.toFixed(2)}
              </div>
              <div className="text-xs text-black/30 uppercase tracking-[0.25em] font-light">USDC</div>
            </div>

            {/* Details */}
            <div className="space-y-1 text-sm">
              <div className="flex justify-between items-baseline py-4 border-b border-black/5">
                <span className="text-black/30 font-light uppercase text-xs tracking-wider">Model</span>
                <span className="text-black font-light">{modelName}</span>
              </div>
              <div className="flex justify-between items-baseline py-4">
                <span className="text-black/30 font-light uppercase text-xs tracking-wider">ID</span>
                <span className="text-black/40 font-mono text-xs tracking-tight">
                  {generationId.substring(0, 20)}
                </span>
              </div>
            </div>
          </div>

          {/* Success Message - Slide in when completed */}
          <div className={`transition-all duration-700 ${
            paymentStatus === 'completed' 
              ? 'opacity-100 translate-y-0 max-h-40 mb-10' 
              : 'opacity-0 translate-y-8 max-h-0 overflow-hidden pointer-events-none'
          }`}>
            <div className="py-8 border-t border-b border-black/10 text-center">
              <p className="text-sm text-black/60 font-light tracking-wide">
                Generating your content
              </p>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={paymentStatus === 'pending' ? handlePayment : undefined}
            disabled={paymentStatus !== 'pending'}
            className={`w-full px-10 py-5 text-sm font-light tracking-[0.1em] uppercase
                     flex items-center justify-center gap-4
                     transition-all duration-500 ease-out
                     ${paymentStatus === 'completed'
                       ? 'bg-black text-white cursor-default opacity-60'
                       : paymentStatus === 'processing'
                       ? 'bg-black text-white cursor-wait opacity-80'
                       : 'bg-black text-white hover:bg-black/80 active:scale-[0.98]'
                     }
                     disabled:cursor-not-allowed`}
          >
            {paymentStatus === 'processing' ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing</span>
              </>
            ) : paymentStatus === 'completed' ? (
              <span>Completed</span>
            ) : (
              <span>Pay with USDC</span>
            )}
          </button>

          {/* Footer */}
          <div className={`mt-8 pt-8 border-t border-black/5 transition-opacity duration-500 ${
            paymentStatus === 'pending' ? 'opacity-100' : 'opacity-0'
          }`}>
            <p className="text-xs text-center text-black/25 uppercase tracking-[0.2em] font-light">
              Secured by x402
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
