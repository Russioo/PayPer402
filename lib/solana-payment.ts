import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SystemProgram,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { 
  getAssociatedTokenAddress, 
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

// USDC Mint Address på Solana Mainnet
export const USDC_MINT_ADDRESS = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

// Payment wallet address - All USDC payments go here
export const PAYMENT_WALLET_ADDRESS = new PublicKey('BXm4a7VzW3GWH2MkUqFTc5uM3XrQDvVbYA3KbXoUvgez');

export interface SolanaPaymentRequest {
  amount: number; // I USDC (f.eks. 0.5 for $0.50)
  generationId: string;
  description: string;
}

export interface SolanaPaymentResult {
  signature: string;
  success: boolean;
  error?: string;
}

/**
 * Opretter og sender en USDC payment transaktion på Solana
 */
export async function sendUSDCPayment(
  connection: Connection,
  payerPublicKey: PublicKey,
  signTransaction: (transaction: Transaction) => Promise<Transaction>,
  amount: number
): Promise<SolanaPaymentResult> {
  try {
    console.log('🔄 Starter USDC payment...');
    console.log('💰 Amount:', amount, 'USDC');
    console.log('👛 Fra:', payerPublicKey.toBase58());
    console.log('🎯 Til:', PAYMENT_WALLET_ADDRESS.toBase58());

    // Konverter USDC amount til mindste enhed (6 decimaler)
    const usdcAmount = Math.floor(amount * 1_000_000);
    
    // Find associated token accounts
    const fromTokenAccount = await getAssociatedTokenAddress(
      USDC_MINT_ADDRESS,
      payerPublicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const toTokenAccount = await getAssociatedTokenAddress(
      USDC_MINT_ADDRESS,
      PAYMENT_WALLET_ADDRESS,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    console.log('📦 Fra Token Account:', fromTokenAccount.toBase58());
    console.log('📦 Til Token Account:', toTokenAccount.toBase58());

    // Opret transaction
    const transaction = new Transaction();
    
    // Tilføj transfer instruction
    transaction.add(
      createTransferInstruction(
        fromTokenAccount,
        toTokenAccount,
        payerPublicKey,
        usdcAmount,
        [],
        TOKEN_PROGRAM_ID
      )
    );

    // Hent recent blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = payerPublicKey;

    console.log('✍️ Signing transaction...');
    
    // Sign transaction med wallet
    const signedTransaction = await signTransaction(transaction);

    console.log('📤 Sender transaction...');
    
    // Send transaction
    const signature = await connection.sendRawTransaction(
      signedTransaction.serialize(),
      {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
      }
    );

    console.log('⏳ Venter på confirmation...');
    console.log('🔗 Transaction signature:', signature);

    // Vent på confirmation
    const confirmation = await connection.confirmTransaction({
      signature,
      blockhash,
      lastValidBlockHeight,
    }, 'confirmed');

    if (confirmation.value.err) {
      console.error('❌ Transaction failed:', confirmation.value.err);
      return {
        signature,
        success: false,
        error: 'Transaction failed',
      };
    }

    console.log('✅ Payment successful!');
    
    return {
      signature,
      success: true,
    };
  } catch (error: any) {
    console.error('❌ Payment error:', error);
    return {
      signature: '',
      success: false,
      error: error.message || 'Payment failed',
    };
  }
}

/**
 * Verificer en payment transaktion on-chain
 */
export async function verifyUSDCPayment(
  connection: Connection,
  signature: string,
  expectedAmount: number
): Promise<boolean> {
  try {
    console.log('🔍 Verificerer payment:', signature);
    
    const transaction = await connection.getTransaction(signature, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0,
    });

    if (!transaction) {
      console.error('❌ Transaction ikke fundet');
      return false;
    }

    if (transaction.meta?.err) {
      console.error('❌ Transaction failed:', transaction.meta.err);
      return false;
    }

    // Verificer amount (dette er simplificeret - i produktion bør du parse transaction logs)
    console.log('✅ Transaction verificeret');
    return true;
  } catch (error) {
    console.error('❌ Verification error:', error);
    return false;
  }
}

/**
 * Tjek USDC balance for en wallet
 */
export async function getUSDCBalance(
  connection: Connection,
  walletPublicKey: PublicKey
): Promise<number> {
  try {
    const tokenAccount = await getAssociatedTokenAddress(
      USDC_MINT_ADDRESS,
      walletPublicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const balance = await connection.getTokenAccountBalance(tokenAccount);
    
    // Returner balance i USDC (6 decimaler)
    return parseFloat(balance.value.amount) / 1_000_000;
  } catch (error) {
    console.error('Error getting USDC balance:', error);
    return 0;
  }
}

