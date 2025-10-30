'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface GenerationFormProps {
  selectedModel: string;
  onGenerate: (prompt: string, options?: any) => void;
  isLoading: boolean;
}

export default function GenerationForm({
  selectedModel,
  onGenerate,
  isLoading,
}: GenerationFormProps) {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'landscape' | 'portrait'>('landscape');
  const [nFrames, setNFrames] = useState<'10' | '15'>('10');
  const [removeWatermark, setRemoveWatermark] = useState(true);
  const [veoAspectRatio, setVeoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [veoMode, setVeoMode] = useState<'text' | 'image'>('text');
  const [veoImages, setVeoImages] = useState<File[]>([]);
  const [veoImagePreviews, setVeoImagePreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [image4oSize, setImage4oSize] = useState<'1:1' | '3:2' | '2:3'>('1:1');
  const [image4oVariants, setImage4oVariants] = useState<1 | 2 | 4>(1);
  const [image4oFiles, setImage4oFiles] = useState<File[]>([]);
  const [image4oPreviews, setImage4oPreviews] = useState<string[]>([]);
  const [is4oDragging, setIs4oDragging] = useState(false);
  
  // Ideogram options
  const [ideogramRenderingSpeed, setIdeogramRenderingSpeed] = useState<'TURBO' | 'BALANCED' | 'QUALITY'>('BALANCED');
  const [ideogramStyle, setIdeogramStyle] = useState<'AUTO' | 'GENERAL' | 'REALISTIC' | 'DESIGN'>('AUTO');
  const [ideogramImageSize, setIdeogramImageSize] = useState<'square' | 'square_hd' | 'portrait_4_3' | 'portrait_16_9' | 'landscape_4_3' | 'landscape_16_9'>('square_hd');
  const [ideogramNumImages, setIdeogramNumImages] = useState<'1' | '2' | '3' | '4'>('1');
  const [ideogramExpandPrompt, setIdeogramExpandPrompt] = useState(true);
  
  // Qwen options
  const [qwenImageSize, setQwenImageSize] = useState<'square' | 'square_hd' | 'portrait_4_3' | 'portrait_16_9' | 'landscape_4_3' | 'landscape_16_9'>('square_hd');
  const [qwenNumInferenceSteps, setQwenNumInferenceSteps] = useState(30);
  const [qwenGuidanceScale, setQwenGuidanceScale] = useState(2.5);
  const [qwenEnableSafetyChecker, setQwenEnableSafetyChecker] = useState(true);
  const [qwenNegativePrompt, setQwenNegativePrompt] = useState('');
  const [qwenAcceleration, setQwenAcceleration] = useState<'none' | 'regular' | 'high'>('none');

  const isSora2 = selectedModel === 'sora-2';
  const isVeo = selectedModel === 'veo-3.1';
  const is4oImage = selectedModel === 'gpt-image-1';
  const isIdeogram = selectedModel === 'ideogram';
  const isQwen = selectedModel === 'qwen';

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      handleImageFiles(files.slice(0, 2)); // Max 2 images
    }
  };

  const handleImageFiles = (files: File[]) => {
    setVeoImages(files);
    
    // Create previews
    const previews = files.map(file => URL.createObjectURL(file));
    setVeoImagePreviews(previews);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).slice(0, 2);
      handleImageFiles(files);
    }
  };

  const removeImage = (index: number) => {
    setVeoImages(prev => prev.filter((_, i) => i !== index));
    setVeoImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handle4oImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIs4oDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    );
    
    if (files.length > 0) {
      handle4oImageFiles([files[0]]); // Max 1 image
    }
  };

  const handle4oImageFiles = (files: File[]) => {
    setImage4oFiles(files);
    
    // Create previews
    const previews = files.map(file => URL.createObjectURL(file));
    setImage4oPreviews(previews);
  };

  const handle4oImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = [e.target.files[0]]; // Max 1 image
      handle4oImageFiles(files);
    }
  };

  const remove4oImage = (index: number) => {
    setImage4oFiles(prev => prev.filter((_, i) => i !== index));
    setImage4oPreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      let options: any;
      
      if (is4oImage) {
        options = {
          size: image4oSize,
          nVariants: image4oVariants,
        };
        
        // Upload reference images if any are selected
        if (image4oFiles.length > 0) {
          setUploadingImages(true);
          try {
            const formData = new FormData();
            image4oFiles.forEach(file => {
              formData.append('files', file);
            });
            
            const response = await fetch('/api/upload', {
              method: 'POST',
              body: formData,
            });
            
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to upload images');
            }
            
            const data = await response.json();
            options.filesUrl = data.urls;
          } catch (error) {
            console.error('Image upload failed:', error);
            alert(`Failed to upload reference images: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setUploadingImages(false);
            return;
          } finally {
            setUploadingImages(false);
          }
        }
      } else if (isSora2) {
        options = {
          aspect_ratio: aspectRatio,
          n_frames: nFrames,
          size: 'high',
          remove_watermark: removeWatermark,
        };
      } else if (isVeo) {
        options = {
          aspectRatio: veoAspectRatio,
        };
        
        // Upload images if in image mode and images are selected
        if (veoMode === 'image' && veoImages.length > 0) {
          setUploadingImages(true);
          try {
            const formData = new FormData();
            veoImages.forEach(file => {
              formData.append('files', file);
            });
            
            const response = await fetch('/api/upload', {
              method: 'POST',
              body: formData,
            });
            
            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(errorData.error || 'Failed to upload images');
            }
            
            const data = await response.json();
            options.imageUrls = data.urls;
          } catch (error) {
            console.error('Image upload failed:', error);
            alert(`Failed to upload images: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setUploadingImages(false);
            return;
          } finally {
            setUploadingImages(false);
          }
        }
      } else if (isIdeogram) {
        options = {
          renderingSpeed: ideogramRenderingSpeed,
          style: ideogramStyle,
          imageSize: ideogramImageSize,
          numImages: ideogramNumImages,
          expandPrompt: ideogramExpandPrompt,
        };
      } else if (isQwen) {
        options = {
          imageSize: qwenImageSize,
          numInferenceSteps: qwenNumInferenceSteps,
          guidanceScale: qwenGuidanceScale,
          enableSafetyChecker: qwenEnableSafetyChecker,
          outputFormat: 'png', // Always PNG
          negativePrompt: qwenNegativePrompt || undefined,
          acceleration: qwenAcceleration,
        };
      }
      
      onGenerate(prompt, options);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 md:space-y-6">
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe what you want to create..."
        rows={4}
        className="w-full px-3 sm:px-4 md:px-5 py-3 sm:py-3.5 md:py-4 border border-black/10 text-black placeholder:text-black/40
                 focus:outline-none focus:border-black/30 transition-colors duration-300 resize-none
                 text-sm sm:text-base leading-relaxed"
        disabled={isLoading}
      />

      <div className="flex items-center justify-between">
        <span className="text-[10px] sm:text-xs text-black/45 tabular-nums">{prompt.length} characters</span>
      </div>

      {/* 4o Image Settings */}
      {is4oImage && (
        <div className="space-y-4 sm:space-y-5 md:space-y-6 pt-3 sm:pt-4 border-t border-black/10 animate-in fade-in slide-in-from-top-4 duration-500">
          {/* Aspect Ratio */}
          <div>
            <label className="block text-[10px] sm:text-xs font-light uppercase tracking-wider text-black/40 mb-2 sm:mb-3">
              Aspect Ratio
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setImage4oSize('1:1')}
                disabled={isLoading}
                className={`py-2 sm:py-2.5 md:py-3 px-2 sm:px-3 md:px-4 border text-xs sm:text-sm font-light transition-all duration-300 ${
                  image4oSize === '1:1'
                    ? 'border-black bg-black text-white'
                    : 'border-black/10 hover:border-black/20 text-black/60'
                }`}
              >
                <span className="hidden sm:inline">1:1 Square</span>
                <span className="sm:hidden">1:1</span>
              </button>
              <button
                type="button"
                onClick={() => setImage4oSize('3:2')}
                disabled={isLoading}
                className={`py-2 sm:py-2.5 md:py-3 px-2 sm:px-3 md:px-4 border text-xs sm:text-sm font-light transition-all duration-300 ${
                  image4oSize === '3:2'
                    ? 'border-black bg-black text-white'
                    : 'border-black/10 hover:border-black/20 text-black/60'
                }`}
              >
                <span className="hidden sm:inline">3:2 Landscape</span>
                <span className="sm:hidden">3:2</span>
              </button>
              <button
                type="button"
                onClick={() => setImage4oSize('2:3')}
                disabled={isLoading}
                className={`py-2 sm:py-2.5 md:py-3 px-2 sm:px-3 md:px-4 border text-xs sm:text-sm font-light transition-all duration-300 ${
                  image4oSize === '2:3'
                    ? 'border-black bg-black text-white'
                    : 'border-black/10 hover:border-black/20 text-black/60'
                }`}
              >
                <span className="hidden sm:inline">2:3 Portrait</span>
                <span className="sm:hidden">2:3</span>
              </button>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-[10px] sm:text-xs font-light uppercase tracking-wider text-black/40 mb-2 sm:mb-3">
              Quantity
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setImage4oVariants(1)}
                disabled={isLoading}
                className={`py-2 sm:py-2.5 md:py-3 px-2 sm:px-3 md:px-4 border text-xs sm:text-sm font-light transition-all duration-300 ${
                  image4oVariants === 1
                    ? 'border-black bg-black text-white'
                    : 'border-black/10 hover:border-black/20 text-black/60'
                }`}
              >
                <span className="hidden sm:inline">1 Image</span>
                <span className="sm:hidden">1</span>
              </button>
              <button
                type="button"
                onClick={() => setImage4oVariants(2)}
                disabled={isLoading}
                className={`py-2 sm:py-2.5 md:py-3 px-2 sm:px-3 md:px-4 border text-xs sm:text-sm font-light transition-all duration-300 ${
                  image4oVariants === 2
                    ? 'border-black bg-black text-white'
                    : 'border-black/10 hover:border-black/20 text-black/60'
                }`}
              >
                <span className="hidden sm:inline">2 Images</span>
                <span className="sm:hidden">2</span>
              </button>
              <button
                type="button"
                onClick={() => setImage4oVariants(4)}
                disabled={isLoading}
                className={`py-2 sm:py-2.5 md:py-3 px-2 sm:px-3 md:px-4 border text-xs sm:text-sm font-light transition-all duration-300 ${
                  image4oVariants === 4
                    ? 'border-black bg-black text-white'
                    : 'border-black/10 hover:border-black/20 text-black/60'
                }`}
              >
                <span className="hidden sm:inline">4 Images</span>
                <span className="sm:hidden">4</span>
              </button>
            </div>
          </div>

          {/* Reference Image (Optional) */}
          <div>
            <label className="block text-[10px] sm:text-xs font-light uppercase tracking-wider text-black/40 mb-2 sm:mb-3">
              Reference Image (Optional)
            </label>
            
            {/* Drag and Drop Zone */}
            {image4oFiles.length === 0 ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIs4oDragging(true);
                }}
                onDragLeave={() => setIs4oDragging(false)}
                onDrop={handle4oImageDrop}
                className={`relative border-2 border-dashed transition-all duration-300 ${
                  is4oDragging 
                    ? 'border-black/40 bg-black/5' 
                    : 'border-black/10 hover:border-black/20'
                }`}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handle4oImageSelect}
                  disabled={isLoading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="py-6 sm:py-7 md:py-8 px-4 sm:px-5 md:px-6 text-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 border border-black/10 mx-auto mb-2 sm:mb-3"></div>
                  <p className="text-xs sm:text-sm text-black/60 mb-1">
                    Drag and drop reference image
                  </p>
                  <p className="text-[10px] sm:text-xs text-black/30">
                    or click to browse
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Image Preview */}
                <div className="relative group aspect-video border border-black/10">
                  <img 
                    src={image4oPreviews[0]} 
                    alt="Reference"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => remove4oImage(0)}
                    className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white
                             border border-black/10 opacity-0 group-hover:opacity-100
                             transition-opacity duration-200"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
            
            <p className="text-xs text-black/30 mt-2">
              Upload a reference image to influence the generation style
            </p>
          </div>
        </div>
      )}

      {/* Ideogram Settings */}
      {isIdeogram && (
        <div className="space-y-6 pt-4 border-t border-black/10 animate-in fade-in slide-in-from-top-4 duration-500">
          {/* Rendering Speed */}
          <div>
            <label className="block text-xs font-light uppercase tracking-wider text-black/40 mb-3">
              Rendering Speed
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setIdeogramRenderingSpeed('TURBO')}
                disabled={isLoading}
                className={`py-3 px-4 border text-sm font-light transition-all duration-300 ${
                  ideogramRenderingSpeed === 'TURBO'
                    ? 'border-black bg-black text-white'
                    : 'border-black/10 hover:border-black/20 text-black/60'
                }`}
              >
                Turbo
              </button>
              <button
                type="button"
                onClick={() => setIdeogramRenderingSpeed('BALANCED')}
                disabled={isLoading}
                className={`py-3 px-4 border text-sm font-light transition-all duration-300 ${
                  ideogramRenderingSpeed === 'BALANCED'
                    ? 'border-black bg-black text-white'
                    : 'border-black/10 hover:border-black/20 text-black/60'
                }`}
              >
                Balanced
              </button>
              <button
                type="button"
                onClick={() => setIdeogramRenderingSpeed('QUALITY')}
                disabled={isLoading}
                className={`py-3 px-4 border text-sm font-light transition-all duration-300 ${
                  ideogramRenderingSpeed === 'QUALITY'
                    ? 'border-black bg-black text-white'
                    : 'border-black/10 hover:border-black/20 text-black/60'
                }`}
              >
                Quality
              </button>
            </div>
          </div>

          {/* Style */}
          <div>
            <label className="block text-xs font-light uppercase tracking-wider text-black/40 mb-3">
              Style
            </label>
            <div className="grid grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => setIdeogramStyle('AUTO')}
                disabled={isLoading}
                className={`py-3 px-4 border text-sm font-light transition-all duration-300 ${
                  ideogramStyle === 'AUTO'
                    ? 'border-black bg-black text-white'
                    : 'border-black/10 hover:border-black/20 text-black/60'
                }`}
              >
                Auto
              </button>
              <button
                type="button"
                onClick={() => setIdeogramStyle('GENERAL')}
                disabled={isLoading}
                className={`py-3 px-4 border text-sm font-light transition-all duration-300 ${
                  ideogramStyle === 'GENERAL'
                    ? 'border-black bg-black text-white'
                    : 'border-black/10 hover:border-black/20 text-black/60'
                }`}
              >
                General
              </button>
              <button
                type="button"
                onClick={() => setIdeogramStyle('REALISTIC')}
                disabled={isLoading}
                className={`py-3 px-4 border text-sm font-light transition-all duration-300 ${
                  ideogramStyle === 'REALISTIC'
                    ? 'border-black bg-black text-white'
                    : 'border-black/10 hover:border-black/20 text-black/60'
                }`}
              >
                Realistic
              </button>
              <button
                type="button"
                onClick={() => setIdeogramStyle('DESIGN')}
                disabled={isLoading}
                className={`py-3 px-4 border text-sm font-light transition-all duration-300 ${
                  ideogramStyle === 'DESIGN'
                    ? 'border-black bg-black text-white'
                    : 'border-black/10 hover:border-black/20 text-black/60'
                }`}
              >
                Design
              </button>
            </div>
          </div>

          {/* Image Size */}
          <div>
            <label className="block text-xs font-light uppercase tracking-wider text-black/40 mb-3">
              Aspect Ratio
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setIdeogramImageSize('square_hd')}
                disabled={isLoading}
                className={`py-3 px-4 border text-sm font-light transition-all duration-300 ${
                  ideogramImageSize === 'square_hd'
                    ? 'border-black bg-black text-white'
                    : 'border-black/10 hover:border-black/20 text-black/60'
                }`}
              >
                Square HD
              </button>
              <button
                type="button"
                onClick={() => setIdeogramImageSize('landscape_16_9')}
                disabled={isLoading}
                className={`py-3 px-4 border text-sm font-light transition-all duration-300 ${
                  ideogramImageSize === 'landscape_16_9'
                    ? 'border-black bg-black text-white'
                    : 'border-black/10 hover:border-black/20 text-black/60'
                }`}
              >
                16:9 Landscape
              </button>
              <button
                type="button"
                onClick={() => setIdeogramImageSize('portrait_16_9')}
                disabled={isLoading}
                className={`py-3 px-4 border text-sm font-light transition-all duration-300 ${
                  ideogramImageSize === 'portrait_16_9'
                    ? 'border-black bg-black text-white'
                    : 'border-black/10 hover:border-black/20 text-black/60'
                }`}
              >
                9:16 Portrait
              </button>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-xs font-light uppercase tracking-wider text-black/40 mb-3">
              Quantity
            </label>
            <div className="grid grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => setIdeogramNumImages('1')}
                disabled={isLoading}
                className={`py-3 px-4 border text-sm font-light transition-all duration-300 ${
                  ideogramNumImages === '1'
                    ? 'border-black bg-black text-white'
                    : 'border-black/10 hover:border-black/20 text-black/60'
                }`}
              >
                1
              </button>
              <button
                type="button"
                onClick={() => setIdeogramNumImages('2')}
                disabled={isLoading}
                className={`py-3 px-4 border text-sm font-light transition-all duration-300 ${
                  ideogramNumImages === '2'
                    ? 'border-black bg-black text-white'
                    : 'border-black/10 hover:border-black/20 text-black/60'
                }`}
              >
                2
              </button>
              <button
                type="button"
                onClick={() => setIdeogramNumImages('3')}
                disabled={isLoading}
                className={`py-3 px-4 border text-sm font-light transition-all duration-300 ${
                  ideogramNumImages === '3'
                    ? 'border-black bg-black text-white'
                    : 'border-black/10 hover:border-black/20 text-black/60'
                }`}
              >
                3
              </button>
              <button
                type="button"
                onClick={() => setIdeogramNumImages('4')}
                disabled={isLoading}
                className={`py-3 px-4 border text-sm font-light transition-all duration-300 ${
                  ideogramNumImages === '4'
                    ? 'border-black bg-black text-white'
                    : 'border-black/10 hover:border-black/20 text-black/60'
                }`}
              >
                4
              </button>
            </div>
          </div>

          {/* Magic Prompt Enhancement */}
          <div>
            <label className="flex items-center justify-between cursor-pointer group">
              <div>
                <span className="block text-xs font-light uppercase tracking-wider text-black/40 mb-1">
                  Magic Prompt
                </span>
                <span className="block text-xs text-black/30">
                  Enhance prompt for better results
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIdeogramExpandPrompt(!ideogramExpandPrompt)}
                disabled={isLoading}
                className={`relative w-12 h-6 border transition-all duration-300 ${
                  ideogramExpandPrompt
                    ? 'bg-black border-black'
                    : 'bg-black/5 border-black/10'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white transition-all duration-300 ${
                    ideogramExpandPrompt ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </label>
          </div>
        </div>
      )}

      {/* Qwen Settings */}
      {isQwen && (
        <div className="space-y-6 pt-4 border-t border-black/10 animate-in fade-in slide-in-from-top-4 duration-500">
          {/* Aspect Ratio / Image Size */}
          <div>
            <label className="block text-xs font-light uppercase tracking-wider text-black/40 mb-3">
              Aspect Ratio
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setQwenImageSize('square_hd')}
                disabled={isLoading}
                className={`py-3 px-4 border text-sm font-light transition-all duration-300 ${
                  qwenImageSize === 'square_hd'
                    ? 'border-black bg-black text-white'
                    : 'border-black/10 hover:border-black/20 text-black/60'
                }`}
              >
                Square HD
              </button>
              <button
                type="button"
                onClick={() => setQwenImageSize('landscape_16_9')}
                disabled={isLoading}
                className={`py-3 px-4 border text-sm font-light transition-all duration-300 ${
                  qwenImageSize === 'landscape_16_9'
                    ? 'border-black bg-black text-white'
                    : 'border-black/10 hover:border-black/20 text-black/60'
                }`}
              >
                16:9 Landscape
              </button>
              <button
                type="button"
                onClick={() => setQwenImageSize('portrait_16_9')}
                disabled={isLoading}
                className={`py-3 px-4 border text-sm font-light transition-all duration-300 ${
                  qwenImageSize === 'portrait_16_9'
                    ? 'border-black bg-black text-white'
                    : 'border-black/10 hover:border-black/20 text-black/60'
                }`}
              >
                9:16 Portrait
              </button>
            </div>
          </div>

          {/* Acceleration */}
          <div>
            <label className="block text-xs font-light uppercase tracking-wider text-black/40 mb-3">
              Acceleration
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setQwenAcceleration('none')}
                disabled={isLoading}
                className={`py-3 px-4 border text-sm font-light transition-all duration-300 ${
                  qwenAcceleration === 'none'
                    ? 'border-black bg-black text-white'
                    : 'border-black/10 hover:border-black/20 text-black/60'
                }`}
              >
                None
              </button>
              <button
                type="button"
                onClick={() => setQwenAcceleration('regular')}
                disabled={isLoading}
                className={`py-3 px-4 border text-sm font-light transition-all duration-300 ${
                  qwenAcceleration === 'regular'
                    ? 'border-black bg-black text-white'
                    : 'border-black/10 hover:border-black/20 text-black/60'
                }`}
              >
                Regular
              </button>
              <button
                type="button"
                onClick={() => setQwenAcceleration('high')}
                disabled={isLoading}
                className={`py-3 px-4 border text-sm font-light transition-all duration-300 ${
                  qwenAcceleration === 'high'
                    ? 'border-black bg-black text-white'
                    : 'border-black/10 hover:border-black/20 text-black/60'
                }`}
              >
                High
              </button>
            </div>
            <p className="text-xs text-black/30 mt-2">
              Higher acceleration increases speed. High is recommended for images without text.
            </p>
          </div>

          {/* Inference Steps */}
          <div>
            <label className="block text-xs font-light uppercase tracking-wider text-black/40 mb-3">
              Inference Steps: {qwenNumInferenceSteps}
            </label>
            <input
              type="range"
              min="2"
              max="250"
              value={qwenNumInferenceSteps}
              onChange={(e) => setQwenNumInferenceSteps(Number(e.target.value))}
              disabled={isLoading}
              className="w-full h-2 bg-black/5 appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                       [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:cursor-pointer
                       [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 
                       [&::-moz-range-thumb]:bg-black [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
            />
            <p className="text-xs text-black/30 mt-2">
              Number of denoising steps. More steps = higher quality but slower.
            </p>
          </div>

          {/* Guidance Scale */}
          <div>
            <label className="block text-xs font-light uppercase tracking-wider text-black/40 mb-3">
              Guidance Scale: {qwenGuidanceScale.toFixed(1)}
            </label>
            <input
              type="range"
              min="0"
              max="20"
              step="0.1"
              value={qwenGuidanceScale}
              onChange={(e) => setQwenGuidanceScale(Number(e.target.value))}
              disabled={isLoading}
              className="w-full h-2 bg-black/5 appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 
                       [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:cursor-pointer
                       [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 
                       [&::-moz-range-thumb]:bg-black [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
            />
            <p className="text-xs text-black/30 mt-2">
              How closely to follow the prompt. Higher = stricter adherence.
            </p>
          </div>

          {/* Negative Prompt */}
          <div>
            <label className="block text-xs font-light uppercase tracking-wider text-black/40 mb-3">
              Negative Prompt (Optional)
            </label>
            <textarea
              value={qwenNegativePrompt}
              onChange={(e) => setQwenNegativePrompt(e.target.value)}
              disabled={isLoading}
              placeholder="What to avoid in the image..."
              rows={2}
              className="w-full px-4 py-3 bg-white border border-black/10 
                       focus:border-black/20 focus:outline-none
                       transition-colors duration-300 resize-none
                       text-sm text-black placeholder-black/30"
              maxLength={500}
            />
            <p className="text-xs text-black/30 mt-2">
              Describe what you don't want in the image
            </p>
          </div>

          {/* Safety Checker Toggle */}
          <div>
            <label className="flex items-center justify-between cursor-pointer group">
              <div>
                <span className="block text-xs font-light uppercase tracking-wider text-black/40 mb-1">
                  Safety Checker
                </span>
                <span className="block text-xs text-black/30">
                  Filter inappropriate content
                </span>
              </div>
              <button
                type="button"
                onClick={() => setQwenEnableSafetyChecker(!qwenEnableSafetyChecker)}
                disabled={isLoading}
                className={`relative w-12 h-6 border transition-all duration-300 ${
                  qwenEnableSafetyChecker
                    ? 'bg-black border-black'
                    : 'bg-black/5 border-black/10'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white transition-all duration-300 ${
                    qwenEnableSafetyChecker ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </label>
          </div>
        </div>
      )}

      {/* Sora 2 Settings */}
      {isSora2 && (
        <div className="space-y-6 pt-4 border-t border-black/10 animate-in fade-in slide-in-from-top-4 duration-500">
          {/* Aspect Ratio */}
          <div>
            <label className="block text-xs font-light uppercase tracking-wider text-black/40 mb-3">
              Aspect Ratio
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAspectRatio('landscape')}
                disabled={isLoading}
                className={`py-3 px-4 border text-sm font-light transition-all duration-300 ${
                  aspectRatio === 'landscape'
                    ? 'border-black bg-black text-white'
                    : 'border-black/10 hover:border-black/20 text-black/60'
                }`}
              >
                16:9 Landscape
              </button>
              <button
                type="button"
                onClick={() => setAspectRatio('portrait')}
                disabled={isLoading}
                className={`py-3 px-4 border text-sm font-light transition-all duration-300 ${
                  aspectRatio === 'portrait'
                    ? 'border-black bg-black text-white'
                    : 'border-black/10 hover:border-black/20 text-black/60'
                }`}
              >
                9:16 Portrait
              </button>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-light uppercase tracking-wider text-black/40 mb-3">
              Duration
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setNFrames('10')}
                disabled={isLoading}
                className={`py-3 px-4 border text-sm font-light transition-all duration-300 ${
                  nFrames === '10'
                    ? 'border-black bg-black text-white'
                    : 'border-black/10 hover:border-black/20 text-black/60'
                }`}
              >
                10 seconds
              </button>
              <button
                type="button"
                onClick={() => setNFrames('15')}
                disabled={isLoading}
                className={`py-3 px-4 border text-sm font-light transition-all duration-300 ${
                  nFrames === '15'
                    ? 'border-black bg-black text-white'
                    : 'border-black/10 hover:border-black/20 text-black/60'
                }`}
              >
                15 seconds
              </button>
            </div>
          </div>

          {/* Watermark */}
          <div>
            <label className="flex items-center justify-between py-3 cursor-pointer group">
              <span className="text-xs font-light uppercase tracking-wider text-black/40 group-hover:text-black/60 transition-colors">
                Remove Watermark
              </span>
              <button
                type="button"
                onClick={() => setRemoveWatermark(!removeWatermark)}
                disabled={isLoading}
                className={`relative inline-flex h-6 w-11 items-center transition-colors duration-300 ${
                  removeWatermark ? 'bg-black' : 'bg-black/20'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform bg-white transition-transform duration-300 ${
                    removeWatermark ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </label>
          </div>
        </div>
      )}

      {/* Veo 3.1 Settings */}
      {isVeo && (
        <div className="space-y-6 pt-4 border-t border-black/10 animate-in fade-in slide-in-from-top-4 duration-500">
          {/* Generation Mode */}
          <div>
            <label className="block text-xs font-light uppercase tracking-wider text-black/40 mb-3">
              Generation Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setVeoMode('text')}
                disabled={isLoading}
                className={`py-3 px-4 border text-sm font-light transition-all duration-300 ${
                  veoMode === 'text'
                    ? 'border-black bg-black text-white'
                    : 'border-black/10 hover:border-black/20 text-black/60'
                }`}
              >
                Text to Video
              </button>
              <button
                type="button"
                onClick={() => setVeoMode('image')}
                disabled={isLoading}
                className={`py-3 px-4 border text-sm font-light transition-all duration-300 ${
                  veoMode === 'image'
                    ? 'border-black bg-black text-white'
                    : 'border-black/10 hover:border-black/20 text-black/60'
                }`}
              >
                Image to Video
              </button>
            </div>
          </div>

          {/* Image Upload (only for image mode) */}
          {veoMode === 'image' && (
            <div>
              <label className="block text-xs font-light uppercase tracking-wider text-black/40 mb-3">
                Images (1-2 images)
              </label>
              
              {/* Drag and Drop Zone */}
              {veoImages.length === 0 ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleImageDrop}
                  className={`relative border-2 border-dashed transition-all duration-300 ${
                    isDragging 
                      ? 'border-black/40 bg-black/5' 
                      : 'border-black/10 hover:border-black/20'
                  }`}
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    disabled={isLoading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="py-12 px-6 text-center">
                    <div className="w-16 h-16 border border-black/10 mx-auto mb-4"></div>
                    <p className="text-sm text-black/60 mb-2">
                      Drag and drop images here
                    </p>
                    <p className="text-xs text-black/30">
                      or click to browse (max 2 images)
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Image Previews */}
                  <div className="grid grid-cols-2 gap-3">
                    {veoImagePreviews.map((preview, index) => (
                      <div key={index} className="relative group aspect-square border border-black/10">
                        <img 
                          src={preview} 
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white
                                   border border-black/10 opacity-0 group-hover:opacity-100
                                   transition-opacity duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {/* Add more button if only 1 image */}
                  {veoImages.length === 1 && (
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                        disabled={isLoading}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <button
                        type="button"
                        className="w-full py-3 border border-dashed border-black/10 hover:border-black/20
                                 text-xs text-black/40 hover:text-black/60 transition-all duration-300"
                      >
                        + Add second image
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              <p className="text-xs text-black/30 mt-2">
                1 image: Video based on image | 2 images: First and last frame
              </p>
            </div>
          )}

          {/* Aspect Ratio */}
          <div>
            <label className="block text-xs font-light uppercase tracking-wider text-black/40 mb-3">
              Aspect Ratio
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setVeoAspectRatio('16:9')}
                disabled={isLoading}
                className={`py-3 px-4 border text-sm font-light transition-all duration-300 ${
                  veoAspectRatio === '16:9'
                    ? 'border-black bg-black text-white'
                    : 'border-black/10 hover:border-black/20 text-black/60'
                }`}
              >
                16:9 Landscape
              </button>
              <button
                type="button"
                onClick={() => setVeoAspectRatio('9:16')}
                disabled={isLoading}
                className={`py-3 px-4 border text-sm font-light transition-all duration-300 ${
                  veoAspectRatio === '9:16'
                    ? 'border-black bg-black text-white'
                    : 'border-black/10 hover:border-black/20 text-black/60'
                }`}
              >
                9:16 Portrait
              </button>
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={!prompt.trim() || !selectedModel || isLoading || uploadingImages}
        className="w-full px-6 sm:px-7 md:px-8 py-3 sm:py-3.5 md:py-4 bg-black text-white text-xs sm:text-sm font-medium tracking-wide
                 disabled:opacity-20 disabled:cursor-not-allowed
                 hover:bg-black/90 transition-all duration-200
                 flex items-center justify-center gap-2 sm:gap-3"
      >
        {uploadingImages ? (
          <>
            <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
            <span>Uploading Images</span>
          </>
        ) : isLoading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
            <span>Generating</span>
          </>
        ) : (
          'Generate'
        )}
      </button>
    </form>
  );
}
