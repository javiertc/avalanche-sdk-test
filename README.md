# Avalanche SDK Test

This project demonstrates various Avalanche blockchain operations using the Avalanche SDK, including subnet creation, chain management, and cross-chain transfers.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the project root with your private key:
   ```
   AVALANCHE_PRIVATE_KEY=0x<your-private-key-here>
   ```
   
   **Important**: Never commit your `.env` file to version control!

3. Ensure your account has sufficient AVAX on the Fuji testnet. You can get test AVAX from the [Avalanche Fuji Faucet](https://faucet.avax.network/).

## Available Scripts

### Create Subnet and Chain
```bash
npx tsx createSubnetAndChain.ts
```
Creates a new subnet and deploys a blockchain on it.

### P-Chain to C-Chain Transfer
```bash
npx tsx p2c.ts
```
Transfers AVAX from the P-Chain to the C-Chain.

### C-Chain to P-Chain Transfer
```bash
npx tsx c2p.ts
```
Transfers AVAX from the C-Chain to the P-Chain.

### Convert Subnet to L1
```bash
npx tsx convertSubnetToL1Tx.ts
```
Converts an existing subnet to an L1 blockchain.

## Environment Variables

- `AVALANCHE_PRIVATE_KEY`: Your wallet's private key (required)

## Security Note

⚠️ **Never share or commit your private key!** Always use environment variables for sensitive data.

## Network Information

All scripts are configured to work with the Avalanche Fuji testnet by default. 