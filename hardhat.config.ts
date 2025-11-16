import { HardhatUserConfig } from 'hardhat/config.js';
import '@nomicfoundation/hardhat-toolbox';
import * as dotenv from 'dotenv';

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    localhost: {
      url: 'http://127.0.0.1:8545',
    },
    sepolia: {
      url: process.env.RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/demo',
      accounts: ((): string[] => {
        const pk = process.env.PRIVATE_KEY || '';
        if (!pk) return [];
        if (pk.length === 66 && pk.startsWith('0x')) return [pk];
        if (pk.length === 64) return [`0x${pk}`];
        return [];
      })(),
    },
    // Polkadot-compatible EVM parachain (e.g., Moonbase Alpha, Moonbeam, Astar).
    // Set `POLKADOT_RPC_URL` and optional `POLKADOT_CHAIN_ID` in your .env before deploying.
    polkadotEvm: {
      // Default to Moonbase Alpha public RPC if POLKADOT_RPC_URL not provided
      url: process.env.POLKADOT_RPC_URL || 'https://rpc.testnet.moonbeam.network',
      chainId: process.env.POLKADOT_CHAIN_ID ? Number(process.env.POLKADOT_CHAIN_ID) : 1287,
      accounts: ((): string[] => {
        const pk = process.env.PRIVATE_KEY || '';
        if (!pk) return [];
        if (pk.length === 66 && pk.startsWith('0x')) return [pk];
        if (pk.length === 64) return [`0x${pk}`];
        return [];
      })(),
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  paths: {
    sources: './contracts',
    tests: './test/contracts',
    cache: './cache',
    artifacts: './artifacts',
  },
};

export default config;
