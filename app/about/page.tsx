'use client';

import Header from '@/components/Header';
import InteractiveBackground from '@/components/InteractiveBackground';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <InteractiveBackground />
      
      <div className="relative z-10">
        <Header />

        <main className="pt-32 pb-24 px-8">
          <div className="max-w-7xl mx-auto">
            
            {/* Hero */}
            <div className="text-center mb-40">
              <h1 className="text-8xl font-extralight text-black mb-12 tracking-tight">
                Why PayPer402
              </h1>
              <p className="text-3xl text-black/25 font-extralight max-w-3xl mx-auto">
                Pay-per-use AI via HTTP 402 Protocol
              </p>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-3 gap-32 mb-48">
              <div className="group text-center hover:scale-105 transition-transform duration-500">
                <div className="mx-auto mb-12 w-24 h-24 flex items-center justify-center">
                  <svg className="w-16 h-16 text-black/10 group-hover:text-black/20 transition-colors duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                </div>
                <h3 className="text-4xl font-extralight text-black mb-10 group-hover:text-indigo-600 transition-colors duration-300">
                  No Subscription
                </h3>
                <p className="text-black/25 leading-relaxed font-extralight text-xl">
                  Pay only for what you generate. No monthly fees, no commitments, just instant access.
                </p>
              </div>

              <div className="group text-center hover:scale-105 transition-transform duration-500">
                <div className="mx-auto mb-12 w-24 h-24 flex items-center justify-center">
                  <svg className="w-16 h-16 text-black/10 group-hover:text-black/20 transition-colors duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <h3 className="text-4xl font-extralight text-black mb-10 group-hover:text-indigo-600 transition-colors duration-300">
                  Leading Models
                </h3>
                <p className="text-black/25 leading-relaxed font-extralight text-xl">
                  Access GPT-Image, Ideogram, Sora, and other industry-leading AI models in one place.
                </p>
              </div>

              <div className="group text-center hover:scale-105 transition-transform duration-500">
                <div className="mx-auto mb-12 w-24 h-24 flex items-center justify-center">
                  <svg className="w-16 h-16 text-black/10 group-hover:text-black/20 transition-colors duration-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </div>
                <h3 className="text-4xl font-extralight text-black mb-10 group-hover:text-indigo-600 transition-colors duration-300">
                  HTTP 402 Protocol
                </h3>
                <p className="text-black/25 leading-relaxed font-extralight text-xl">
                  Built on HTTP 402 Payment Required standard for instant micro-payments and AI-agent compatibility.
                </p>
              </div>
            </div>

            {/* How it Works */}
            <div className="text-center mb-40">
              <h2 className="text-8xl font-extralight text-black mb-12 tracking-tight">
                How it Works
              </h2>
              <p className="text-3xl text-black/25 font-extralight">
                Three simple steps
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-32">
              <div className="group text-center">
                <div className="text-[160px] font-extralight text-black/[0.03] mb-12 leading-none group-hover:text-black/[0.08] transition-all duration-500">
                  01
                </div>
                <h3 className="text-4xl font-extralight text-black mb-10">
                  Choose Model
                </h3>
                <p className="text-black/25 leading-relaxed font-extralight text-xl">
                  Select from 6 professional AI models. Each optimized for different use cases.
                </p>
              </div>

              <div className="group text-center">
                <div className="text-[160px] font-extralight text-black/[0.03] mb-12 leading-none group-hover:text-black/[0.08] transition-all duration-500">
                  02
                </div>
                <h3 className="text-4xl font-extralight text-black mb-10">
                  Pay & Generate
                </h3>
                <p className="text-black/25 leading-relaxed font-extralight text-xl">
                  Secure payment via HTTP 402 protocol. Instant generation after payment.
                </p>
              </div>

              <div className="group text-center">
                <div className="text-[160px] font-extralight text-black/[0.03] mb-12 leading-none group-hover:text-black/[0.08] transition-all duration-500">
                  03
                </div>
                <h3 className="text-4xl font-extralight text-black mb-10">
                  Download & Share
                </h3>
                <p className="text-black/25 leading-relaxed font-extralight text-xl">
                  Download your content or create variations. Share directly to social media.
                </p>
              </div>
            </div>

            {/* Footer */}
            <footer className="pt-32">
              <div className="grid md:grid-cols-3 gap-20 mb-24">
                <div>
                  <div className="font-semibold text-black mb-8 text-2xl">PayPer402</div>
                  <p className="text-base text-black/25 leading-relaxed font-extralight">
                    Professional AI generation platform powered by leading models. 
                    Pay per use with HTTP 402 protocol.
                  </p>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-black/15 mb-8">Platform</div>
                  <ul className="space-y-4 text-base text-black/25 font-extralight">
                    <li><Link href="/#generate" className="hover:text-black transition-colors duration-300">Generate</Link></li>
                    <li><Link href="/about" className="hover:text-black transition-colors duration-300">About</Link></li>
                    <li><Link href="/docs" className="hover:text-black transition-colors duration-300">Documentation</Link></li>
                  </ul>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-[0.2em] text-black/15 mb-8">Info</div>
                  <ul className="space-y-4 text-base text-black/25 font-extralight">
                    <li><span className="text-black/15">6 AI Models</span></li>
                    <li><span className="text-black/15">HTTP 402</span></li>
                    <li><span className="text-black/15">From $0.03</span></li>
                  </ul>
                </div>
              </div>
              <div className="pt-10 flex items-center justify-between text-sm text-black/15 font-extralight">
                <span>© 2025 PayPer402. All rights reserved.</span>
                <span>Powered by HTTP 402 Payment Protocol</span>
              </div>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
