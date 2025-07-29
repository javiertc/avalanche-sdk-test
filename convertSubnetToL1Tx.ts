import { createAvalancheWalletClient } from "@avalanche-sdk/client";
import { privateKeyToAvalancheAccount } from "@avalanche-sdk/client/accounts";
import { avalancheFuji } from "@avalanche-sdk/client/chains";
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function run() {
  const privateKey = process.env.PRIVATE_KEY;
  const subnetId = process.env.SUBNET_ID;
  const blockchainId = process.env.BLOCKCHAIN_ID;
  const managerContractAddress = process.env.MANAGER_CONTRACT_ADDRESS;
  const nodeId = process.env.NODE_ID;
  const nodePublicKey = process.env.NODE_PUBLIC_KEY;
  const nodeProofOfPossession = process.env.NODE_PROOF_OF_POSSESSION;

  if (!privateKey) {
    throw new Error("PRIVATE_KEY not found in environment variables");
  }
  
  if (!subnetId) {
    throw new Error("SUBNET_ID not found in environment variables");
  }
  
  if (!blockchainId) {
    throw new Error("BLOCKCHAIN_ID not found in environment variables");
  }
  
  if (!managerContractAddress) {
    throw new Error("MANAGER_CONTRACT_ADDRESS not found in environment variables");
  }
  
  if (!nodeId) {
    throw new Error("NODE_ID not found in environment variables");
  }
  
  if (!nodePublicKey) {
    throw new Error("NODE_PUBLIC_KEY not found in environment variables");
  }
  
  if (!nodeProofOfPossession) {
    throw new Error("NODE_PROOF_OF_POSSESSION not found in environment variables");
  }
  
  // The account that will be used to sign the transaction
  const account = privateKeyToAvalancheAccount(privateKey);

  const walletClient = createAvalancheWalletClient({
    chain: avalancheFuji,
    transport: {
      type: "http",
      url: "https://api.avax-test.network/ext/bc/C/rpc",
    },
    account,
  });

  const pChainConvertSubnetToL1TxnRequest =
    await walletClient.pChain.prepareConvertSubnetToL1Txn({
      subnetId: subnetId,
      blockchainId: blockchainId,
      managerContractAddress: managerContractAddress,
      validators: [
        {
          // You can find the nodeId and nodePoP details from the info.getNodeID() route or Data APIs
          nodeId: nodeId,
          nodePoP: {
            publicKey: nodePublicKey,
            proofOfPossession: nodeProofOfPossession,
          },
          weight: 100n, // 100.00% of total weight in this list. Should not exceed 20% in production settings.
          initialBalanceInAvax: 0.1, // Will last for roughly 2 days with a fee of 1.33 AVAX per month.
          remainingBalanceOwner: {
            addresses: [account.getXPAddress("P", "fuji")],
            threshold: 1,
          },
          deactivationOwner: {
            addresses: [account.getXPAddress("P", "fuji")],
            threshold: 1,
          },
        },
      ],
      subnetAuth: [0],
    });

  // Signing and sending the convert subnet to L1 transaction request to the P-chain with account
  const sendTxnResponse = await walletClient.sendXPTransaction(
    pChainConvertSubnetToL1TxnRequest
  );

  console.log("Convert subnet to L1 transaction sent");
  console.log("Transaction response:", JSON.stringify(sendTxnResponse, null, 2));
  await walletClient.waitForTxn(sendTxnResponse);
}

run().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});



// {
//   "jsonrpc": "2.0",
//   "result": {
//     "nodeID": "NodeID-PuNqxZjSkqfxeAC6vJv9bR7WxuPAQssYy",
//     "nodePOP": {
//       "publicKey": "0x8db552fb51972d8c2a967cf3df3806497191eef4af2d68088f1bf1a6e904792b57825e8a43ae49d6cf09b91d5cb0040c",
//       "proofOfPossession": "0xb474973ac64a81511d54d3a6d9b9fe153443bdcf194f93c34a1ca2f6de3feb7ca7545032aff2369a81134877cb2285111163aff6c3ab80fb3444c82e63bde1f48cb27ae3c231c78074c296ab783ae559bfc2053138dc875de1c597645113d23a"
//     }
//   },
//   "id": 1
// }