# Solana USDC Payment Setup Guide

This guide helps you set up Solana USDC payments for the PayPer402 platform.

## 📋 Overview

PayPer402 uses **real Solana blockchain payments** with USDC on Solana Mainnet. Users must:

1. Connect their Solana wallet (Phantom, Solflare, Coinbase Wallet, etc.)
2. Pay with USDC on Solana network
3. Payment is verified on-chain before generation starts

## 🔧 Setup

### 1. Update Payment Wallet Address

⚠️ **IMPORTANT**: You must change the payment wallet address in `lib/solana-payment.ts`

Open the file and find this line:

```typescript
export const PAYMENT_WALLET_ADDRESS = new PublicKey('7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU');
```

Replace it with YOUR own Solana wallet address that should receive payments:

```typescript
export const PAYMENT_WALLET_ADDRESS = new PublicKey('YOUR_WALLET_ADDRESS_HERE');
```

### 2. Network Configuration

By default, the platform uses **Solana Mainnet Beta** for real payments.

If you want to test on devnet/testnet first, change in these files:

**`components/WalletProvider.tsx`:**
```typescript
// Change from 'mainnet-beta' to 'devnet' for testing
const endpoint = useMemo(() => clusterApiUrl('devnet'), []);
```

**`app/api/payment/verify/route.ts`:**
```typescript
// Also change here to 'devnet' for testing
const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
```

**`lib/solana-payment.ts`:**
```typescript
// Use USDC Devnet address for testing:
// Devnet: 4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU
export const USDC_MINT_ADDRESS = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');
```

### 3. Test Workflow (Devnet)

1. Get devnet SOL from: https://faucet.solana.com/
2. Get devnet USDC tokens (you need to create or find a devnet USDC faucet)
3. Test payments on devnet first before going to mainnet

### 4. Mainnet Setup (Production)

When you're ready for real payments:

1. ✅ Confirm that `PAYMENT_WALLET_ADDRESS` is set to your wallet
2. ✅ Confirm that all files use `'mainnet-beta'`
3. ✅ Confirm that `USDC_MINT_ADDRESS` is mainnet USDC: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`
4. ✅ Test a small payment first (0.01 USDC)

## 🏗️ How It Works

### Frontend Flow

1. **Wallet Connection**: User connects wallet via Solana Wallet Adapter
2. **Wallet Gate**: Generation section is locked until wallet is connected
3. **Generation Request**: When user starts generation, wallet connection is checked
4. **Payment Modal**: PaymentModal shows with payment details
5. **USDC Transfer**: User approves USDC transfer in their wallet
6. **Transaction Sent**: Transaction is sent to Solana blockchain
7. **Backend Verification**: Backend verifies transaction on-chain
8. **Generation Start**: When verified, AI generation starts

### Backend Flow

```
POST /api/payment/verify
{
  "signature": "...",
  "generationId": "...",
  "amount": 0.5
}
```

Backend:
1. Receives Solana transaction signature
2. Creates connection to Solana RPC
3. Fetches transaction from blockchain
4. Verifies that transaction is confirmed
5. Verifies amount (simple version - can be extended)
6. Returns success/failure

## 💰 USDC Payment Details

### Mainnet USDC
- **Mint Address**: `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v`
- **Decimals**: 6
- **Standard**: SPL Token

### How Amounts Are Converted
```typescript
// From USDC to smallest unit (6 decimals)
const amount = 0.50; // 0.50 USDC
const microUsdc = amount * 1_000_000; // 500000

// From smallest unit to USDC
const microUsdc = 500000;
const usdc = microUsdc / 1_000_000; // 0.50
```

## 🔐 Security

### Backend Verification
Current implementation verifies:
- ✅ Transaction exists on-chain
- ✅ Transaction is confirmed
- ✅ Transaction has no errors

### Improvements (Recommended for Production)
For extra security, extend `verifyUSDCPayment` to verify:
- 📋 Which wallet the payment came from
- 📋 Which wallet the payment went to (should match `PAYMENT_WALLET_ADDRESS`)
- 📋 Exact amount that was sent
- 📋 Token type (should be USDC)
- 📋 Timestamp (to avoid replay attacks)

Example extended verification:
```typescript
export async function verifyUSDCPayment(
  connection: Connection,
  signature: string,
  expectedAmount: number,
  fromWallet?: PublicKey // Optional: verify sender
): Promise<boolean> {
  const transaction = await connection.getTransaction(signature, {
    commitment: 'confirmed',
    maxSupportedTransactionVersion: 0,
  });

  if (!transaction || transaction.meta?.err) {
    return false;
  }

  // Parse transaction instructions
  const instructions = transaction.transaction.message.instructions;
  
  // Verify token transfer details
  // TODO: Implement parsing of transfer instruction
  // Check: amount, to address, token mint
  
  return true;
}
```

## 🚀 Start the App

```bash
npm install
npm run dev
```

Open http://localhost:3000

## ⚠️ Important Security Notes

1. **Private Keys**: NEVER store private keys in code
2. **Payment Wallet**: Your payment wallet private key should be secure and offline
3. **RPC Endpoints**: Consider using dedicated RPC provider (Alchemy, QuickNode) for production
4. **Rate Limiting**: Implement rate limiting on payment endpoints
5. **Database**: Store transaction signatures in database for audit trail
6. **Monitoring**: Monitor payment wallet for unexpected transactions

## 📚 Resources

- [Solana Web3.js Docs](https://solana-labs.github.io/solana-web3.js/)
- [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter)
- [SPL Token Program](https://spl.solana.com/token)
- [Solscan (Block Explorer)](https://solscan.io/)
- [USDC on Solana](https://www.circle.com/en/usdc-multichain/solana)

## 🐛 Troubleshooting

### "User rejected the request"
User canceled transaction in their wallet. This is normal.

### "Transaction simulation failed"
Possible causes:
- User doesn't have enough USDC
- User doesn't have enough SOL for transaction fee
- Token account doesn't exist (needs to be created first)

### "Transaction not found"
- Transaction is not yet confirmed
- Wrong RPC endpoint
- Transaction failed silently

### "Insufficient funds"
User doesn't have enough USDC or SOL in their wallet.

## 📝 Next Steps

1. [ ] Test on devnet
2. [ ] Update `PAYMENT_WALLET_ADDRESS`
3. [ ] Implement extended payment verification
4. [ ] Add transaction logging to database
5. [ ] Implement refund system
6. [ ] Add admin dashboard to monitor payments
7. [ ] Test on mainnet with small amounts
8. [ ] Launch! 🚀

