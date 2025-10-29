/**
 * Token Price Service
 * Henter live priser på $PAYPER token fra forskellige kilder
 */

import { PAYMENT_TOKEN_MINT_ADDRESS } from './solana-payment';

export interface TokenPrice {
  priceUSD: number;
  source: string;
  timestamp: number;
}

// Cache til at undgå for mange API kald
let cachedPrice: TokenPrice | null = null;
const CACHE_DURATION = 30000; // 30 sekunder

/**
 * Henter $PAYPER token pris fra DexScreener API
 */
async function fetchPriceFromDexScreener(): Promise<number | null> {
  try {
    const mintAddress = PAYMENT_TOKEN_MINT_ADDRESS.toBase58();
    const response = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${mintAddress}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('DexScreener API error:', response.status);
      return null;
    }

    const data = await response.json();
    
    // DexScreener returnerer et array af pairs for token
    if (data.pairs && data.pairs.length > 0) {
      // Tag den første (mest liquid) pair
      const mainPair = data.pairs[0];
      console.log('🔍 DexScreener raw priceUsd:', mainPair.priceUsd, typeof mainPair.priceUsd);
      
      // Parse price - håndter både string og number, samt komma/punktum
      let priceString = String(mainPair.priceUsd);
      // Erstat komma med punktum hvis der er komma
      priceString = priceString.replace(',', '.');
      const price = parseFloat(priceString);
      
      console.log(`🔍 After parsing: ${price} (original: ${mainPair.priceUsd})`);
      
      if (price && price > 0 && !isNaN(price)) {
        console.log(`💰 $PAYPER pris fra DexScreener: $${price}`);
        console.log(`💰 $PAYPER pris (scientific): ${price.toExponential()}`);
        
        // Sanity check: For $0.03 USD skulle vi ikke bruge mere end ~10,000 tokens
        const testAmount = 0.03;
        const tokensNeeded = (testAmount / 0.9) / price;
        console.log(`🧪 Sanity test: $${testAmount} ville koste ${tokensNeeded.toFixed(0)} tokens`);
        
        if (tokensNeeded > 100000) {
          console.error(`⚠️ ADVARSEL: Pris ser for lav ud! ${tokensNeeded.toFixed(0)} tokens for $${testAmount}!`);
          console.error(`⚠️ Springer over denne pris...`);
          return null;
        }
        
        return price;
      }
    }

    console.warn('Ingen valid pris fundet på DexScreener');
    return null;
  } catch (error) {
    console.error('Fejl ved hentning af pris fra DexScreener:', error);
    return null;
  }
}

/**
 * Henter $PAYPER token pris fra Jupiter API (backup)
 */
async function fetchPriceFromJupiter(): Promise<number | null> {
  try {
    const mintAddress = PAYMENT_TOKEN_MINT_ADDRESS.toBase58();
    const response = await fetch(
      `https://price.jup.ag/v4/price?ids=${mintAddress}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('Jupiter API error:', response.status);
      return null;
    }

    const data = await response.json();
    
    if (data.data && data.data[mintAddress]) {
      console.log('🔍 Jupiter raw price:', data.data[mintAddress].price, typeof data.data[mintAddress].price);
      
      let priceString = String(data.data[mintAddress].price);
      priceString = priceString.replace(',', '.');
      const price = parseFloat(priceString);
      
      console.log(`🔍 After parsing: ${price}`);
      
      if (price && price > 0 && !isNaN(price)) {
        // Sanity check
        const testAmount = 0.03;
        const tokensNeeded = (testAmount / 0.9) / price;
        console.log(`🧪 Sanity test: $${testAmount} ville koste ${tokensNeeded.toFixed(0)} tokens`);
        
        if (tokensNeeded > 100000) {
          console.error(`⚠️ ADVARSEL: Jupiter pris ser for lav ud! Springer over...`);
          return null;
        }
        
        console.log(`💰 $PAYPER pris fra Jupiter: $${price}`);
        return price;
      }
    }

    console.warn('Ingen valid pris fundet på Jupiter');
    return null;
  } catch (error) {
    console.error('Fejl ved hentning af pris fra Jupiter:', error);
    return null;
  }
}

/**
 * Henter den aktuelle $PAYPER token pris i USD
 * Prøver flere kilder og bruger cache
 */
export async function getTokenPriceUSD(): Promise<TokenPrice> {
  // Tjek cache først
  if (cachedPrice && Date.now() - cachedPrice.timestamp < CACHE_DURATION) {
    console.log('📦 Bruger cached $PAYPER pris:', cachedPrice.priceUSD);
    return cachedPrice;
  }

  console.log('🔍 Henter ny $PAYPER pris...');

  // Prøv DexScreener først (mere pålidelig for nye tokens)
  let price = await fetchPriceFromDexScreener();
  let source = 'DexScreener';

  // Hvis DexScreener fejler, prøv Jupiter
  if (!price) {
    console.log('⚠️  DexScreener fejlede, prøver Jupiter...');
    price = await fetchPriceFromJupiter();
    source = 'Jupiter';
  }

  // Fallback til standard værdi hvis begge kilder fejler
  if (!price || price <= 0) {
    console.warn('⚠️  Kunne ikke hente live pris, bruger fallback');
    price = 0.0001; // Fallback: $0.0001 per token
    source = 'Fallback';
  }
  
  // Safety check: hvis prisen er EKSTREMT lav (under $0.00000001), noget er nok galt
  if (price < 0.00000001) {
    console.error(`⚠️ ⚠️  ADVARSEL: Token pris er EKSTREMT lav: $${price}`);
    console.error(`⚠️ ⚠️  Dette ville kræve ${(0.030 / price).toFixed(0)} tokens for en $0.030 betaling!`);
    console.error(`⚠️ ⚠️  Bruger sikker fallback i stedet: $0.0001`);
    price = 0.0001;
    source = 'SafeFallback';
  }

  // Cache resultatet
  cachedPrice = {
    priceUSD: price,
    source,
    timestamp: Date.now(),
  };

  return cachedPrice;
}

// 10% buyback fee - bruges til at købe tilbage $PAYPER fra markedet
export const BUYBACK_FEE_PERCENTAGE = 10;

/**
 * Beregner hvor mange $PAYPER tokens der skal bruges for et givet USD beløb
 * Brugeren betaler det antal tokens der svarer til USD beløbet
 * Vi tager 10% af betalingen til buyback
 * 
 * Eksempel: Model koster $0.03, token pris er $0.0001
 * - Brugeren betaler: $0.03 / $0.0001 = 300 PAYPER
 * - 10% buyback: 30 PAYPER
 * - Vi modtager: 270 PAYPER
 */
export async function calculateTokenAmount(usdAmount: number): Promise<{
  tokenAmount: number;
  tokenAmountWithFee: number;
  baseAmount: number;
  feeAmount: number;
  tokenPrice: number;
  source: string;
}> {
  const priceInfo = await getTokenPriceUSD();
  
  console.log(`🔍 ===== PRIS DEBUG =====`);
  console.log(`🔍 Token pris brugt: $${priceInfo.priceUSD} (${priceInfo.source})`);
  console.log(`🔍 Token pris (scientific): ${priceInfo.priceUSD.toExponential()}`);
  console.log(`🔍 USD amount: $${usdAmount}`);
  
  // Beregn hvor mange tokens der svarer til USD beløbet
  // F.eks: $0.03 / $0.0001 per token = 300 tokens
  const totalTokenAmountExact = usdAmount / priceInfo.priceUSD;
  
  // Rund ned til heltal (ingen decimaler)
  const totalTokenAmount = Math.floor(totalTokenAmountExact);
  
  console.log(`🔍 Beregning: $${usdAmount} / $${priceInfo.priceUSD} = ${totalTokenAmountExact.toFixed(2)} → ${totalTokenAmount} tokens (afrundet)`);
  
  // 10% af betalingen går til buyback (også afrundet)
  const feeAmount = Math.floor(totalTokenAmount * (BUYBACK_FEE_PERCENTAGE / 100));
  
  // Det vi faktisk modtager (90% af betalingen)
  const baseTokenAmount = totalTokenAmount - feeAmount;

  console.log(`💵 Model pris: $${usdAmount} USD`);
  console.log(`💰 Brugeren betaler: ${totalTokenAmount} $PAYPER`);
  console.log(`🔥 10% Buyback: ${feeAmount} $PAYPER`);
  console.log(`✅ Vi modtager: ${baseTokenAmount} $PAYPER`);
  console.log(`🔍 ===== SLUT DEBUG =====`);

  return {
    tokenAmount: totalTokenAmount, // Total amount brugeren betaler
    tokenAmountWithFee: totalTokenAmount,
    baseAmount: baseTokenAmount, // Det vi modtager (90%)
    feeAmount: feeAmount, // Går til buyback (10%)
    tokenPrice: priceInfo.priceUSD,
    source: priceInfo.source,
  };
}

/**
 * Formatterer token pris til læsbar string
 */
export function formatTokenPrice(price: number): string {
  if (price < 0.000001) {
    return `$${(price * 1000000).toFixed(2)}M`; // Millionths
  } else if (price < 0.001) {
    return `$${(price * 1000).toFixed(4)}K`; // Thousandths
  } else if (price < 1) {
    return `$${price.toFixed(6)}`;
  } else {
    return `$${price.toFixed(4)}`;
  }
}

