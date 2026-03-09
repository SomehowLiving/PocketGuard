import { useEffect, useState } from 'react';
import { useAccount, useDisconnect, useChainId } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ethers } from 'ethers';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { listUserPockets, createPocket, Pocket } from '../api';

declare global {
  interface Window {
    ethereum?: any;
  }
}

// ── Shared Ward layout shell ──────────────────────────────────────────────────
const PageShell = ({ children }: { children: React.ReactNode }) => (
  <div className="relative min-h-screen bg-background text-foreground font-body">
    {/* Subtle background grid lines */}
    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
      <line x1="20%" y1="0" x2="20%" y2="100%" stroke="hsl(185 75% 52%)" strokeWidth="1" />
      <line x1="50%" y1="0" x2="50%" y2="100%" stroke="hsl(185 75% 52%)" strokeWidth="1" />
      <line x1="80%" y1="0" x2="80%" y2="100%" stroke="hsl(185 75% 52%)" strokeWidth="1" />
    </svg>
    <div className="relative z-10 max-w-[900px] mx-auto px-6 md:px-12 py-12 pt-20">
      {children}
    </div>
  </div>
);

// ── Status badge ──────────────────────────────────────────────────────────────
const StatusDot = ({ burned, used }: { burned: boolean; used: boolean }) => {
  if (burned) return (
    <span className="inline-flex items-center gap-1.5 text-xs font-mono text-ward-text-tertiary">
      <span className="w-1.5 h-1.5 rounded-full bg-ward-text-tertiary" />
      Burned
    </span>
  );
  if (used) return (
    <span className="inline-flex items-center gap-1.5 text-xs font-mono" style={{ color: 'hsl(38 90% 55%)' }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'hsl(38 90% 55%)' }} />
      Used
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-mono text-ward-cyan">
      <span className="w-1.5 h-1.5 rounded-full bg-ward-cyan" />
      Active
    </span>
  );
};

export default function Dashboard() {
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const navigate = useNavigate();
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [pockets, setPockets] = useState<Pocket[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isConnected && address) {
      initSigner();
      fetchPockets();
    }
  }, [isConnected, address]);

  const initSigner = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const s = await provider.getSigner();
      setSigner(s);
    }
  };

  const fetchPockets = async () => {
    if (!address) return;
    try {
      const { pockets: list } = await listUserPockets(address);
      setPockets(list || []);
    } catch (err) {
      console.error('Failed to fetch pockets:', err);
    }
  };

  const handleCreatePocket = async () => {
    if (!address || !signer) return;
    setLoading(true);
    setError(null);
    try {
      const { pocket } = await createPocket({ user: address, salt: Date.now().toString() });
      navigate(`/pocket/${pocket}`);
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  // ── Disconnected state ───────────────────────────────────────────────────────
  if (!isConnected) {
    return (
      <div className="relative min-h-screen bg-background text-foreground flex items-center justify-center font-body">
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <line x1="20%" y1="0" x2="20%" y2="100%" stroke="hsl(185 75% 52%)" strokeWidth="1" />
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="hsl(185 75% 52%)" strokeWidth="1" />
          <line x1="80%" y1="0" x2="80%" y2="100%" stroke="hsl(185 75% 52%)" strokeWidth="1" />
        </svg>

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 max-w-[440px] w-full mx-auto px-6"
        >
          {/* Wordmark */}
          <div className="mb-12">
            <span className="font-heading text-2xl font-semibold tracking-tight text-ward-text-primary">WARD</span>
            <div className="mt-2 h-px w-12 bg-ward-cyan" />
          </div>

          <h1 className="font-heading text-4xl md:text-5xl font-bold leading-[1] tracking-tight text-ward-text-primary mb-5">
            Execution<br />
            <span className="text-gradient-cyan">Isolation.</span>
          </h1>

          <p className="font-body text-base text-ward-text-secondary leading-relaxed mb-10">
            Transaction protection using single-use execution vaults.
            Connect your wallet to get started.
          </p>

          {/* RainbowKit connect button wrapper */}
          <div className="flex">
            <ConnectButton />
          </div>

          <div className="mt-12 pt-8 border-t border-ward-line">
            <p className="text-xs font-body text-ward-text-tertiary">
              Your main wallet is never exposed to risky interactions.
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // ── Connected state ──────────────────────────────────────────────────────────
  return (
    <PageShell>
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between mb-16"
      >
        <span className="font-heading text-xl font-semibold tracking-tight text-ward-text-primary">WARD</span>
        <div className="flex items-center gap-6">
          <span className="text-xs font-mono text-ward-text-secondary">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
          <button
            onClick={() => disconnect()}
            className="text-xs font-body text-ward-text-tertiary hover:text-ward-cyan border border-ward-line hover:border-ward-cyan/40 px-4 py-2 rounded-sm transition-all duration-300"
          >
            Disconnect
          </button>
        </div>
      </motion.header>

      {/* Create pocket */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="mb-14"
      >
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <h2 className="font-heading text-2xl font-bold text-ward-text-primary mb-2">Execution Pockets</h2>
            <p className="text-sm font-body text-ward-text-secondary max-w-sm">
              Each pocket is a disposable smart-wallet that isolates a single transaction from your main wallet.
            </p>
          </div>

          <button
            onClick={handleCreatePocket}
            disabled={loading || !signer}
            className="inline-flex items-center gap-2 text-sm font-body font-medium text-primary-foreground bg-primary px-6 py-3 rounded-sm hover:bg-ward-cyan-glow transition-all duration-300 glow-cyan disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 border border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                New Pocket
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 px-4 py-3 border border-destructive/40 bg-destructive/10 rounded-sm">
            <p className="text-sm font-body text-destructive">{error}</p>
          </div>
        )}
      </motion.section>

      {/* Separator */}
      <div className="h-px w-full bg-ward-line mb-10" />

      {/* Pocket list */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.7, delay: 0.25 }}
      >
        {pockets.length === 0 ? (
          <div className="py-20 text-center">
            {/* Geometric accent */}
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" className="mx-auto mb-6 opacity-20">
              <rect x="10" y="10" width="60" height="60" stroke="hsl(185 75% 52%)" strokeWidth="1" />
              <rect x="25" y="25" width="30" height="30" stroke="hsl(185 75% 52%)" strokeWidth="0.75" />
              <line x1="10" y1="10" x2="25" y2="25" stroke="hsl(185 75% 52%)" strokeWidth="0.5" />
              <line x1="70" y1="10" x2="55" y2="25" stroke="hsl(185 75% 52%)" strokeWidth="0.5" />
              <line x1="10" y1="70" x2="25" y2="55" stroke="hsl(185 75% 52%)" strokeWidth="0.5" />
              <line x1="70" y1="70" x2="55" y2="55" stroke="hsl(185 75% 52%)" strokeWidth="0.5" />
            </svg>
            <p className="font-body text-ward-text-tertiary text-sm">No pockets yet. Create one to get started.</p>
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {pockets.map((pocket, i) => (
              <motion.li
                key={pocket.address}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
                className="group flex items-center justify-between gap-4 px-5 py-4 border border-ward-line bg-ward-surface rounded-sm hover:border-ward-cyan/30 transition-all duration-300"
              >
                <div className="min-w-0">
                  <code className="block text-xs font-mono text-ward-text-secondary truncate mb-1.5">
                    {pocket.address}
                  </code>
                  <StatusDot burned={pocket.burned} used={pocket.used} />
                </div>

                <button
                  onClick={() => navigate(`/pocket/${pocket.address}`)}
                  disabled={pocket.burned}
                  className="shrink-0 text-xs font-body font-medium text-ward-cyan border border-ward-cyan/40 hover:bg-ward-cyan/10 px-4 py-2 rounded-sm transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {pocket.burned ? 'Burned' : 'Open'}
                  {!pocket.burned && (
                    <svg className="inline ml-2 w-3 h-3" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              </motion.li>
            ))}
          </ul>
        )}
      </motion.section>
    </PageShell>
  );
}
