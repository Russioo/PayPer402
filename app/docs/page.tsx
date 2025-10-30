'use client';

import Header from '@/components/Header';
import InteractiveBackground from '@/components/InteractiveBackground';

export default function DocsPage() {
  return (
    <div className="min-h-screen">
      <InteractiveBackground />
      
      <div className="relative z-10">
        <Header />

        <main className="pt-24 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 md:px-8">
          <div className="max-w-4xl mx-auto">
            
            {/* Hero */}
            <div className="mb-12 sm:mb-16 md:mb-20">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extralight text-black mb-4 sm:mb-6 md:mb-8 tracking-tight">
                Documentation
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-black/25 font-extralight">
                Everything you need to know about PayPer402 AI Generation Platform
              </p>
            </div>

            {/* Content */}
            <div className="space-y-16">
              
              {/* Getting Started */}
              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-black mb-4 sm:mb-5 md:mb-6">Getting Started</h2>
                <div className="space-y-4 text-black/40 leading-relaxed text-sm sm:text-base">
                  <p>
                    PayPer402 is a professional AI generation platform that allows you to create stunning images and videos 
                    using leading AI models via HTTP 402 protocol. No subscription required - pay only for what you generate.
                  </p>
                  <p>
                    The platform supports 6 industry-leading models:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li><strong className="text-black/60">4o Image</strong> - OpenAI's latest image generator</li>
                    <li><strong className="text-black/60">Ideogram V3</strong> - Text-to-image with diverse art styles and text rendering</li>
                    <li><strong className="text-black/60">Qwen</strong> - Alibaba Cloud's high-quality image model with flexible control</li>
                    <li><strong className="text-black/60">Sora 2</strong> - OpenAI's text-to-video model</li>
                    <li><strong className="text-black/60">Veo 3.1</strong> - Google's video model with text/image input</li>
                  </ul>
                </div>
              </section>

              {/* How to Use */}
              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-black mb-4 sm:mb-5 md:mb-6">How to Use</h2>
                <div className="space-y-4 sm:space-y-5 md:space-y-6">
                  <div className="bg-black/5 p-4 sm:p-5 md:p-6 rounded-sm">
                    <h3 className="text-lg sm:text-xl font-medium text-black mb-2 sm:mb-3">Step 1: Choose Type</h3>
                    <p className="text-black/40 text-sm sm:text-base">
                      Select whether you want to generate images or videos. Each type has different models optimized for that format.
                    </p>
                  </div>
                  <div className="bg-black/5 p-4 sm:p-5 md:p-6 rounded-sm">
                    <h3 className="text-lg sm:text-xl font-medium text-black mb-2 sm:mb-3">Step 2: Select Model</h3>
                    <p className="text-black/40 text-sm sm:text-base">
                      Choose from available AI models. Each model has different strengths, pricing, and output styles.
                    </p>
                  </div>
                  <div className="bg-black/5 p-4 sm:p-5 md:p-6 rounded-sm">
                    <h3 className="text-lg sm:text-xl font-medium text-black mb-2 sm:mb-3">Step 3: Write Prompt</h3>
                    <p className="text-black/40 text-sm sm:text-base">
                      Describe what you want to create. Be specific and detailed for best results. 
                      Example: "A futuristic cityscape at sunset with flying cars and neon lights"
                    </p>
                  </div>
                  <div className="bg-black/5 p-4 sm:p-5 md:p-6 rounded-sm">
                    <h3 className="text-lg sm:text-xl font-medium text-black mb-2 sm:mb-3">Step 4: Pay & Generate</h3>
                    <p className="text-black/40 text-sm sm:text-base">
                      Complete payment via HTTP 402 protocol using USDC. Your content generates instantly after payment confirmation.
                    </p>
                  </div>
                </div>
              </section>

              {/* Pricing */}
              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-black mb-4 sm:mb-5 md:mb-6">Pricing</h2>
                <div className="space-y-3 sm:space-y-4 text-black/40 text-sm sm:text-base">
                  <p>Pay per generation. No subscription, no monthly fees.</p>
                  <div className="bg-black/5 p-4 sm:p-5 md:p-6 space-y-3 rounded-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-3 border-b border-black/5 pb-3">
                      <span className="font-medium text-black">Qwen</span>
                      <span className="font-mono text-black text-sm sm:text-base">$0.030 <span className="text-xs text-black/40">per picture</span></span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-3 border-b border-black/5 pb-3">
                      <span className="font-medium text-black">4o Image</span>
                      <span className="font-mono text-black text-sm sm:text-base">$0.042 <span className="text-xs text-black/40">per picture</span></span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-3 border-b border-black/5 pb-3">
                      <span className="font-medium text-black">Ideogram V3</span>
                      <span className="font-mono text-black text-sm sm:text-base">$0.066 <span className="text-xs text-black/40">per picture</span></span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-3 border-b border-black/5 pb-3">
                      <span className="font-medium text-black">Sora 2</span>
                      <span className="font-mono text-black text-sm sm:text-base">$0.210 <span className="text-xs text-black/40">per video</span></span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-3">
                      <span className="font-medium text-black">Veo 3.1</span>
                      <span className="font-mono text-black text-sm sm:text-base">$0.360 <span className="text-xs text-black/40">per video</span></span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Payment System */}
              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-black mb-4 sm:mb-5 md:mb-6">HTTP 402 Payment Protocol</h2>
                <div className="space-y-4 text-black/40 leading-relaxed text-sm sm:text-base">
                  <p>
                    PayPer402 implements the <strong className="text-black/60">real HTTP 402 Payment Required protocol</strong> with Solana blockchain payments.
                  </p>
                  
                  <div className="bg-black/5 p-4 sm:p-5 md:p-6 space-y-4 rounded-sm">
                    <h3 className="text-lg sm:text-xl font-medium text-black">How It Works</h3>
                    <ol className="list-decimal list-inside space-y-3 ml-4">
                      <li><strong className="text-black/60">Connect Wallet:</strong> First connect your Solana wallet (Phantom, Solflare, etc.)</li>
                      <li><strong className="text-black/60">Start Generation:</strong> Select model and write your prompt</li>
                      <li><strong className="text-black/60">HTTP 402 Response:</strong> Server returns 402 Payment Required with payment details</li>
                      <li><strong className="text-black/60">Pay with USDC:</strong> Approve USDC transfer in your wallet on Solana network</li>
                      <li><strong className="text-black/60">On-chain Verification:</strong> Backend verifies transaction on Solana blockchain</li>
                      <li><strong className="text-black/60">Generation Starts:</strong> Once verified, AI generation begins</li>
                    </ol>
                  </div>

                  <div className="bg-black/5 p-4 sm:p-5 md:p-6 space-y-4 rounded-sm">
                    <h3 className="text-lg sm:text-xl font-medium text-black">Payment Features</h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li><strong className="text-black/60">Real HTTP 402:</strong> Follows HTTP 402 specification with WWW-Authenticate header</li>
                      <li><strong className="text-black/60">Blockchain Verified:</strong> All payments verified on-chain via Solana RPC</li>
                      <li><strong className="text-black/60">USDC on Solana:</strong> Pay with USDC SPL token on Solana Mainnet</li>
                      <li><strong className="text-black/60">Instant Confirmation:</strong> Transaction confirmed in seconds</li>
                      <li><strong className="text-black/60">Transparent:</strong> View all transactions on Solscan.io</li>
                      <li><strong className="text-black/60">No Subscription:</strong> Pay only for what you generate</li>
                    </ul>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-light text-black mt-6 sm:mt-8 mb-3 sm:mb-4">HTTP 402 Response Format</h3>
                  <div className="bg-black/5 p-4 sm:p-5 md:p-6 font-mono text-[11px] sm:text-xs md:text-sm rounded-sm">
                    <code className="text-black/60">
                      HTTP/1.1 402 Payment Required<br/>
                      WWW-Authenticate: Bearer realm="PayPer402", amount="0.40", currency="USDC"<br/>
                      <br/>
                      {'{'}<br/>
                      &nbsp;&nbsp;"error": "Payment Required",<br/>
                      &nbsp;&nbsp;"message": "This resource requires payment",<br/>
                      &nbsp;&nbsp;"generationId": "gen_1234567890_abc123",<br/>
                      &nbsp;&nbsp;"paymentRequired": true,<br/>
                      &nbsp;&nbsp;"amount": 0.40,<br/>
                      &nbsp;&nbsp;"currency": "USDC",<br/>
                      &nbsp;&nbsp;"network": "Solana",<br/>
                      &nbsp;&nbsp;"model": "GPT Image 1"<br/>
                      {'}'}
                    </code>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-light text-black mt-6 sm:mt-8 mb-3 sm:mb-4">Solana Transaction Details</h3>
                  <div className="bg-black/5 p-4 sm:p-5 md:p-6 space-y-2 rounded-sm text-sm sm:text-base">
                    <div className="flex justify-between">
                      <span className="font-medium text-black">Network:</span>
                      <span>Solana Mainnet Beta</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-black">Token:</span>
                      <span>USDC (SPL Token)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-black">Transaction Fee:</span>
                      <span>~0.000005 SOL</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-black">Confirmation:</span>
                      <span>~1-3 seconds</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-black">Explorer:</span>
                      <span className="font-mono text-xs">solscan.io</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* API Integration */}
              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-black mb-4 sm:mb-5 md:mb-6">API Integration</h2>
                <div className="space-y-4 text-black/40 leading-relaxed text-sm sm:text-base">
                  <p>
                    The platform integrates with leading AI providers to deliver professional results.
                  </p>
                  
                  <h3 className="text-xl sm:text-2xl font-light text-black mt-6 sm:mt-8 mb-3 sm:mb-4">OpenAI (4o Image, Sora 2)</h3>
                  <div className="bg-black/5 p-4 sm:p-5 md:p-6 font-mono text-[11px] sm:text-xs md:text-sm rounded-sm overflow-x-auto">
                    <code className="text-black/60">
                      POST /api/generate<br/>
                      {'{'}<br/>
                      &nbsp;&nbsp;"model": "gpt-image-1",<br/>
                      &nbsp;&nbsp;"prompt": "Your description",<br/>
                      &nbsp;&nbsp;"type": "image"<br/>
                      {'}'}
                    </code>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-light text-black mt-6 sm:mt-8 mb-3 sm:mb-4">Response Format</h3>
                  <div className="bg-black/5 p-4 sm:p-5 md:p-6 font-mono text-[11px] sm:text-xs md:text-sm rounded-sm overflow-x-auto">
                    <code className="text-black/60">
                      HTTP 402 Payment Required<br/>
                      {'{'}<br/>
                      &nbsp;&nbsp;"paymentRequired": true,<br/>
                      &nbsp;&nbsp;"price": 0.042,<br/>
                      &nbsp;&nbsp;"paymentUrl": "/payment/...",<br/>
                      &nbsp;&nbsp;"generationId": "gen_..."<br/>
                      {'}'}
                    </code>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-light text-black mt-6 sm:mt-8 mb-3 sm:mb-4">After Payment</h3>
                  <div className="bg-black/5 p-4 sm:p-5 md:p-6 font-mono text-[11px] sm:text-xs md:text-sm rounded-sm overflow-x-auto">
                    <code className="text-black/60">
                      GET /api/generate/{'{'}generationId{'}'}<br/>
                      <br/>
                      Response:<br/>
                      {'{'}<br/>
                      &nbsp;&nbsp;"success": true,<br/>
                      &nbsp;&nbsp;"result": "https://...",<br/>
                      &nbsp;&nbsp;"type": "image"<br/>
                      {'}'}
                    </code>
                  </div>
                </div>
              </section>

              {/* Technical Details */}
              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-black mb-4 sm:mb-5 md:mb-6">Technical Details</h2>
                <div className="space-y-4 text-black/40 leading-relaxed text-sm sm:text-base">
                  <div className="bg-black/5 p-4 sm:p-5 md:p-6 rounded-sm">
                    <h3 className="text-lg sm:text-xl font-medium text-black mb-2 sm:mb-3">Performance</h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Average generation time: 25-240 seconds (depends on model)</li>
                      <li>Image resolution: Up to 1024x1024</li>
                      <li>Video length: 5-15 seconds (Sora 2)</li>
                      <li>Multiple aspect ratios supported</li>
                    </ul>
                  </div>
                  
                  <div className="bg-black/5 p-4 sm:p-5 md:p-6 rounded-sm">
                    <h3 className="text-lg sm:text-xl font-medium text-black mb-2 sm:mb-3">Output Formats</h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Images: PNG, JPEG</li>
                      <li>Videos: MP4</li>
                      <li>Direct download available</li>
                      <li>Share to social media</li>
                    </ul>
                  </div>

                  <div className="bg-black/5 p-4 sm:p-5 md:p-6 rounded-sm">
                    <h3 className="text-lg sm:text-xl font-medium text-black mb-2 sm:mb-3">Platform Features</h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Wallet-gated access (Solana wallet required)</li>
                      <li>Download high-resolution outputs</li>
                      <li>Share directly to social platforms</li>
                      <li>No watermarks on outputs</li>
                      <li>Real-time generation progress tracking</li>
                      <li>Multi-image generation support (up to 4)</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Wallet Setup */}
              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-black mb-4 sm:mb-5 md:mb-6">Wallet Setup</h2>
                <div className="space-y-4 text-black/40 leading-relaxed text-sm sm:text-base">
                  <p>
                    To use PayPer402, you need a Solana wallet with USDC.
                  </p>
                  
                  <div className="bg-black/5 p-4 sm:p-5 md:p-6 space-y-4 rounded-sm">
                    <h3 className="text-lg sm:text-xl font-medium text-black">Supported Wallets</h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li><strong className="text-black/60">Phantom:</strong> Most popular Solana wallet (recommended)</li>
                      <li><strong className="text-black/60">Solflare:</strong> Feature-rich wallet with staking</li>
                      <li><strong className="text-black/60">Coinbase Wallet:</strong> From Coinbase exchange</li>
                    </ul>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-light text-black mt-6 sm:mt-8 mb-3 sm:mb-4">Setup Guide</h3>
                  <div className="space-y-4">
                    <div className="bg-black/5 p-4 sm:p-5 md:p-6 rounded-sm">
                      <h4 className="font-medium text-black mb-1.5">1. Install Wallet</h4>
                      <p>Download Phantom from phantom.app or as a browser extension</p>
                    </div>
                    <div className="bg-black/5 p-4 sm:p-5 md:p-6 rounded-sm">
                      <h4 className="font-medium text-black mb-1.5">2. Buy SOL & USDC</h4>
                      <p>Buy SOL (for transaction fees) and USDC (for payments) from an exchange like Coinbase or Binance</p>
                    </div>
                    <div className="bg-black/5 p-4 sm:p-5 md:p-6 rounded-sm">
                      <h4 className="font-medium text-black mb-1.5">3. Send to Wallet</h4>
                      <p>Send SOL and USDC to your Solana wallet address</p>
                    </div>
                    <div className="bg-black/5 p-4 sm:p-5 md:p-6 rounded-sm">
                      <h4 className="font-medium text-black mb-1.5">4. Connect & Generate</h4>
                      <p>Connect wallet on PayPer402 and start generating!</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Best Practices */}
              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-black mb-4 sm:mb-5 md:mb-6">Best Practices</h2>
                <div className="space-y-4 text-black/40 leading-relaxed text-sm sm:text-base">
                  <h3 className="text-xl sm:text-2xl font-light text-black mb-3 sm:mb-4">Writing Effective Prompts</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Be specific and detailed in your descriptions</li>
                    <li>Include style, mood, lighting, and composition details</li>
                    <li>Mention specific art styles or references if desired</li>
                    <li>For videos, describe movement and action</li>
                  </ul>

                  <h3 className="text-xl sm:text-2xl font-light text-black mt-6 sm:mt-8 mb-3 sm:mb-4">Example Prompts</h3>
                  <div className="bg-black/5 p-4 sm:p-5 md:p-6 space-y-4 rounded-sm">
                    <div>
                      <p className="font-medium text-black mb-1.5">Good Image Prompt:</p>
                      <p className="italic">"A serene Japanese garden at sunset, cherry blossoms falling, traditional wooden bridge over koi pond, soft golden lighting, photorealistic, 4k quality"</p>
                    </div>
                    <div>
                      <p className="font-medium text-black mb-1.5">Good Video Prompt:</p>
                      <p className="italic">"Slow motion footage of a surfer riding a massive wave at golden hour, water droplets glistening, cinematic camera angle, professional surfing"</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Support & Community */}
              <section>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-light text-black mb-4 sm:mb-5 md:mb-6">Support & Community</h2>
                <div className="space-y-4 text-black/40 leading-relaxed text-sm sm:text-base">
                  <p>
                    Need help? We're here to assist you. Join our community and contribute to the project.
                  </p>
                  <div className="bg-black/5 p-4 sm:p-5 md:p-6 rounded-sm">
                    <ul className="space-y-3">
                      <li className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                        <span className="font-medium text-black sm:w-24">Platform:</span>
                        <span>Visit the main page and start generating</span>
                      </li>
                      <li className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                        <span className="font-medium text-black sm:w-24">About:</span>
                        <span>Learn more about our platform features</span>
                      </li>
                      <li className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3">
                        <span className="font-medium text-black sm:w-24">Status:</span>
                        <span>99.9% uptime across all models</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-black/5 p-4 sm:p-5 md:p-6 mt-6 sm:mt-8 rounded-sm">
                    <h3 className="text-lg sm:text-xl font-medium text-black mb-3 sm:mb-4">Open Source</h3>
                    <p className="mb-3 sm:mb-4">
                      PayPer402 is open source! Check out our code, contribute, or fork the project on GitHub.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                      <a 
                        href="https://github.com/Russioo/PayPer402" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 bg-black text-white hover:bg-black/80 transition-colors duration-300"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                        </svg>
                        View on GitHub
                      </a>
                      <a 
                        href="https://x.com/payper402x" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 bg-black text-white hover:bg-black/80 transition-colors duration-300"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                        Follow on X
                      </a>
                    </div>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

