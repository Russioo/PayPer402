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
      const price = parseFloat(mainPair.priceUsd);
      
      if (price && price > 0) {
        console.log(`💰 $PAYPER pris fra DexScreener: $${price}`);
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
      const price = data.data[mintAddress].price;
      
      if (price && price > 0) {
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
    price = 0.0001; // Fallback: $0.0001 per token (10x mindre end USDC)
    source = 'Fallback';
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
 * 10% af den TOTALE betaling går til buyback
 * Så hvis model koster $0.042, skal brugeren betale $0.042 / 0.9 = $0.0467
 * Hvoraf 10% ($0.00467) går til buyback, og vi får $0.042
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
  
  // Beregn total pris som brugeren skal betale
  // usdAmount er hvad VI skal modtage (90% af total)
  // Så total = usdAmount / 0.9
  const totalUSD = usdAmount / (1 - BUYBACK_FEE_PERCENTAGE / 100);
  const totalTokenAmount = totalUSD / priceInfo.priceUSD;
  
  // 10% af TOTAL betalingen går til buyback
  const feeAmount = totalTokenAmount * (BUYBACK_FEE_PERCENTAGE / 100);
  
  // Det vi faktisk modtager (90% af total)
  const baseTokenAmount = totalTokenAmount - feeAmount;

  console.log(`💵 Model pris (hvad vi modtager): $${usdAmount} USD = ${baseTokenAmount.toFixed(2)} $PAYPER`);
  console.log(`💰 Total pris (inkl. buyback): $${totalUSD.toFixed(4)} USD = ${totalTokenAmount.toFixed(2)} $PAYPER`);
  console.log(`🔥 10% Buyback Fee: ${feeAmount.toFixed(2)} $PAYPER`);

  return {
    tokenAmount: totalTokenAmount, // Total amount brugeren betaler
    tokenAmountWithFee: totalTokenAmount,
    baseAmount: baseTokenAmount, // Det vi modtager
    feeAmount: feeAmount, // Går til buyback
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

