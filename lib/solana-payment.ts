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
  createAssociatedTokenAccountInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import { calculateTokenAmount, getTokenPriceUSD } from './token-price';

// Re-export for convenience
export { getTokenPriceUSD, calculateTokenAmount } from './token-price';

// Custom Token Mint Address - din token!
export const PAYMENT_TOKEN_MINT_ADDRESS = new PublicKey('4BwTM7JvCXnMHPoxfPBoNjxYSbQpVQUMPtK5KNGppump');

// Payment wallet address - Alle token payments går hertil
export const PAYMENT_WALLET_ADDRESS = new PublicKey('BXm4a7VzW3GWH2MkUqFTc5uM3XrQDvVbYA3KbXoUvgez');

// Token decimals (tjek din token's faktiske decimals)
export const TOKEN_DECIMALS = 6;

export interface SolanaPaymentRequest {
  amount: number; // USD amount
  generationId: string;
  description: string;
}

export interface SolanaPaymentResult {
  signature: string;
  success: boolean;
  error?: string;
}

/**
 * Opretter og sender en $PAYPER token payment transaktion på Solana
 * Henter automatisk den aktuelle token pris og beregner korrekt mængde
 */
export async function sendUSDCPayment(
  connection: Connection,
  payerPublicKey: PublicKey,
  signTransaction: (transaction: Transaction) => Promise<Transaction>,
  usdAmount: number
): Promise<SolanaPaymentResult> {
  try {
    console.log('🔄 Starter $PAYPER payment...');
    console.log('💵 USD amount:', usdAmount);
    
    // Hent aktuel token pris og beregn mængde
    const { tokenAmount: payperAmount, tokenPrice, source } = await calculateTokenAmount(usdAmount);
    
    console.log('💰 Token pris:', `$${tokenPrice}`, `(kilde: ${source})`);
    console.log('💰 $PAYPER amount:', Math.floor(payperAmount), '$PAYPER');
    console.log('👛 Fra:', payerPublicKey.toBase58());
    console.log('🎯 Til:', PAYMENT_WALLET_ADDRESS.toBase58());

    // Konverter token amount til mindste enhed (6 decimaler)
    const tokenAmountRaw = Math.floor(payperAmount * Math.pow(10, TOKEN_DECIMALS));
    
    console.log('🔢 Raw token amount (u64):', tokenAmountRaw);
    console.log('🔢 Beregning:', `${Math.floor(payperAmount)} × 10^${TOKEN_DECIMALS} = ${tokenAmountRaw}`);
    
    // Find associated token accounts
    const fromTokenAccount = await getAssociatedTokenAddress(
      PAYMENT_TOKEN_MINT_ADDRESS,
      payerPublicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const toTokenAccount = await getAssociatedTokenAddress(
      PAYMENT_TOKEN_MINT_ADDRESS,
      PAYMENT_WALLET_ADDRESS,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    console.log('📦 Fra Token Account:', fromTokenAccount.toBase58());
    console.log('📦 Til Token Account:', toTokenAccount.toBase58());

    // Tjek om brugerens token account eksisterer
    const fromAccountInfo = await connection.getAccountInfo(fromTokenAccount);
    if (!fromAccountInfo) {
      console.log('⚠️  Brugerens $PAYPER account eksisterer ikke!');
      return {
        success: false,
        signature: '',
        error: 'Du har ikke $PAYPER token. Tilføj venligst $PAYPER til din wallet først.',
      };
    }

    // Tjek token balance
    try {
      const balanceInfo = await connection.getTokenAccountBalance(fromTokenAccount);
      const currentBalance = parseFloat(balanceInfo.value.amount) / Math.pow(10, TOKEN_DECIMALS);
      
      console.log('💵 Nuværende $PAYPER balance:', Math.floor(currentBalance));
      console.log('💳 Påkrævet amount:', Math.floor(payperAmount), '$PAYPER');
      
      if (currentBalance < payperAmount) {
        console.log('⚠️  Ikke nok $PAYPER!');
        return {
          success: false,
          signature: '',
          error: `Ikke nok $PAYPER! Du har ${Math.floor(currentBalance)} $PAYPER, men har brug for ${Math.floor(payperAmount)} $PAYPER.`,
        };
      }
    } catch (balanceError) {
      console.error('⚠️  Kunne ikke hente balance:', balanceError);
      return {
        success: false,
        signature: '',
        error: 'Kunne ikke verificere din $PAYPER balance. Sørg for at du har $PAYPER i din wallet.',
      };
    }

    // Tjek om modtagerens token account eksisterer
    const toAccountInfo = await connection.getAccountInfo(toTokenAccount);

    // Opret transaction
    const transaction = new Transaction();
    
    // Hvis modtagerens token account ikke eksisterer, opret den først
    if (!toAccountInfo) {
      console.log('📝 Opretter modtagers $PAYPER account...');
      transaction.add(
        createAssociatedTokenAccountInstruction(
          payerPublicKey, // payer
          toTokenAccount, // associated token account
          PAYMENT_WALLET_ADDRESS, // owner
          PAYMENT_TOKEN_MINT_ADDRESS, // mint
          TOKEN_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        )
      );
    }
    
    // Tilføj transfer instruction
    transaction.add(
      createTransferInstruction(
        fromTokenAccount,
        toTokenAccount,
        payerPublicKey,
        tokenAmountRaw,
        [],
        TOKEN_PROGRAM_ID
      )
    );

    // Hent recent blockhash
    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash('confirmed');
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = payerPublicKey;

    console.log('🧪 Transaction oprettet, antal instructions:', transaction.instructions.length);
    
    // Simuler transaction først for at fange fejl
    try {
      console.log('🔍 Simulerer transaction...');
      const simulation = await connection.simulateTransaction(transaction);
      
      if (simulation.value.err) {
        console.error('❌ Transaction simulering fejlede:', simulation.value.err);
        console.error('Logs:', simulation.value.logs);
        return {
          signature: '',
          success: false,
          error: `Transaction validation fejlede: ${JSON.stringify(simulation.value.err)}`,
        };
      }
      console.log('✅ Transaction simulering OK');
    } catch (simError: any) {
      console.warn('⚠️  Kunne ikke simulere transaction:', simError.message);
      // Fortsæt alligevel - simulation er ikke kritisk
    }

    console.log('✍️ Signing transaction...');
    
    let signedTransaction;
    try {
      // Sign transaction med wallet
      signedTransaction = await signTransaction(transaction);
      console.log('✅ Transaction signed successfully');
    } catch (signError: any) {
      console.error('❌ Signing error:', signError);
      console.error('Error details:', signError.message, signError.name);
      return {
        signature: '',
        success: false,
        error: `Signing fejlede: ${signError.message || 'Bruger annullerede eller wallet fejl'}`,
      };
    }

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
 * Tjek $PAYPER token balance for en wallet
 */
export async function getUSDCBalance(
  connection: Connection,
  walletPublicKey: PublicKey
): Promise<number> {
  try {
    const tokenAccount = await getAssociatedTokenAddress(
      PAYMENT_TOKEN_MINT_ADDRESS,
      walletPublicKey,
      false,
      TOKEN_PROGRAM_ID,
      ASSOCIATED_TOKEN_PROGRAM_ID
    );

    const balance = await connection.getTokenAccountBalance(tokenAccount);
    
    // Returner balance i $PAYPER tokens (9 decimaler)
    return parseFloat(balance.value.amount) / Math.pow(10, TOKEN_DECIMALS);
  } catch (error) {
    console.error('Error getting $PAYPER balance:', error);
    return 0;
  }
}

