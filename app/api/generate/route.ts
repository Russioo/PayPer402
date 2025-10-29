import { NextRequest, NextResponse } from 'next/server';
import { getModelById } from '@/lib/models';
import { createSoraTask } from '@/lib/kie-ai';
import { createVeoTask } from '@/lib/veo-ai';
import { create4oImageTask } from '@/lib/openai-image';
import { createIdeogramTask } from '@/lib/ideogram-ai';
import { createQwenTask } from '@/lib/qwen-ai';
import { generations } from '@/lib/storage';
import { Connection, clusterApiUrl } from '@solana/web3.js';
import { verifyUSDCPayment } from '@/lib/solana-payment';
import { executeBuyback } from '@/lib/pumpportal-buyback';
import { calculateTokenAmount } from '@/lib/token-price';

// Store for pending payments (i produktion, brug database)
const pendingPayments = new Map<string, {
  model: string;
  prompt: string;
  type: string;
  options: any;
  amount: number;
  createdAt: Date;
}>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { model, prompt, type, options, paymentSignature } = body;

    if (!model || !prompt || !type) {
      return NextResponse.json(
        { error: 'Model, prompt, and type are required' },
        { status: 400 }
      );
    }

    const modelInfo = getModelById(model);
    if (!modelInfo) {
      return NextResponse.json(
        { error: 'Invalid model' },
        { status: 400 }
      );
    }

    // ====== HTTP 402 PAYMENT REQUIRED ======
    // Tjek om der er betalt (via payment signature)
    if (!paymentSignature) {
      // Generer generation ID til denne pending payment
      const generationId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Gem pending generation details
      pendingPayments.set(generationId, {
        model,
        prompt,
        type,
        options,
        amount: modelInfo.price,
        createdAt: new Date(),
      });

      console.log('🚫 HTTP 402: Payment Required');
      console.log('Generation ID:', generationId);
      console.log('Amount:', modelInfo.price, 'USDC');

      // Returner HTTP 402 Payment Required
      return new NextResponse(
        JSON.stringify({
          error: 'Payment Required',
          message: 'This resource requires payment',
          generationId,
          paymentRequired: true,
          amount: modelInfo.price,
          currency: 'USDC',
          network: 'Solana',
          model: modelInfo.name,
        }),
        { 
          status: 402,
          headers: {
            'Content-Type': 'application/json',
            'WWW-Authenticate': `Bearer realm="PayPer402", amount="${modelInfo.price}", currency="USDC", network="Solana"`,
          },
        }
      );
    }

    // Verificer betaling on-chain
    console.log('💳 Verificerer betaling...');
    console.log('Payment Signature:', paymentSignature);
    
    // RPC endpoint for payment verification
    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 
                   clusterApiUrl('mainnet-beta');
    const connection = new Connection(rpcUrl, 'confirmed');
    const isPaid = await verifyUSDCPayment(connection, paymentSignature, modelInfo.price);

    if (!isPaid) {
      console.log('❌ Betaling ikke verificeret');
      return NextResponse.json(
        { 
          error: 'Payment verification failed',
          message: 'Could not verify payment on Solana blockchain',
        },
        { status: 402 }
      );
    }

    console.log('✅ Payment verified! Starting generation...');
    
    // ====== AUTOMATIC BUYBACK ======
    // Execute buyback of $PAYPER with 10% fee
    try {
      console.log('🔥 Starting automatic buyback...');
      
      // Calculate fee amount based on model price
      const { feeAmount, tokenPrice } = await calculateTokenAmount(modelInfo.price);
      
      console.log(`💰 Model price: $${modelInfo.price} USD`);
      console.log(`🔥 Fee amount: ${feeAmount.toFixed(2)} $PAYPER`);
      console.log(`💵 Token price: $${tokenPrice} USD`);
      
      // Buyback logic: 10% af model pris × 4000
      const BUYBACK_MULTIPLIER = 4000;
      const modelPrice10Percent = modelInfo.price * 0.10;
      const buybackUSD = modelPrice10Percent * BUYBACK_MULTIPLIER;
      console.log(`🔥 10% af model pris: $${modelPrice10Percent.toFixed(4)} USD`);
      console.log(`🔥 Buyback multiplier: ${BUYBACK_MULTIPLIER}x`);
      console.log(`💰 Buyback USD value: $${buybackUSD.toFixed(2)} USD ($${modelPrice10Percent.toFixed(4)} × ${BUYBACK_MULTIPLIER})`);
      
      // Get SOL price from DexScreener
      let solPrice = 170; // Fallback SOL price
      try {
        const solMint = 'So11111111111111111111111111111111111111112';
        const solPriceResponse = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${solMint}`, {
          signal: AbortSignal.timeout(3000), // 3 second timeout
        });
        
        if (solPriceResponse.ok) {
          const solPriceData = await solPriceResponse.json();
          if (solPriceData.pairs && solPriceData.pairs.length > 0) {
            const mainPair = solPriceData.pairs[0];
            const price = parseFloat(mainPair.priceUsd);
            if (price && price > 0) {
              solPrice = price;
              console.log(`💰 SOL price from DexScreener: $${solPrice} USD`);
            }
          }
        }
      } catch (priceError) {
        console.warn('⚠️  Could not fetch SOL price from DexScreener, using fallback:', solPrice);
      }
      
      // Convert buyback USD to SOL
      const buybackSOL = buybackUSD / solPrice;
      
      console.log(`💰 SOL price used: $${solPrice} USD`);
      console.log(`💰 Buyback amount: ${buybackSOL.toFixed(6)} SOL ($${buybackUSD.toFixed(2)} USD)`);
      
      // Minimum 0.00001 SOL (very small but allows testing and micro payments)
      if (buybackSOL >= 0.00001) {
        console.log(`🔥 Executing buyback for ${buybackSOL.toFixed(6)} SOL ($${buybackUSD.toFixed(2)} USD)...`);
        
        const buybackResult = await executeBuyback(buybackSOL, paymentSignature);
        
        if (buybackResult.success) {
          console.log('✅ Buyback executed successfully!');
          console.log('🔗 Buyback TX:', `https://solscan.io/tx/${buybackResult.txSignature}`);
        } else {
          console.warn('⚠️  Buyback failed:', buybackResult.error);
          // We continue anyway - buyback is not critical for generation
        }
      } else {
        console.log(`⚠️  Buyback amount too small: ${buybackSOL.toFixed(8)} SOL (minimum: 0.00001 SOL)`);
      }
    } catch (buybackError) {
      console.error('❌ Buyback error (non-critical):', buybackError);
      // Buyback error should not stop generation flow
    }
    // ====== END BUYBACK ======
    
    // ====== END HTTP 402 CHECK ======

    // For GPT Image 1 (4o Image), create Kie.ai task immediately
    if (model === 'gpt-image-1') {
      try {
        console.log('Creating 4o Image task with prompt:', prompt);
        console.log('Options:', options);
        
        const imageResponse = await create4oImageTask({
          prompt,
          size: options?.size || '1:1',
          nVariants: options?.nVariants || 1,
          filesUrl: options?.filesUrl, // Pass reference images if provided
        });

        const taskId = imageResponse.data.taskId;
        
        console.log('4o Image task created:', taskId);

        return NextResponse.json({
          success: true,
          taskId: taskId,
          message: 'Image generation started',
          status: 'processing',
          model: 'gpt-image-1',
        });
      } catch (error: any) {
        console.error('Failed to create 4o Image task:', error);
        return NextResponse.json(
          { 
            error: 'Failed to initiate image generation',
            message: error.message,
          },
          { status: 500 }
        );
      }
    }

    // For Ideogram v3, create task immediately
    if (model === 'ideogram') {
      try {
        console.log('Creating Ideogram task with prompt:', prompt);
        console.log('Options:', options);
        
        const ideogramResponse = await createIdeogramTask({
          prompt,
          renderingSpeed: options?.renderingSpeed || 'BALANCED',
          style: options?.style || 'AUTO',
          expandPrompt: options?.expandPrompt !== undefined ? options.expandPrompt : true,
          imageSize: options?.imageSize || 'square_hd',
          numImages: options?.numImages || '1',
          seed: options?.seed,
          negativePrompt: options?.negativePrompt,
        });

        const taskId = ideogramResponse.taskId;
        
        console.log('Ideogram task created:', taskId);

        return NextResponse.json({
          success: true,
          taskId: taskId,
          message: 'Image generation started',
          status: 'processing',
          model: 'ideogram',
        });
      } catch (error: any) {
        console.error('Failed to create Ideogram task:', error);
        return NextResponse.json(
          { 
            error: 'Failed to initiate image generation',
            message: error.message,
          },
          { status: 500 }
        );
      }
    }

    // For Qwen, create task immediately
    if (model === 'qwen') {
      try {
        console.log('Creating Qwen task with prompt:', prompt);
        console.log('Options:', options);
        
        const qwenResponse = await createQwenTask({
          prompt,
          imageSize: options?.imageSize || 'square_hd',
          numInferenceSteps: options?.numInferenceSteps || 30,
          seed: options?.seed,
          guidanceScale: options?.guidanceScale || 2.5,
          enableSafetyChecker: options?.enableSafetyChecker !== undefined ? options.enableSafetyChecker : true,
          outputFormat: options?.outputFormat || 'png',
          negativePrompt: options?.negativePrompt,
          acceleration: options?.acceleration || 'none',
        });

        const taskId = qwenResponse.taskId;
        
        console.log('Qwen task created:', taskId);

        return NextResponse.json({
          success: true,
          taskId: taskId,
          message: 'Image generation started',
          status: 'processing',
          model: 'qwen',
        });
      } catch (error: any) {
        console.error('Failed to create Qwen task:', error);
        return NextResponse.json(
          { 
            error: 'Failed to initiate image generation',
            message: error.message,
          },
          { status: 500 }
        );
      }
    }

    // For Sora 2, create Kie.ai task immediately
    if (model === 'sora-2') {
      try {
        console.log('Creating Sora 2 task with options:', options);
        
        const kieResponse = await createSoraTask(prompt, {
          aspect_ratio: options?.aspect_ratio || 'landscape',
          n_frames: options?.n_frames || '10',
          remove_watermark: options?.remove_watermark ?? true,
        });

        const kieTaskId = kieResponse.data.taskId;
        
        console.log('Sora 2 task created:', kieTaskId);

        // Returner taskId direkte - INGEN Map storage nødvendig!
        return NextResponse.json({
          success: true,
          taskId: kieTaskId,
          message: 'Video generation started',
          status: 'processing',
          model: 'sora-2',
        });
      } catch (error: any) {
        console.error('Failed to create Kie.ai task:', error);
        return NextResponse.json(
          { 
            error: 'Failed to initiate video generation',
            message: error.message,
          },
          { status: 500 }
        );
      }
    }

    // For Veo 3.1, create Veo task immediately
    if (model === 'veo-3.1') {
      try {
        console.log('Creating Veo 3.1 task with options:', options);
        
        const veoResponse = await createVeoTask(prompt, {
          aspectRatio: options?.aspectRatio || '16:9',
          imageUrls: options?.imageUrls,  // Pass imageUrls if provided
        });

        const veoTaskId = veoResponse.data.taskId;
        
        console.log('Veo 3.1 task created:', veoTaskId);

        // Returner taskId direkte - INGEN Map storage nødvendig!
        return NextResponse.json({
          success: true,
          taskId: veoTaskId,
          message: 'Video generation started',
          status: 'processing',
          model: 'veo-3.1',
        });
      } catch (error: any) {
        console.error('Failed to create Veo task:', error);
        return NextResponse.json(
          { 
            error: 'Failed to initiate video generation',
            message: error.message,
          },
          { status: 500 }
        );
      }
    }

    // For other models, return mock response
    // Generate unique ID for this generation
    const generationId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    generations.set(generationId, {
      model,
      prompt,
      type,
      status: 'processing',
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      generationId,
      message: 'Generation started',
      status: 'processing',
    });
  } catch (error) {
    console.error('Generation failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

