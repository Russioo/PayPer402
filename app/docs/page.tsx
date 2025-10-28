'use client';

import Header from '@/components/Header';
import InteractiveBackground from '@/components/InteractiveBackground';

export default function DocsPage() {
  return (
    <div className="min-h-screen">
      <InteractiveBackground />
      
      <div className="relative z-10">
        <Header />

        <main className="pt-32 pb-24 px-8">
          <div className="max-w-4xl mx-auto">
            
            {/* Hero */}
            <div className="mb-20">
              <h1 className="text-7xl font-extralight text-black mb-8 tracking-tight">
                Documentation
              </h1>
              <p className="text-2xl text-black/25 font-extralight">
                Everything you need to know about PayPer402 AI Generation Platform
              </p>
            </div>

            {/* Content */}
            <div className="space-y-16">
              
              {/* Getting Started */}
              <section>
                <h2 className="text-4xl font-light text-black mb-6">Getting Started</h2>
                <div className="space-y-4 text-black/40 leading-relaxed">
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
                <h2 className="text-4xl font-light text-black mb-6">How to Use</h2>
                <div className="space-y-6">
                  <div className="bg-black/5 p-6">
                    <h3 className="text-xl font-medium text-black mb-3">Step 1: Choose Type</h3>
                    <p className="text-black/40">
                      Select whether you want to generate images or videos. Each type has different models optimized for that format.
                    </p>
                  </div>
                  <div className="bg-black/5 p-6">
                    <h3 className="text-xl font-medium text-black mb-3">Step 2: Select Model</h3>
                    <p className="text-black/40">
                      Choose from available AI models. Each model has different strengths, pricing, and output styles.
                    </p>
                  </div>
                  <div className="bg-black/5 p-6">
                    <h3 className="text-xl font-medium text-black mb-3">Step 3: Write Prompt</h3>
                    <p className="text-black/40">
                      Describe what you want to create. Be specific and detailed for best results. 
                      Example: "A futuristic cityscape at sunset with flying cars and neon lights"
                    </p>
                  </div>
                  <div className="bg-black/5 p-6">
                    <h3 className="text-xl font-medium text-black mb-3">Step 4: Pay & Generate</h3>
                    <p className="text-black/40">
                      Complete payment via HTTP 402 protocol using USDC. Your content generates instantly after payment confirmation.
                    </p>
                  </div>
                </div>
              </section>

              {/* Pricing */}
              <section>
                <h2 className="text-4xl font-light text-black mb-6">Pricing</h2>
                <div className="space-y-4 text-black/40">
                  <p>Pay per generation. No subscription, no monthly fees.</p>
                  <div className="bg-black/5 p-6 space-y-3">
                    <div className="flex justify-between items-center border-b border-black/5 pb-3">
                      <span className="font-medium text-black">Qwen</span>
                      <span className="font-mono text-black">$0.030 <span className="text-xs text-black/40">per picture</span></span>
                    </div>
                    <div className="flex justify-between items-center border-b border-black/5 pb-3">
                      <span className="font-medium text-black">4o Image</span>
                      <span className="font-mono text-black">$0.042 <span className="text-xs text-black/40">per picture</span></span>
                    </div>
                    <div className="flex justify-between items-center border-b border-black/5 pb-3">
                      <span className="font-medium text-black">Ideogram V3</span>
                      <span className="font-mono text-black">$0.066 <span className="text-xs text-black/40">per picture</span></span>
                    </div>
                    <div className="flex justify-between items-center border-b border-black/5 pb-3">
                      <span className="font-medium text-black">Sora 2</span>
                      <span className="font-mono text-black">$0.210 <span className="text-xs text-black/40">per video</span></span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-black">Veo 3.1</span>
                      <span className="font-mono text-black">$0.360 <span className="text-xs text-black/40">per video</span></span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Payment System */}
              <section>
                <h2 className="text-4xl font-light text-black mb-6">Payment System</h2>
                <div className="space-y-4 text-black/40 leading-relaxed">
                  <p>
                    PayPer402 uses the HTTP 402 Payment Required protocol for instant micro-payments.
                  </p>
                  <div className="bg-black/5 p-6 space-y-4">
                    <h3 className="text-xl font-medium text-black">Features</h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>No login or account required</li>
                      <li>No subscription or monthly fees</li>
                      <li>Pay with USDC cryptocurrency</li>
                      <li>Instant payment verification</li>
                      <li>Blockchain-secured transactions</li>
                      <li>AI-agent compatible</li>
                    </ul>
                  </div>
                  <p>
                    When you click generate, the system returns an HTTP 402 response with payment details. 
                    Complete payment via USDC, and your content generates immediately.
                  </p>
                </div>
              </section>

              {/* API Integration */}
              <section>
                <h2 className="text-4xl font-light text-black mb-6">API Integration</h2>
                <div className="space-y-4 text-black/40 leading-relaxed">
                  <p>
                    The platform integrates with leading AI providers to deliver professional results.
                  </p>
                  
                  <h3 className="text-2xl font-light text-black mt-8 mb-4">OpenAI (4o Image, Sora 2)</h3>
                  <div className="bg-black/5 p-6 font-mono text-sm">
                    <code className="text-black/60">
                      POST /api/generate<br/>
                      {'{'}<br/>
                      &nbsp;&nbsp;"model": "gpt-image-1",<br/>
                      &nbsp;&nbsp;"prompt": "Your description",<br/>
                      &nbsp;&nbsp;"type": "image"<br/>
                      {'}'}
                    </code>
                  </div>

                  <h3 className="text-2xl font-light text-black mt-8 mb-4">Response Format</h3>
                  <div className="bg-black/5 p-6 font-mono text-sm">
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

                  <h3 className="text-2xl font-light text-black mt-8 mb-4">After Payment</h3>
                  <div className="bg-black/5 p-6 font-mono text-sm">
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
                <h2 className="text-4xl font-light text-black mb-6">Technical Details</h2>
                <div className="space-y-4 text-black/40 leading-relaxed">
                  <div className="bg-black/5 p-6">
                    <h3 className="text-xl font-medium text-black mb-3">Performance</h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Average generation time: 25-240 seconds (depends on model)</li>
                      <li>Image resolution: Up to 1024x1024</li>
                      <li>Video length: 5-15 seconds (Sora 2)</li>
                      <li>Multiple aspect ratios supported</li>
                    </ul>
                  </div>
                  
                  <div className="bg-black/5 p-6">
                    <h3 className="text-xl font-medium text-black mb-3">Output Formats</h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Images: PNG, JPEG</li>
                      <li>Videos: MP4</li>
                      <li>Direct download available</li>
                      <li>Share to social media</li>
                    </ul>
                  </div>

                  <div className="bg-black/5 p-6">
                    <h3 className="text-xl font-medium text-black mb-3">Features</h3>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Create variations of existing generations</li>
                      <li>Download high-resolution outputs</li>
                      <li>Share directly to social platforms</li>
                      <li>No watermarks on outputs</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Best Practices */}
              <section>
                <h2 className="text-4xl font-light text-black mb-6">Best Practices</h2>
                <div className="space-y-4 text-black/40 leading-relaxed">
                  <h3 className="text-2xl font-light text-black mb-4">Writing Effective Prompts</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Be specific and detailed in your descriptions</li>
                    <li>Include style, mood, lighting, and composition details</li>
                    <li>Mention specific art styles or references if desired</li>
                    <li>For videos, describe movement and action</li>
                  </ul>

                  <h3 className="text-2xl font-light text-black mt-8 mb-4">Example Prompts</h3>
                  <div className="bg-black/5 p-6 space-y-4">
                    <div>
                      <p className="font-medium text-black mb-2">Good Image Prompt:</p>
                      <p className="italic">"A serene Japanese garden at sunset, cherry blossoms falling, traditional wooden bridge over koi pond, soft golden lighting, photorealistic, 4k quality"</p>
                    </div>
                    <div>
                      <p className="font-medium text-black mb-2">Good Video Prompt:</p>
                      <p className="italic">"Slow motion footage of a surfer riding a massive wave at golden hour, water droplets glistening, cinematic camera angle, professional surfing"</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Support */}
              <section>
                <h2 className="text-4xl font-light text-black mb-6">Support</h2>
                <div className="space-y-4 text-black/40 leading-relaxed">
                  <p>
                    Need help? We're here to assist you.
                  </p>
                  <div className="bg-black/5 p-6">
                    <ul className="space-y-3">
                      <li className="flex items-center gap-3">
                        <span className="font-medium text-black w-24">Platform:</span>
                        <span>Visit the main page and start generating</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="font-medium text-black w-24">About:</span>
                        <span>Learn more about our platform features</span>
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="font-medium text-black w-24">Status:</span>
                        <span>99.9% uptime across all models</span>
                      </li>
                    </ul>
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

