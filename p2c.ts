import { createAvalancheWalletClient } from "@avalanche-sdk/client";
import { privateKeyToAvalancheAccount, publicKeyToXPAddress } from "@avalanche-sdk/client/accounts";
import { avalancheFuji } from "@avalanche-sdk/client/chains";
import * as dotenv from 'dotenv';

dotenv.config();

// Configuration
const CONFIG = {
  TRANSFER_AMOUNT: parseFloat(process.env.TRANSFER_AMOUNT || '0.001'),
  MIN_BALANCE_BUFFER: 0.0001, // Extra balance to keep for fees
  NETWORK: process.env.NETWORK || 'fuji'
};

// Explorer URL helper
const getExplorerUrl = (chain: 'p' | 'c', txHash: string): string => {
  return `https://subnets-test.avax.network/${chain}-chain/tx/${txHash}`;
};

async function transferFromPChainToCChain() {
  try {
    // 1. Setup accounts
    console.log("🚀 Starting P-Chain to C-Chain transfer...\n");
    
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error("PRIVATE_KEY not found in environment variables");
    }

    const account = privateKeyToAvalancheAccount(privateKey);
    const cChainAddress = account.evmAccount.address;
    
    // Derive P-Chain address
    if (!account.xpAccount) {
      throw new Error("Failed to derive XP account from private key");
    }
    
    const pChainAddress = `P-${publicKeyToXPAddress(account.xpAccount.publicKey, CONFIG.NETWORK)}`;
    
    console.log("📍 Addresses:");
    console.log(`   P-Chain: ${pChainAddress}`);
    console.log(`   C-Chain: ${cChainAddress}`);
    console.log(`\n💸 Transfer amount: ${CONFIG.TRANSFER_AMOUNT} AVAX\n`);

    // 2. Create wallet client
    const walletClient = createAvalancheWalletClient({
      chain: avalancheFuji,
      transport: {
        type: "http",
        url: "https://api.avax-test.network/ext/bc/C/rpc",
      },
      account,
    });

    // 3. Export from P-Chain
    console.log("📤 Step 1/2: Exporting from P-Chain");
    console.log("   Preparing transaction...");
    
    const exportTxRequest = await walletClient.pChain.prepareExportTxn({
      destinationChain: "C",
      exportedOutputs: [
        {
          addresses: [pChainAddress],
          amount: CONFIG.TRANSFER_AMOUNT,
        },
      ]
    });

    console.log("   Signing and sending...");
    const exportTx = await walletClient.sendXPTransaction(exportTxRequest);
    
    console.log("   Waiting for confirmation...");
    await walletClient.waitForTxn(exportTx);
    
    console.log(`   ✅ Export successful!`);
    console.log(`   Transaction: ${getExplorerUrl('p', exportTx.txHash)}\n`);

    // 4. Import to C-Chain
    console.log("📥 Step 2/2: Importing to C-Chain");
    console.log("   Preparing transaction...");
    
    const importTxRequest = await walletClient.cChain.prepareImportTxn({
      sourceChain: "P",
      toAddress: cChainAddress,
    });

    console.log("   Signing and sending...");
    const importTx = await walletClient.sendXPTransaction(importTxRequest);
    
    console.log("   Waiting for confirmation...");
    await walletClient.waitForTxn(importTx);
    
    console.log(`   ✅ Import successful!`);
    console.log(`   Transaction: ${getExplorerUrl('c', importTx.txHash)}\n`);

  } catch (error) {
    console.error("\n❌ Transfer failed:");
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Run the transfer
transferFromPChainToCChain();