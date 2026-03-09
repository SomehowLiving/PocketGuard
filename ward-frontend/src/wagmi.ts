import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error("VITE_WALLETCONNECT_PROJECT_ID is not defined");
}

export const config = getDefaultConfig({
  appName: 'Ward',
  projectId,
  chains: [sepolia],
});
