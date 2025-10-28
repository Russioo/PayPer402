'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Wallet } from 'lucide-react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { sendUSDCPayment } from '@/lib/solana-payment';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  modelName: string;
  generationId: string;
  onPaymentComplete: (signature: string) => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  amount,
  modelName,
  generationId,
  onPaymentComplete,
}: PaymentModalProps) {
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'completed' | 'error'>('pending');
  const [isVisible, setIsVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [transactionSignature, setTransactionSignature] = useState('');
  
  const { connected, publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setPaymentStatus('pending');
      setErrorMessage('');
      setTransactionSignature('');
    } else {
      setTimeout(() => setIsVisible(false), 400);
    }
  }, [isOpen]);

  const handlePayment = async () => {
    if (!connected || !publicKey || !signTransaction) {
      setErrorMessage('Please connect your wallet first');
      return;
    }

    setPaymentStatus('processing');
    setErrorMessage('');
    
    try {
      console.log('💳 Starting payment...');
      console.log('Amount:', amount, 'USDC');
      console.log('Generation ID:', generationId);
      
      // Send USDC payment via Solana
      const result = await sendUSDCPayment(
        connection,
        publicKey,
        signTransaction,
        amount
      );

      if (result.success && result.signature) {
        console.log('✅ Payment successful!');
        console.log('Signature:', result.signature);
        
        setTransactionSignature(result.signature);
        setPaymentStatus('completed');
        
        // Wait a bit and call onPaymentComplete with signature
        setTimeout(() => {
          onPaymentComplete(result.signature);
          onClose();
        }, 2000);
      } else {
        console.error('❌ Payment failed:', result.error);
        setPaymentStatus('error');
        setErrorMessage(result.error || 'Payment failed. Please try again.');
      }
    } catch (error: any) {
      console.error('❌ Payment error:', error);
      setPaymentStatus('error');
      setErrorMessage(error.message || 'An error occurred. Please try again.');
    }
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
                paymentStatus === 'processing'
                  ? 'scale-110 opacity-100'
                  : 'scale-100 opacity-100'
              }`}>
                {paymentStatus === 'processing' ? (
                  <Loader2 className="w-12 h-12 text-black animate-spin" />
                ) : paymentStatus === 'error' ? (
                  <div className="w-12 h-12 border-2 border-red-500/30 rounded-full flex items-center justify-center">
                    <X className="w-6 h-6 text-red-500" />
                  </div>
                ) : (
                  <Wallet className="w-12 h-12 text-black/20" />
                )}
              </div>
            </div>

            <h2 className="text-3xl font-extralight mb-3 tracking-tight text-black">
              {paymentStatus === 'completed' 
                ? 'Payment Complete' 
                : paymentStatus === 'processing'
                ? 'Processing Payment'
                : paymentStatus === 'error'
                ? 'Payment Failed'
                : 'Pay with USDC'}
            </h2>
            <p className="text-sm text-black/40 font-light tracking-wide">
              {paymentStatus === 'completed' 
                ? 'Your generation is starting now' 
                : paymentStatus === 'processing'
                ? 'Confirming transaction on Solana'
                : paymentStatus === 'error'
                ? errorMessage
                : 'Pay via your Solana wallet'}
            </p>
          </div>

          {/* Payment Details - Slide out when completed */}
          <div className={`space-y-8 transition-all duration-700 ${
            paymentStatus === 'completed' || paymentStatus === 'error'
              ? 'opacity-0 -translate-y-4 max-h-0 overflow-hidden pointer-events-none' 
              : 'opacity-100 translate-y-0 max-h-[600px]'
          }`}>
            {/* Amount Display */}
            <div className="py-12 border-t border-b border-black/10">
              <div className="text-7xl font-extralight mb-3 tabular-nums text-black tracking-tight">
                ${amount.toFixed(2)}
              </div>
              <div className="text-xs text-black/30 uppercase tracking-[0.25em] font-light">USDC on Solana</div>
            </div>

            {/* Details */}
            <div className="space-y-1 text-sm">
              <div className="flex justify-between items-baseline py-4 border-b border-black/5">
                <span className="text-black/30 font-light uppercase text-xs tracking-wider">Model</span>
                <span className="text-black font-light">{modelName}</span>
              </div>
              <div className="flex justify-between items-baseline py-4 border-b border-black/5">
                <span className="text-black/30 font-light uppercase text-xs tracking-wider">Network</span>
                <span className="text-black font-light">Solana Mainnet</span>
              </div>
              {connected && publicKey && (
                <div className="flex justify-between items-baseline py-4">
                  <span className="text-black/30 font-light uppercase text-xs tracking-wider">Your Wallet</span>
                  <span className="text-black/40 font-mono text-xs tracking-tight">
                    {publicKey.toBase58().substring(0, 8)}...{publicKey.toBase58().substring(publicKey.toBase58().length - 6)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Success Message - Slide in when completed */}
          <div className={`transition-all duration-700 ${
            paymentStatus === 'completed' 
              ? 'opacity-100 translate-y-0 max-h-40 mb-10' 
              : 'opacity-0 translate-y-8 max-h-0 overflow-hidden pointer-events-none'
          }`}>
            <div className="py-8 border-t border-b border-black/10 text-center space-y-4">
              <p className="text-sm text-black/60 font-light tracking-wide">
                Generating your content...
              </p>
              {transactionSignature && (
                <a 
                  href={`https://solscan.io/tx/${transactionSignature}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-xs text-black/60 hover:text-black font-mono transition-colors underline"
                >
                  View transaction on Solscan →
                </a>
              )}
            </div>
          </div>

          {/* Error Message */}
          {paymentStatus === 'error' && (
            <div className="mb-8 p-6 bg-red-50 border border-red-100">
              <p className="text-sm text-red-600 text-center">{errorMessage}</p>
            </div>
          )}

          {/* Action Button */}
          {!connected ? (
            <div className="text-center py-8 border-t border-black/10">
              <p className="text-sm text-black/40 mb-4">You need to connect your wallet first</p>
              <p className="text-xs text-black/30">Use the "Connect Wallet" button in the header</p>
            </div>
          ) : (
            <button
              onClick={paymentStatus === 'pending' || paymentStatus === 'error' ? handlePayment : undefined}
              disabled={paymentStatus === 'processing' || paymentStatus === 'completed'}
              className={`w-full px-10 py-5 text-sm font-light tracking-[0.1em] uppercase
                       flex items-center justify-center gap-4
                       transition-all duration-500 ease-out
                       ${paymentStatus === 'completed'
                         ? 'bg-green-600 text-white cursor-default opacity-90'
                         : paymentStatus === 'processing'
                         ? 'bg-black text-white cursor-wait opacity-80'
                         : paymentStatus === 'error'
                         ? 'bg-red-600 text-white hover:bg-red-700 active:scale-[0.98]'
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
              ) : paymentStatus === 'error' ? (
                <span>Try Again</span>
              ) : (
                <span>Pay {amount} USDC</span>
              )}
            </button>
          )}

          {/* Footer */}
          <div className={`mt-8 pt-8 border-t border-black/5 transition-opacity duration-500 ${
            paymentStatus === 'pending' || paymentStatus === 'error' ? 'opacity-100' : 'opacity-0'
          }`}>
            <p className="text-xs text-center text-black/25 uppercase tracking-[0.2em] font-light">
              Secured by Solana Network
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

