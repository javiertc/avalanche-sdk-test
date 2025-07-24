# Avalanche Subnet Creation Tool

This project demonstrates how to create an Avalanche subnet using the Avalanche SDK.

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

## Usage

Run the subnet creation script:
```bash
npm run create-subnet
```

The script will:
1. Connect to the Avalanche Fuji testnet
2. Prepare a subnet creation transaction
3. Sign and broadcast the transaction
4. Display the transaction ID

## Environment Variables

- `AVALANCHE_PRIVATE_KEY`: Your wallet's private key (required)

## Security Note

⚠️ **Never share or commit your private key!** Always use environment variables for sensitive data.

## Next Steps

After creating a subnet:
1. Note down your Subnet ID from the transaction
2. Add validators to your subnet
3. Create a blockchain on your subnet 