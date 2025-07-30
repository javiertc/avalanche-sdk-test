# Avalanche SDK Test

This project demonstrates various Avalanche blockchain operations using the official [Avalanche SDK](https://github.com/ava-labs/avalanche-sdk), including subnet creation, chain management, Layer 1 conversion, and cross-chain transfers.

## 🚀 Features

- **Subnet Creation**: Create new subnets on the Avalanche P-Chain
- **Chain Deployment**: Deploy custom blockchains on subnets
- **L1 Conversion**: Convert subnets to Layer 1 blockchains with validators
- **Cross-Chain Transfers**: Transfer AVAX between P-Chain and C-Chain
- **Environment-based Configuration**: Secure handling of sensitive data

## 📋 Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- AVAX tokens on Fuji testnet (get from [Avalanche Fuji Faucet](https://faucet.avax.network/))

## 🛠️ Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/javiertc/avalanche-sdk-test.git
   cd avalanche-sdk-test
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Copy the example environment file:
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` and add your configuration:
   ```env
   # Required for all scripts
   PRIVATE_KEY=your_private_key_here
   
   # Required for convertSubnetToL1Tx.ts
   SUBNET_ID=your_subnet_id
   BLOCKCHAIN_ID=your_blockchain_id
   MANAGER_CONTRACT_ADDRESS=0xfacade0000000000000000000000000000000000
   NODE_ID=NodeID-XXX
   NODE_PUBLIC_KEY=0x...
   NODE_PROOF_OF_POSSESSION=0x...
   
   # Optional - defaults to Subnet-EVM if not provided
   VM_ID=rW1esjjCashaJHBkJAkBT6SyA4c3kEFmUGWKKFmPj7CoZymBE
   ```

## 📖 Available Scripts

### 1. Create Subnet and Chain
```bash
npx tsx createSubnetAndChain.ts
```

This script performs two operations:
- Creates a new subnet on the P-Chain
- Deploys a blockchain on the created subnet

**Output**: 
- Subnet ID
- Blockchain ID (needed for L1 conversion)
- Transaction URLs for verification

### 2. Convert Subnet to Layer 1
```bash
npx tsx convertSubnetToL1Tx.ts
```

Converts an existing subnet to a Layer 1 blockchain by adding validators.

**Prerequisites**:
1. Run `createSubnetAndChain.ts` first to get subnet and blockchain IDs
2. Set up a validator node
3. Query the validator's RPC endpoint to get `nodeID` and `nodePOP`
4. Update `.env` with all required values

### 3. Cross-Chain Transfers

#### P-Chain to C-Chain
```bash
npx tsx p2c.ts
```
Transfers AVAX from the Platform Chain to the Contract Chain.

#### C-Chain to P-Chain
```bash
npx tsx c2p.ts
```
Transfers AVAX from the Contract Chain to the Platform Chain.

## 🔄 Complete Workflow

1. **Create Infrastructure**
   ```bash
   npx tsx createSubnetAndChain.ts
   ```
   Save the output subnet ID and blockchain ID.

2. **Set Up Validator** (Manual Step)
   - Configure and run a validator node with the subnet ID
   - Query the validator's info endpoint to get node information

3. **Convert to L1**
   - Update `.env` with subnet ID, blockchain ID, and node information
   - Run:
   ```bash
   npx tsx convertSubnetToL1Tx.ts
   ```

## 🔐 Security Considerations

- **Never commit `.env` files** - The `.gitignore` is configured to exclude them
- **Use test networks first** - All scripts default to Fuji testnet
- **Validate addresses** - Double-check all addresses before running transactions
- **Monitor gas costs** - Ensure sufficient AVAX for transaction fees

## 🌐 Network Information

- **Network**: Avalanche Fuji Testnet
- **RPC URL**: `https://api.avax-test.network/ext/bc/C/rpc`
- **Chain IDs**:
  - C-Chain: 43113
  - P-Chain: Platform Chain (no numeric ID)

## 📊 Explorer Links

- **Subnet Explorer**: https://subnets-test.avax.network/
- **C-Chain Explorer**: https://testnet.snowtrace.io/
- **Faucet**: https://faucet.avax.network/

## 🤝 Contributing

Feel free to open issues or submit pull requests if you find bugs or have suggestions for improvements.

## 📝 License

This project is for educational and testing purposes. 