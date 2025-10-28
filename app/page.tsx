'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '@/components/Header';
import ModelCard from '@/components/ModelCard';
import GenerationForm from '@/components/GenerationForm';
import PaymentModal from '@/components/PaymentModal';
import ResultDisplay from '@/components/ResultDisplay';
import GenerationProgress from '@/components/GenerationProgress';
import InteractiveBackground from '@/components/InteractiveBackground';
import { imageModels, videoModels } from '@/lib/models';
import Link from 'next/link';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Wallet } from 'lucide-react';

export default function Home() {
  const { connected, publicKey } = useWallet();
  
  const [activeTab, setActiveTab] = useState<'image' | 'video'>('image');
  const [selectedModel, setSelectedModel] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [generationProgress, setGenerationProgress] = useState({
    elapsedTime: 0,
    status: 'pending' as 'pending' | 'processing' | 'completed',
    estimatedTime: 150,
  });
  const [paymentData, setPaymentData] = useState<{
    amount: number;
    modelName: string;
    generationId: string;
    prompt: string;
  } | null>(null);
  const [result, setResult] = useState<{
    type: 'image' | 'video';
    url: string;
    urls?: string[];
    prompt: string;
    modelName: string;
  } | null>(null);

  const currentModels = activeTab === 'image' ? imageModels : videoModels;

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
    setResult(null);
  };

  const handleGenerate = async (prompt: string, options?: any) => {
    if (!selectedModel) return;
    
    // Check wallet connection
    if (!connected || !publicKey) {
      alert('Please connect your wallet first to generate!');
      return;
    }

    setIsLoading(true);
    setResult(null);
    setGenerationProgress({ elapsedTime: 0, status: 'pending', estimatedTime: 150 });

    try {
      // Forsøg at starte generering (vil returnere 402 hvis ikke betalt)
      const response = await axios.post('/api/generate', {
        model: selectedModel,
        prompt,
        type: activeTab,
        options,
      });

      // For Sora 2, Veo 3.1, GPT Image 1, Ideogram, and Qwen, start polling for result
      if ((selectedModel === 'sora-2' || selectedModel === 'veo-3.1' || selectedModel === 'gpt-image-1' || selectedModel === 'ideogram' || selectedModel === 'qwen') && response.data.success) {
        const taskId = response.data.taskId;
        const startTime = Date.now();
        
        // Estimated time based on model and duration
        const estimatedTime = selectedModel === 'gpt-image-1'
          ? (options?.filesUrl && options.filesUrl.length > 0 ? 150 : 120)  // 4o Image: 150s with reference, 120s without
          : selectedModel === 'ideogram'
          ? (options?.renderingSpeed === 'QUALITY' ? 90 : options?.renderingSpeed === 'TURBO' ? 30 : 60)  // Ideogram: 90s quality, 30s turbo, 60s balanced
          : selectedModel === 'qwen'
          ? (options?.acceleration === 'high' ? 25 : options?.acceleration === 'regular' ? 35 : 45)  // Qwen: 25s high, 35s regular, 45s none
          : selectedModel === 'veo-3.1' 
          ? (options?.imageUrls && options.imageUrls.length > 0 ? 90 : 50)  // Veo: 90s for image-to-video, 50s for text-to-video
          : (options?.n_frames === '15' ? 240 : 150);  // Sora 2
        console.log(`⏱️ Estimated generation time: ${estimatedTime}s for ${selectedModel}`);
        
        setGenerationProgress({ elapsedTime: 0, status: 'processing', estimatedTime });

        // Update elapsed time every second
        const timeInterval = setInterval(() => {
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          setGenerationProgress(prev => ({ ...prev, elapsedTime: elapsed }));
        }, 1000);
        
        // Poll for result
        const pollInterval = setInterval(async () => {
          try {
            const resultResponse = await axios.get(`/api/generate/${taskId}?model=${selectedModel}`);
            
            console.log('📊 Poll response SUCCESS:', resultResponse.data.success);
            console.log('📊 Poll response STATE:', resultResponse.data.state);
            console.log('📊 Poll response FULL DATA:', JSON.stringify(resultResponse.data, null, 2));
            
            if (resultResponse.data.success && resultResponse.data.state === 'completed') {
              console.log('✅ VIDEO READY! Setting result...');
              console.log('Video URL:', resultResponse.data.result);
              
              clearInterval(pollInterval);
              clearInterval(timeInterval);
              setGenerationProgress(prev => ({ ...prev, status: 'completed' }));
              
              const model = currentModels.find((m) => m.id === selectedModel);
              const resultData = {
                type: activeTab as 'image' | 'video',
                url: resultResponse.data.result,
                urls: resultResponse.data.resultUrls, // Include all generated images
                prompt,
                modelName: model?.name || '',
              };
              
              console.log('Setting result data:', resultData);
              
              setTimeout(() => {
                setIsLoading(false);
                setResult(resultData);
                console.log('✅ Result set! Should be visible now.');
              }, 1000);
            } else if (resultResponse.data.state === 'failed') {
              console.error('❌ Generation failed:', resultResponse.data);
              clearInterval(pollInterval);
              clearInterval(timeInterval);
              setIsLoading(false);
              const errorMessage = resultResponse.data.message || resultResponse.data.failMsg || 'Generation failed. Please try again.';
              alert(errorMessage);
            } else {
              console.log('⏳ Still processing, state:', resultResponse.data.state);
            }
          } catch (error) {
            console.error('❌ Error polling result:', error);
          }
        }, 5000); // Poll every 5 seconds

        // Timeout after 5 minutes
        setTimeout(() => {
          clearInterval(pollInterval);
          clearInterval(timeInterval);
          if (isLoading) {
            setIsLoading(false);
            alert('Generation timeout. Please try again.');
          }
        }, 5 * 60 * 1000);
      } else if (response.status === 202 || response.data.paymentRequired) {
        // Handle payment for other models
        const model = currentModels.find((m) => m.id === selectedModel);
        setPaymentData({
          amount: model?.price || 0,
          modelName: model?.name || '',
          generationId: response.data.generationId,
          prompt,
        });
        setShowPaymentModal(true);
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error('Generation error:', error);
      setIsLoading(false);
      
      if (error.response?.status === 402 || error.response?.data?.paymentRequired) {
        const model = currentModels.find((m) => m.id === selectedModel);
        setPaymentData({
          amount: model?.price || 0,
          modelName: model?.name || '',
          generationId: error.response.data.generationId,
          prompt,
        });
        setShowPaymentModal(true);
      } else {
        alert(`Error: ${error.response?.data?.message || error.message || 'Failed to generate'}`);
      }
    }
  };

  const handlePaymentComplete = async (signature: string) => {
    if (!paymentData) return;

    console.log('💳 Payment completed with signature:', signature);
    setIsLoading(true);
    setShowPaymentModal(false);

    try {
      console.log('✅ Starter generering med betalt signature...');
      
      // Nu sender vi generation request MED payment signature
      const response = await axios.post('/api/generate', {
        model: selectedModel,
        prompt: paymentData.prompt,
        type: activeTab,
        options: {},
        paymentSignature: signature, // Send signature med request
      });

      if (response.data.success) {
        console.log('✅ Generering startet!');
        
        // Poll for result
        const taskId = response.data.taskId;
        const startTime = Date.now();
        
        // Estimated time based on model
        const estimatedTime = selectedModel === 'gpt-image-1'
          ? 120
          : selectedModel === 'ideogram'
          ? 60
          : selectedModel === 'qwen'
          ? 35
          : selectedModel === 'veo-3.1' 
          ? 50
          : 150;
        
        setGenerationProgress({ elapsedTime: 0, status: 'processing', estimatedTime });

        const timeInterval = setInterval(() => {
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          setGenerationProgress(prev => ({ ...prev, elapsedTime: elapsed }));
        }, 1000);
        
        const pollInterval = setInterval(async () => {
          try {
            const resultResponse = await axios.get(`/api/generate/${taskId}?model=${selectedModel}`);
            
            if (resultResponse.data.success && resultResponse.data.state === 'completed') {
              clearInterval(pollInterval);
              clearInterval(timeInterval);
              setGenerationProgress(prev => ({ ...prev, status: 'completed' }));
              
              setTimeout(() => {
                setIsLoading(false);
                setResult({
                  type: activeTab,
                  url: resultResponse.data.result,
                  urls: resultResponse.data.resultUrls,
                  prompt: paymentData.prompt,
                  modelName: paymentData.modelName,
                });
                setPaymentData(null);
              }, 1000);
            } else if (resultResponse.data.state === 'failed') {
              clearInterval(pollInterval);
              clearInterval(timeInterval);
              setIsLoading(false);
              alert('Generering fejlede. Prøv igen.');
              setPaymentData(null);
            }
          } catch (error) {
            console.error('Poll error:', error);
          }
        }, 5000);

        // Timeout efter 5 minutter
        setTimeout(() => {
          clearInterval(pollInterval);
          clearInterval(timeInterval);
          if (isLoading) {
            setIsLoading(false);
            alert('Generation timeout. Please try again.');
          }
        }, 5 * 60 * 1000);
      }
    } catch (error: any) {
      console.error('Could not start generation:', error);
      alert(error.response?.data?.message || 'Could not start generation. Contact support.');
      setIsLoading(false);
      setPaymentData(null);
    }
  };

  const handleShare = async () => {
    if (!result) return;

    // If there are multiple images, create and upload ZIP, then share ZIP link
    if (result.urls && result.urls.length > 1) {
      try {
        console.log('📦 Creating ZIP for sharing...');
        
        // Use JSZip to create the ZIP
        const JSZip = (await import('jszip')).default;
        const zip = new JSZip();
        const timestamp = Date.now();
        
        // Add all images to ZIP
        for (let i = 0; i < result.urls.length; i++) {
          try {
            const response = await fetch(result.urls[i]);
            const blob = await response.blob();
            const extension = result.urls[i].split('.').pop()?.split('?')[0] || 'png';
            zip.file(`image-${i + 1}.${extension}`, blob);
          } catch (error) {
            console.error(`Failed to add image ${i + 1} to ZIP:`, error);
          }
        }
        
        // Generate ZIP blob
        const zipBlob = await zip.generateAsync({ type: 'blob' });
        
        // Upload ZIP to Supabase
        console.log('📤 Uploading ZIP to Supabase...');
        const formData = new FormData();
        const zipFile = new File([zipBlob], `payper402-images-${timestamp}.zip`, { type: 'application/zip' });
        formData.append('files', zipFile);
        
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Failed to upload ZIP');
        }
        
        const uploadData = await uploadResponse.json();
        const zipUrl = uploadData.urls[0];
        
        console.log('✅ ZIP uploaded:', zipUrl);
        
        // Share the ZIP link
        const shareText = `Check out these ${result.urls.length} AI-generated images!\n\nPrompt: ${result.prompt}\nModel: ${result.modelName}`;
        
        if (navigator.share) {
          try {
            await navigator.share({
              title: 'PayPer402 AI Generation',
              text: shareText,
              url: zipUrl,
            });
          } catch (error) {
            console.error('Share failed:', error);
            // Fallback: Copy to clipboard
            await navigator.clipboard.writeText(`${shareText}\n\nDownload: ${zipUrl}`);
            alert('ZIP link copied to clipboard!');
          }
        } else {
          // Copy to clipboard
          await navigator.clipboard.writeText(`${shareText}\n\nDownload: ${zipUrl}`);
          alert('ZIP link copied to clipboard!');
        }
      } catch (error) {
        console.error('Failed to create and share ZIP:', error);
        alert('Failed to create ZIP file for sharing');
      }
    } else {
      // Single image or video - use original share method
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'PayPer402 AI Generation',
            text: result.prompt,
            url: result.url,
          });
        } catch (error) {
          console.error('Share failed:', error);
        }
      } else {
        navigator.clipboard.writeText(window.location.href);
      }
    }
  };

  const heroOpacity = Math.max(0, 1 - scrollY / 500);
  const heroScale = Math.max(0.9, 1 - scrollY / 3000);
  const heroBlur = Math.min(10, scrollY / 100);

  return (
    <div className="min-h-screen">
      <InteractiveBackground />
      
      <div className="relative z-10">
        <Header />

        {/* Hero Section */}
        <section className="min-h-screen flex items-center justify-center px-8">
          <div 
            className="max-w-5xl text-center will-change-transform"
            style={{ 
              opacity: heroOpacity,
              transform: `scale(${heroScale}) translateY(${scrollY * 0.5}px)`,
              filter: `blur(${heroBlur}px)`,
              transition: 'transform 0.05s ease-out, filter 0.1s ease-out'
            }}
          >
            <div className="inline-block px-6 py-2.5 bg-black/5 backdrop-blur-sm mb-12">
              <span className="text-xs uppercase tracking-[0.2em] text-black/40 font-medium">HTTP 402 • Pay-per-use AI</span>
            </div>
            <h1 className="text-[110px] font-extralight text-black mb-16 tracking-[-0.02em] leading-[0.85]">
              Professional<br/>AI Content
            </h1>
            <p className="text-3xl text-black/25 font-extralight leading-relaxed max-w-3xl mx-auto mb-20">
              Generate videos & images with Sora 2, Veo 3.1, and more. Pay only for what you use via 402 protocol.
            </p>
            <a 
              href="#generate"
              className="group inline-flex items-center gap-4 px-10 py-5 bg-black text-white text-sm font-medium tracking-wider hover:bg-black/90 transition-all duration-300 hover:gap-6"
            >
              <span>Start Generating</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </a>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-48 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-3 gap-32">
              {[
                { value: '402', label: 'Protocol' },
                { value: '5+', label: 'AI Models' },
                { value: '$0.03', label: 'From' }
              ].map((stat, i) => (
                <div 
                  key={i}
                  className="group text-center opacity-0 animate-fade-in hover:scale-105 transition-transform duration-300"
                  style={{ 
                    animationDelay: `${i * 150}ms`, 
                    animationFillMode: 'forwards',
                    transform: `translateY(${Math.max(0, scrollY - 400) * 0.1}px)`
                  }}
                >
                  <div className="text-8xl font-extralight text-black mb-6 transition-colors duration-300 group-hover:text-indigo-600">{stat.value}</div>
                  <div className="text-sm text-black/15 uppercase tracking-[0.2em] font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Generator Section */}
        <section id="generate" className="py-48 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-40">
              <h2 className="text-7xl font-extralight text-black mb-10 tracking-tight">Start Generating</h2>
              <p className="text-2xl text-black/20 font-extralight">
                {connected ? 'Choose your model and create' : 'Connect your wallet to get started'}
              </p>
            </div>

            {/* Wallet Gate - if not connected */}
            {!connected && (
              <div className="relative">
                <div className="absolute inset-0 z-20 flex items-center justify-center backdrop-blur-sm bg-white/60">
                  <div className="text-center p-16 bg-white border-2 border-black/10 max-w-xl">
                    <Wallet className="w-16 h-16 mx-auto mb-8 text-black/20" />
                    <h3 className="text-3xl font-extralight text-black mb-6">Connect Your Wallet</h3>
                    <p className="text-black/40 mb-10 leading-relaxed">
                      To use PayPer402 and pay with USDC on Solana network, 
                      you need to connect your wallet first.
                    </p>
                    <WalletMultiButton className="!bg-black !text-white hover:!bg-black/90 !text-base !font-medium !py-4 !px-8 !rounded-none transition-all duration-300" />
                    <div className="mt-8 pt-8 border-t border-black/5">
                      <p className="text-xs text-black/25 uppercase tracking-[0.2em]">
                        Secure payment via Solana
                      </p>
                    </div>
                  </div>
                </div>
                {/* Blurred preview */}
                <div className="filter blur-md pointer-events-none select-none">
                  <div className="grid lg:grid-cols-12 gap-24">
                    <div className="lg:col-span-6 space-y-20">
                      <div className="h-32 bg-black/5"></div>
                      <div className="space-y-4">
                        <div className="h-24 bg-black/5"></div>
                        <div className="h-24 bg-black/5"></div>
                      </div>
                    </div>
                    <div className="lg:col-span-6">
                      <div className="aspect-square bg-black/5"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actual Generator - kun vist når connected */}
            {connected && (
              <div className="grid lg:grid-cols-12 gap-24">
              {/* Left */}
              <div className="lg:col-span-6 space-y-20">
                {/* Type Selector */}
                <div className="opacity-0 animate-slide-up" style={{ animationDelay: '100ms', animationFillMode: 'forwards' }}>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-black/35 mb-10">Type</h3>
                  <div className="flex gap-8">
                    {['image', 'video'].map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setActiveTab(type as 'image' | 'video');
                          setSelectedModel('');
                          setResult(null);
                        }}
                        className={`
                          group relative flex-1 py-6 text-xl font-extralight transition-all duration-300
                          ${activeTab === type
                            ? 'text-black' 
                            : 'text-black/35 hover:text-black/60'
                          }
                        `}
                      >
                        <span className="relative z-10">{type === 'image' ? 'Images' : 'Videos'}</span>
                        <div className={`
                          absolute bottom-0 left-0 right-0 h-0.5 transition-all duration-300
                          ${activeTab === type
                            ? 'bg-black scale-x-100' 
                            : 'bg-black/10 scale-x-0 group-hover:scale-x-50'
                          }
                        `}></div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Models */}
                <div className="opacity-0 animate-slide-up" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-black/35 mb-10">Model</h3>
                  <div className="space-y-5">
                    {currentModels.map((model, i) => (
                      <div 
                        key={model.id}
                        className="opacity-0 animate-slide-up"
                        style={{ animationDelay: `${300 + i * 100}ms`, animationFillMode: 'forwards' }}
                      >
                        <ModelCard
                          model={model}
                          selected={selectedModel === model.id}
                          onSelect={handleModelSelect}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Form */}
                {selectedModel && (
                  <div className="opacity-0 animate-slide-up" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
                    <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-black/35 mb-10">Prompt</h3>
                    <GenerationForm
                      selectedModel={selectedModel}
                      onGenerate={handleGenerate}
                      isLoading={isLoading}
                    />
                  </div>
                )}
              </div>

              {/* Right */}
              <div className="lg:col-span-6">
                <div className="lg:sticky lg:top-32 opacity-0 animate-slide-up" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
                  <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-black/35 mb-10">Output</h3>
                  {result ? (
                    <ResultDisplay
                      type={result.type}
                      url={result.url}
                      urls={result.urls}
                      prompt={result.prompt}
                      modelName={result.modelName}
                      onShare={handleShare}
                    />
                  ) : isLoading ? (
                    <div className="bg-white border border-black/10 p-10">
                      <GenerationProgress
                        status={generationProgress.status}
                        elapsedTime={generationProgress.elapsedTime}
                        estimatedTotal={generationProgress.estimatedTime}
                        type={activeTab}
                      />
                    </div>
                  ) : (
                    <div className="relative aspect-square border border-black/5 overflow-hidden group">
                      {/* Subtle grid pattern */}
                      <div className="absolute inset-0 opacity-[0.015]" 
                           style={{
                             backgroundImage: `
                               linear-gradient(to right, black 1px, transparent 1px),
                               linear-gradient(to bottom, black 1px, transparent 1px)
                             `,
                             backgroundSize: '40px 40px'
                           }}>
                      </div>
                      
                      {/* Content */}
                      <div className="relative h-full flex flex-col items-center justify-center px-12">
                        {/* Icon */}
                        <div className="relative mb-12">
                          <div className="w-20 h-20 border-2 border-black/8 group-hover:border-black/15 transition-all duration-500 relative">
                            {/* Inner decorative elements */}
                            <div className="absolute inset-2 border border-black/5 group-hover:border-black/10 transition-all duration-500"></div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-2 h-2 bg-black/10 group-hover:bg-black/20 transition-all duration-500"></div>
                            </div>
                          </div>
                          {/* Corner accents */}
                          <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </div>

                        {/* Text */}
                        <div className="text-center space-y-4">
                          <p className="text-xl text-black/30 font-extralight tracking-wide">
                            Select a model
                          </p>
                          <p className="text-sm text-black/15 font-light tracking-wider uppercase">
                            Your result will appear here
                          </p>
                        </div>

                        {/* Bottom indicator */}
                        <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
                          <div className="flex gap-2">
                            <div className="w-16 h-px bg-black/5 group-hover:bg-black/10 transition-all duration-500"></div>
                            <div className="w-2 h-px bg-black/10 group-hover:bg-black/15 transition-all duration-500"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="py-24 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-3 gap-20 mb-24">
              <div>
                <div className="font-semibold text-black mb-8 text-2xl">PayPer402</div>
                <p className="text-base text-black/60 leading-relaxed font-extralight">
                  Professional AI generation platform powered by leading models. 
                  Pay per use with HTTP 402 protocol.
                </p>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-black/45 mb-8">Platform</div>
                <ul className="space-y-4 text-base text-black/60 font-extralight">
                  <li><Link href="/#generate" className="hover:text-black transition-colors duration-300">Generate</Link></li>
                  <li><Link href="/about" className="hover:text-black transition-colors duration-300">About</Link></li>
                  <li><Link href="/docs" className="hover:text-black transition-colors duration-300">Documentation</Link></li>
                </ul>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-black/45 mb-8">Community</div>
                <ul className="space-y-4 text-base text-black/60 font-extralight">
                  <li>
                    <a 
                      href="https://github.com/Russioo/PayPer402" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-black transition-colors duration-300 flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                      </svg>
                      GitHub
                    </a>
                  </li>
                  <li>
                    <a 
                      href="https://x.com/payper402x" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-black transition-colors duration-300 flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                      X / Twitter
                    </a>
                  </li>
                  <li><span className="text-black/50">HTTP 402</span></li>
                </ul>
              </div>
            </div>
            <div className="pt-10 flex items-center justify-between text-sm text-black/40 font-extralight">
              <span>© 2025 PayPer402. All rights reserved.</span>
              <div className="flex items-center gap-6">
                <a 
                  href="https://github.com/Russioo/PayPer402" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-black transition-colors duration-300"
                >
                  Open Source
                </a>
                <span>Powered by HTTP 402 Payment Protocol</span>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {paymentData && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          amount={paymentData.amount}
          modelName={paymentData.modelName}
          generationId={paymentData.generationId}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </div>
  );
}
