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


async function checkBalance(address: string, chain: 'C' | 'P' = 'C'): Promise<number> {
  try {
    if (chain === 'C') {
      const response = await fetch(`https://glacier-api.avax.network/v1/chains/43113/addresses/${address}/balances:getNative`);
      const data = await response.json() as any;
      const balance = data.nativeTokenBalance?.balance || '0';
      return parseFloat(balance) / 1e18;
    } else {
      // P-Chain balance check would be more complex, keeping it simple for now
      return 0;
    }
  } catch (error) {
    console.error(`Error checking ${chain}-Chain balance:`, error);
    return 0;
  }
}

async function run() {
  try {
    // Get private key from environment
    const privateKey = process.env.PRIVATE_KEY;
    
    if (!privateKey) {
      throw new Error("PRIVATE_KEY not found in environment variables");
    }

    // Create account from private key
    const account = privateKeyToAvalancheAccount(privateKey);
    console.log("🔑 C-Chain address:", account.evmAccount.address);

    // Derive P-Chain address
    if (!account.xpAccount) {
    throw new Error("Failed to derive XP account from private key");
    }

    const pChainAddress = `P-${publicKeyToXPAddress(account.xpAccount.publicKey, CONFIG.NETWORK)}`;
      

    console.log("🔑 P-Chain address:", pChainAddress);

    // Check C-Chain balance before proceeding
    const cChainBalance = await checkBalance(account.evmAccount.address);
    console.log(`💰 C-Chain balance: ${cChainBalance.toFixed(6)} AVAX`);
    
    const requiredBalance = CONFIG.TRANSFER_AMOUNT + CONFIG.MIN_BALANCE_BUFFER;
    if (cChainBalance < requiredBalance) {
      throw new Error(
        `Insufficient C-Chain balance. Have: ${cChainBalance.toFixed(6)} AVAX, ` +
        `Need: ${requiredBalance.toFixed(6)} AVAX (${CONFIG.TRANSFER_AMOUNT} + ${CONFIG.MIN_BALANCE_BUFFER} for fees)`
      );
    }

    // Create wallet client
    const walletClient = createAvalancheWalletClient({
      chain: avalancheFuji,
      transport: {
        type: "http",
        url: "https://api.avax-test.network/ext/bc/C/rpc",
      },
      account,
    });

    console.log(`\nStarting C→P transfer of ${CONFIG.TRANSFER_AMOUNT} AVAX...\n`);

    // Step 1: Export from C-Chain
    console.log("1 - Preparing export from C-Chain...");
    const cChainExportTxnRequest = await walletClient.cChain.prepareExportTxn({
      destinationChain: "P",
      fromAddress: account.evmAccount.address,
      exportedOutput: {
        addresses: [pChainAddress],
        amountInAvax: CONFIG.TRANSFER_AMOUNT,
      },
    });

    console.log("Signing and sending export transaction...");
    const sendTxnExport = await walletClient.sendXPTransaction(cChainExportTxnRequest);
    console.log("Export TX ID:", sendTxnExport.txHash);
    console.log("View transaction: https://subnets-test.avax.network/c-chain/tx/" + sendTxnExport.txHash);

    // Wait for export confirmation
    await walletClient.waitForTxn(sendTxnExport);
    console.log("AVAX exported to Atomic Memory\n");

    // Step 2: Import to P-Chain
    console.log("2 - Preparing import to P-Chain...");
    const pChainImportTxnRequest = await walletClient.pChain.prepareImportTxn({
      sourceChain: "C",
      importedOutput: {
        addresses: [pChainAddress],
      },
    });

    console.log("Signing and sending import transaction...");
    const sendTxnImport = await walletClient.sendXPTransaction(pChainImportTxnRequest);
    console.log("Import TX ID:", sendTxnImport.txHash);
    console.log("View transaction: https://subnets-test.avax.network/p-chain/tx/" + sendTxnImport.txHash);

    // Wait for import confirmation
    await walletClient.waitForTxn(sendTxnImport);
    console.log("AVAX imported to P-Chain\n");

  } catch (error) {
    console.error("\n Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Execute with better error handling
run().catch((error) => {
  console.error("\nUnexpected error:", error);
  process.exit(1);
});