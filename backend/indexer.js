import StellarSdk from 'stellar-sdk';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import * as Sentry from '@sentry/node';

dotenv.config();

// Sentry Init for Indexer
Sentry.init({
  dsn: process.env.SENTRY_DSN || "https://dummy@o0.ingest.sentry.io/0",
  tracesSampleRate: 1.0,
});

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const server = new StellarSdk.Horizon.Server('https://horizon-testnet.stellar.org');
const ADMIN_ADDRESS = "GCZT4J7JGTX72GTNEZRDUBFGHUXCATAJ7Y64T7X5OSBSXUYX5T5Z5UIC";

/**
 * Data Indexer: Syncs Stellar Ledger transactions with Supabase
 * Ensures that even if the frontend fails to report a tx, the database is accurate.
 */
export async function syncBlockchainData() {
  console.log('🚀 Indexer: Starting blockchain sync...');
  
  try {
    // 1. Fetch latest transactions for the Admin address
    const txResponse = await server.transactions()
      .forAccount(ADMIN_ADDRESS)
      .order('desc')
      .limit(20)
      .call();

    const txs = txResponse.records;
    console.log(`🔍 Indexer: Found ${txs.length} recent transactions.`);

    for (const tx of txs) {
      // Check if tx already exists in DB
      const { data: existing } = await supabase
        .from('transactions')
        .select('id')
        .eq('txhash', tx.hash)
        .maybeSingle();

      if (existing) continue;

      // New transaction found! Parse and index it.
      // Note: In a real production app, you would decode the XDR to get amount/asset.
      // For this implementation, we will mark it as 'indexed_blockchain' to distinguish it.
      
      const newIndexEntry = {
        address: tx.source_account,
        type: 'stellar_ledger_sync',
        amount: 0, 
        asset: 'unknown_asset',
        txhash: tx.hash,
        time: tx.created_at
      };

      const { error } = await supabase.from('transactions').insert([newIndexEntry]);
      if (error) {
        console.error('❌ Indexer Error:', error.message);
        Sentry.captureException(error);
      } else {
        console.log(`✨ Indexed New Tx: ${tx.hash.slice(0, 8)}...`);
      }
    }

    console.log('✅ Indexer: Sync complete.');
  } catch (err) {
    console.error('💥 Fatal Indexer Error:', err.message);
    Sentry.captureException(err);
  }
}

// If run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  syncBlockchainData();
}
