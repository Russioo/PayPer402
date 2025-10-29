# Buyback System Setup Guide

## Overview
Dette system implementerer automatiske buybacks af $PAYPER tokens ved hjælp af 10% fee fra alle betalinger.

## Sådan fungerer det

1. **Bruger betaler** for AI content med $PAYPER tokens
2. **10% fee** beregnes automatisk (vist i payment modal)
3. **Efter payment verification**, konverteres fee til SOL værdi
4. **PumpPortal API** bruges til at købe $PAYPER tokens tilbage
5. **Buyback logges** i Supabase database for transparency

## Setup Steps

### 1. Opret Buyback Wallet

Opret en ny Solana wallet til buybacks:

```bash
# Installer Solana CLI hvis ikke allerede installeret
solana-keygen new --outfile buyback-wallet.json
```

**VIGTIGT**: 
- Hold denne private key sikker
- Denne wallet skal altid have nok SOL til at betale for transaktioner
- Minimum 0.1-0.5 SOL anbefales

### 2. Tilføj til Environment Variables

Tilføj til din `.env.local`:

```env
BUYBACK_WALLET_PUBLIC_KEY=DinPublicKeyHer
BUYBACK_WALLET_PRIVATE_KEY=DinBase58PrivateKeyHer
```

### 3. Opret Supabase Buybacks Tabel

1. Gå til din Supabase projekt
2. Åbn SQL Editor
3. Kør SQL fra `supabase-buybacks-migration.sql`

Dette opretter:
- `buybacks` tabel til tracking
- Indexes for performance
- RLS policies (public read, service role write)

### 4. Test Systemet

```bash
npm run dev
```

1. Gå til https://localhost:3000
2. Connect din wallet
3. Generer noget content
4. Betal med $PAYPER
5. Tjek console logs for buyback status

## Monitoring Buybacks

### Via Supabase Dashboard

Gå til Supabase Table Editor → `buybacks` for at se alle buybacks.

### Via API

Implementer et admin dashboard der kalder:

```typescript
import { getBuybackStats, getRecentBuybacks } from '@/lib/supabase-buybacks';

// Hent stats
const stats = await getBuybackStats();
console.log('Total buybacks:', stats.totalBuybacks);
console.log('Total volume:', stats.totalVolumeUSD, 'USD');

// Hent seneste buybacks
const recent = await getRecentBuybacks(10);
```

## Buyback Flow Diagram

```
[User Payment] → [Verify Payment] → [Calculate 10% Fee] 
    ↓
[Convert to SOL] → [PumpPortal API] → [Buy $PAYPER]
    ↓
[Log to Supabase] → [Complete]
```

## Configuration

### Fee Percentage
Standard er 10%, kan ændres i `lib/token-price.ts`:

```typescript
export const BUYBACK_FEE_PERCENTAGE = 10; // Ændr til ønsket %
```

### Minimum Buyback Amount
Standard er 0.001 SOL minimum i `app/api/payment/verify/route.ts`:

```typescript
if (feeSOL >= 0.001) {
  // Udfør buyback
}
```

### Slippage & Priority Fee
Konfigureres i `lib/pumpportal-buyback.ts`:

```typescript
slippage: 15,        // 15% slippage
priorityFee: 0.001,  // 0.001 SOL priority fee
```

## Troubleshooting

### Buyback fejler

**"Buyback wallet not configured"**
- Tjek at BUYBACK_WALLET_PUBLIC_KEY og BUYBACK_WALLET_PRIVATE_KEY er sat i .env.local

**"Insufficient SOL"**
- Buyback wallet skal have SOL til at betale for transaktioner
- Send SOL til buyback wallet

**"PumpPortal API error"**
- Tjek at token findes på PumpPortal
- Tjek at der er likviditet nok
- Prøv at øge slippage

### Database fejl

**"relation 'buybacks' does not exist"**
- Kør SQL migration fra `supabase-buybacks-migration.sql`

## Security Notes

⚠️ **VIGTIGT**:
- Hold buyback wallet private key SIKKER
- Brug ALDRIG main treasury wallet til buybacks
- Gem aldrig private keys i git
- Brug environment variables
- Overvej at bruge en hardware wallet for store amounts

## Support

For problemer, tjek:
1. Solana transaction på Solscan
2. Server logs
3. Supabase logs
4. PumpPortal documentation

