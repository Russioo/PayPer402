'use client';

import { Download, Share2 } from 'lucide-react';
import Image from 'next/image';
import JSZip from 'jszip';

interface ResultDisplayProps {
  type: 'image' | 'video';
  url: string;
  urls?: string[]; // Multiple results (for 4o Image variants)
  prompt: string;
  modelName: string;
  onShare: () => void;
}

export default function ResultDisplay({
  type,
  url,
  urls,
  prompt,
  modelName,
  onShare,
}: ResultDisplayProps) {
  const handleDownload = async (imageUrl?: string, index?: number) => {
    const downloadUrl = imageUrl || url;
    const timestamp = Date.now();
    const fileName = index !== undefined 
      ? `payper402-image-${index + 1}-${timestamp}.png`
      : `payper402-${type}-${timestamp}.${type === 'image' ? 'png' : 'mp4'}`;

    try {
      // Since images are now from our Supabase, direct fetch should work
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback to direct link
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDownloadAll = async () => {
    try {
      const zip = new JSZip();
      const timestamp = Date.now();
      
      // Since images are from our Supabase, fetch should work without CORS issues
      for (let i = 0; i < displayUrls.length; i++) {
        try {
          const response = await fetch(displayUrls[i]);
          const blob = await response.blob();
          const extension = displayUrls[i].split('.').pop()?.split('?')[0] || 'png';
          zip.file(`image-${i + 1}.${extension}`, blob);
          console.log(`Added image ${i + 1} to ZIP`);
        } catch (error) {
          console.error(`Failed to add image ${i + 1} to ZIP:`, error);
        }
      }
      
      // Generate and download zip
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const zipUrl = window.URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = zipUrl;
      link.download = `payper402-images-${timestamp}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(zipUrl);
    } catch (error) {
      console.error('Failed to create ZIP:', error);
      // Fallback: download individually
      for (let i = 0; i < displayUrls.length; i++) {
        await handleDownload(displayUrls[i], i);
        if (i < displayUrls.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
    }
  };

  const displayUrls = urls && urls.length > 0 ? urls : [url];
  const hasMultipleImages = displayUrls.length > 1 && type === 'image';

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6">
      {/* Preview */}
      {hasMultipleImages ? (
        <div>
          <div className="text-[10px] sm:text-xs text-black/45 mb-2 sm:mb-3 uppercase tracking-wider">
            {displayUrls.length} Variants
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {displayUrls.map((imgUrl, index) => (
              <div key={index} className="group relative border border-black/5 overflow-hidden bg-black/[0.02]">
                <div className="relative w-full aspect-square">
                  <Image
                    src={imgUrl}
                    alt={`${prompt} - ${index + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <button
                  onClick={() => handleDownload(imgUrl, index)}
                  className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 p-1.5 sm:p-2 bg-white/90 hover:bg-white
                           border border-black/10 opacity-0 group-hover:opacity-100
                           transition-opacity duration-200"
                  title={`Download image ${index + 1}`}
                >
                  <Download className="w-3 h-3 text-black/60" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="border border-black/5 overflow-hidden bg-black/[0.02]">
          {type === 'image' ? (
            <div className="relative w-full aspect-square">
              <Image
                src={url}
                alt={prompt}
                fill
                className="object-cover"
                unoptimized
              />
            </div>
          ) : (
            <video src={url} controls className="w-full" />
          )}
        </div>
      )}

      {/* Info */}
      <div className="space-y-3 sm:space-y-4">
        <div>
          <div className="text-[10px] sm:text-xs text-black/45 mb-1.5 sm:mb-2 uppercase tracking-wider">Prompt</div>
          <p className="text-xs sm:text-sm text-black/75 leading-relaxed">{prompt}</p>
        </div>
        <div className="pt-3 sm:pt-4 border-t border-black/10">
          <div className="text-[10px] sm:text-xs text-black/45 mb-1.5 sm:mb-2 uppercase tracking-wider">Model</div>
          <p className="text-xs sm:text-sm text-black font-medium">{modelName}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-2">
        <button
          onClick={() => hasMultipleImages ? handleDownloadAll() : handleDownload()}
          className="py-2.5 sm:py-3 px-3 sm:px-4 border border-black/10 hover:border-black/20 hover:bg-black/[0.02]
                   transition-all duration-300
                   flex flex-col items-center justify-center gap-1.5 sm:gap-2"
        >
          <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black/60" />
          <span className="text-[10px] sm:text-xs text-black/50 uppercase tracking-wider">
            {hasMultipleImages ? 'Download ZIP' : 'Save'}
          </span>
        </button>

        <button
          onClick={onShare}
          className="py-2.5 sm:py-3 px-3 sm:px-4 border border-black/10 hover:border-black/20 hover:bg-black/[0.02]
                   transition-all duration-300
                   flex flex-col items-center justify-center gap-1.5 sm:gap-2"
        >
          <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-black/60" />
          <span className="text-[10px] sm:text-xs text-black/50 uppercase tracking-wider">Share</span>
        </button>
      </div>
    </div>
  );
}
