import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAccount, useChainId } from 'wagmi';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import {
  getPocket,
  getPocketNextNonce,
  getPocketAssets,
  getControllerPocket,
  signBurnIntent,
  burnPocket,
  sweepPocket,
  calculateFee,
  Pocket,
  PocketAsset
} from '../api';

declare global {
  interface Window {
    ethereum?: any;
  }
}

// ── Shared primitives ─────────────────────────────────────────────────────────
const Label = ({ children }: { children: React.ReactNode }) => (
  <span className="text-[10px] font-mono tracking-[0.15em] uppercase text-ward-text-tertiary">{children}</span>
);

const FieldInput = ({
  placeholder,
  value,
  onChange,
  disabled,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) => (
  <input
    type="text"
    placeholder={placeholder}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    disabled={disabled}
    className="w-full bg-ward-surface border border-ward-line text-ward-text-primary text-sm font-mono px-4 py-3 rounded-sm placeholder:text-ward-text-tertiary focus:outline-none focus:border-ward-cyan/50 transition-colors duration-200 disabled:opacity-40"
  />
);

const PrimaryBtn = ({
  onClick,
  disabled,
  children,
  danger,
}: {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  danger?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`inline-flex items-center gap-2 text-sm font-body font-medium px-6 py-2.5 rounded-sm transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed ${
      danger
        ? 'text-destructive-foreground bg-destructive/80 hover:bg-destructive border border-destructive/60'
        : 'text-primary-foreground bg-primary hover:bg-ward-cyan-glow glow-cyan'
    }`}
  >
    {children}
  </button>
);

const GhostBtn = ({
  onClick,
  disabled,
  children,
}: {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="inline-flex items-center gap-2 text-sm font-body text-ward-text-secondary hover:text-ward-cyan border border-ward-line hover:border-ward-cyan/40 px-5 py-2.5 rounded-sm transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
  >
    {children}
  </button>
);

const StatCard = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="px-5 py-4 border border-ward-line bg-ward-surface rounded-sm">
    <Label>{label}</Label>
    <div className="mt-2 text-sm font-mono text-ward-text-primary">{children}</div>
  </div>
);

export default function PocketDetail() {
  const { address: pocketAddress } = useParams<{ address: string }>();
  const navigate = useNavigate();
  const { isConnected, address: userAddress } = useAccount();
  const chainId = useChainId();

  const [pocket, setPocket] = useState<Pocket | null>(null);
  const [controllerInfo, setControllerInfo] = useState<{ valid: boolean; owner: string } | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [burning, setBurning] = useState(false);
  const [sweepForm, setSweepForm] = useState({ token: '', receiver: '', amount: '' });
  const [sweepFee, setSweepFee] = useState<{ tier: number; feeFormatted: string; netFormatted: string; symbol: string } | null>(null);
  const [sweeping, setSweeping] = useState(false);
  const [nativeBalance, setNativeBalance] = useState<string>('0');
  const [assets, setAssets] = useState<PocketAsset[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(false);

  useEffect(() => {
    if (!isConnected || !pocketAddress || !userAddress) {
      navigate('/');
      return;
    }
    initSigner();
    fetchPocket();
    fetchAssets();
  }, [isConnected, pocketAddress, userAddress]);

  const initSigner = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const s = await provider.getSigner();
      setSigner(s);
    }
  };

  const fetchPocket = async () => {
    if (!pocketAddress) return;
    try {
      const [p, c] = await Promise.all([
        getPocket(pocketAddress),
        getControllerPocket(pocketAddress),
      ]);
      setPocket(p);
      setControllerInfo(c);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssets = async () => {
    if (!pocketAddress) return;
    setAssetsLoading(true);
    try {
      const response = await getPocketAssets(pocketAddress);
      setNativeBalance(response.formattedNativeBalance);
      setAssets(response.assets);
    } catch (err) {
      console.error('Asset indexing failed', err);
    } finally {
      setAssetsLoading(false);
    }
  };

  const handleBurn = async () => {
    if (!signer || !pocketAddress || pocket?.burned) return;
    if (!confirm('Are you sure you want to burn this pocket? This cannot be undone.')) return;
    setBurning(true);
    setError(null);
    try {
      const nonce = await getPocketNextNonce(pocketAddress);
      const expiry = Math.floor(Date.now() / 1000) + 3600;
      const signature = await signBurnIntent(signer, pocketAddress, nonce, expiry, chainId);
      await burnPocket({ pocket: pocketAddress, nonce, expiry, signature });
      navigate('/app');
    } catch (err: any) {
      setError(err.message);
    }
    setBurning(false);
  };

  const handleSweepFee = async () => {
    if (!sweepForm.token || !sweepForm.amount) return;
    try {
      setError(null);
      const fee = await calculateFee(sweepForm.amount, sweepForm.token);
      setSweepFee({
        tier: fee.tier,
        feeFormatted: fee.feeFormatted,
        netFormatted: fee.netFormatted,
        symbol: fee.symbol
      });
    } catch (err: any) {
      setSweepFee(null);
      setError(err.message || 'Fee calculation failed');
    }
  };

  const handleSweep = async () => {
    if (!signer || !pocketAddress || !sweepForm.token || !sweepForm.receiver || !sweepForm.amount) return;
    if (!sweepFee) return;
    setSweeping(true);
    setError(null);
    try {
      await sweepPocket({
        pocketAddress,
        tokenAddress: sweepForm.token,
        receiverAddress: sweepForm.receiver,
        amount: sweepForm.amount,
      });
      alert('Sweep successful!');
      setSweepForm({ token: '', receiver: '', amount: '' });
      setSweepFee(null);
      await fetchAssets();
    } catch (err: any) {
      setError(err.message);
    }
    setSweeping(false);
  };

  // ── Loading / error shells ────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="w-5 h-5 border border-ward-cyan/40 border-t-ward-cyan rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !pocket) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
        <p className="text-sm font-body text-destructive">{error}</p>
        <GhostBtn onClick={() => navigate('/app')}>Back to Dashboard</GhostBtn>
      </div>
    );
  }

  if (!pocket || !controllerInfo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-sm font-body text-ward-text-tertiary">Pocket not found.</p>
      </div>
    );
  }

  const executeDisabled = pocket.used || pocket.burned;
  const sweepDisabled = pocket.burned;
  const burnDisabled = pocket.burned;

  const statusColor = pocket.burned
    ? 'text-ward-text-tertiary'
    : pocket.used
    ? 'text-[hsl(38,90%,55%)]'
    : 'text-ward-cyan';

  const statusLabel = pocket.burned ? 'Burned' : pocket.used ? 'Used' : 'Active';

  return (
    <div className="relative min-h-screen bg-background text-foreground font-body">
      {/* BG grid lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
        <line x1="20%" y1="0" x2="20%" y2="100%" stroke="hsl(185 75% 52%)" strokeWidth="1" />
        <line x1="50%" y1="0" x2="50%" y2="100%" stroke="hsl(185 75% 52%)" strokeWidth="1" />
        <line x1="80%" y1="0" x2="80%" y2="100%" stroke="hsl(185 75% 52%)" strokeWidth="1" />
      </svg>

      <div className="relative z-10 max-w-[900px] mx-auto px-6 md:px-12 py-12 pt-16">
        {/* Back */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <Link
            to="/app"
            className="inline-flex items-center gap-2 text-xs font-body text-ward-text-tertiary hover:text-ward-cyan transition-colors duration-300"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Dashboard
          </Link>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-ward-cyan mb-3 block">Execution Pocket</span>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-ward-text-primary mb-4">Pocket Detail</h1>
          <code className="block text-xs font-mono text-ward-text-secondary bg-ward-surface border border-ward-line px-4 py-3 rounded-sm break-all">
            {pocket.address}
          </code>
        </motion.div>

        {/* Stat cards */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-3 gap-3 mb-10"
        >
          <StatCard label="Owner">
            {pocket.owner?.slice(0, 6)}...{pocket.owner?.slice(-4)}
          </StatCard>
          <StatCard label="Status">
            <span className={statusColor}>{statusLabel}</span>
          </StatCard>
          <StatCard label="Controller">
            <span className={controllerInfo.valid ? 'text-ward-cyan' : 'text-destructive'}>
              {controllerInfo.valid ? 'Valid' : 'Invalid'}
            </span>
          </StatCard>
        </motion.div>

        {/* Assets */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10 border border-ward-line bg-ward-surface rounded-sm"
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-ward-line">
            <div>
              <Label>Pocket Assets</Label>
              <p className="text-xs font-mono text-ward-text-secondary mt-1">
                {nativeBalance} ETH native balance
              </p>
            </div>
            <GhostBtn onClick={fetchAssets} disabled={assetsLoading}>
              {assetsLoading ? (
                <>
                  <span className="w-3 h-3 border border-ward-text-tertiary border-t-ward-cyan rounded-full animate-spin" />
                  Refreshing
                </>
              ) : 'Refresh'}
            </GhostBtn>
          </div>

          {assets.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-xs font-body text-ward-text-tertiary">No ERC20 assets indexed for this pocket yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-ward-line">
                    {['Token', 'Symbol', 'Balance', 'Address'].map((h) => (
                      <th key={h} className="text-left text-ward-text-tertiary tracking-[0.1em] uppercase px-5 py-3 font-normal">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => (
                    <tr key={asset.address} className="border-b border-ward-line/50 last:border-0 hover:bg-ward-obsidian/30 transition-colors">
                      <td className="px-5 py-3 text-ward-text-primary">{asset.name}</td>
                      <td className="px-5 py-3 text-ward-cyan">{asset.symbol}</td>
                      <td className={`px-5 py-3 text-right ${asset.hasBalance ? 'text-ward-text-primary' : 'text-ward-text-tertiary'}`}>
                        {asset.formattedBalance}
                      </td>
                      <td className="px-5 py-3 text-ward-text-secondary">
                        {asset.address.slice(0, 8)}...{asset.address.slice(-6)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>

        {/* Error */}
        {error && (
          <div className="mb-6 px-4 py-3 border border-destructive/40 bg-destructive/10 rounded-sm">
            <p className="text-sm font-body text-destructive">{error}</p>
          </div>
        )}

        {/* Action panels */}
        <div className="flex flex-col gap-4">
          {/* Execute */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="border border-ward-line bg-ward-surface rounded-sm px-6 py-6"
          >
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div>
                <Label>Execute Transaction</Label>
                <p className="mt-2 text-sm font-body text-ward-text-secondary max-w-sm">
                  Execute a protected transaction from this pocket through the 7-step signing wizard.
                </p>
              </div>
              <Link to={`/pocket/${pocket.address}/execute`}>
                <PrimaryBtn disabled={executeDisabled}>
                  {executeDisabled ? 'Pocket Used / Burned' : (
                    <>
                      Execute
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </>
                  )}
                </PrimaryBtn>
              </Link>
            </div>
          </motion.div>

          {/* Sweep */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="border border-ward-line bg-ward-surface rounded-sm px-6 py-6"
          >
            <Label>Sweep Funds</Label>
            <div className="mt-4 grid gap-3">
              <FieldInput
                placeholder="Token Address (0x...)"
                value={sweepForm.token}
                onChange={(v) => setSweepForm({ ...sweepForm, token: v })}
                disabled={sweepDisabled}
              />
              <FieldInput
                placeholder="Receiver Address (0x...)"
                value={sweepForm.receiver}
                onChange={(v) => setSweepForm({ ...sweepForm, receiver: v })}
                disabled={sweepDisabled}
              />
              <FieldInput
                placeholder="Amount (token units, e.g. 500.5)"
                value={sweepForm.amount}
                onChange={(v) => setSweepForm({ ...sweepForm, amount: v })}
                disabled={sweepDisabled}
              />
            </div>

            {sweepFee && (
              <div className="mt-4 px-4 py-3 bg-ward-obsidian border border-ward-line/50 rounded-sm text-xs font-mono text-ward-text-secondary space-y-1">
                <div className="flex justify-between">
                  <span>Fee</span>
                  <span className="text-ward-text-primary">{sweepFee.feeFormatted} {sweepFee.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span>Net</span>
                  <span className="text-ward-cyan">{sweepFee.netFormatted} {sweepFee.symbol}</span>
                </div>
                <div className="flex justify-between">
                  <span>Risk Tier</span>
                  <span>{sweepFee.tier}</span>
                </div>
              </div>
            )}

            <div className="mt-4 flex gap-3">
              {!sweepFee ? (
                <GhostBtn
                  onClick={handleSweepFee}
                  disabled={sweepDisabled || !sweepForm.token || !sweepForm.amount}
                >
                  Calculate Fee
                </GhostBtn>
              ) : (
                <PrimaryBtn onClick={handleSweep} disabled={sweepDisabled || sweeping}>
                  {sweeping ? (
                    <>
                      <span className="w-3 h-3 border border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                      Sweeping...
                    </>
                  ) : 'Sweep'}
                </PrimaryBtn>
              )}
            </div>
          </motion.div>

          {/* Burn */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.36, ease: [0.16, 1, 0.3, 1] }}
            className="border border-destructive/20 bg-destructive/5 rounded-sm px-6 py-6"
          >
            <div className="flex items-start justify-between gap-6 flex-wrap">
              <div>
                <Label>Burn Pocket</Label>
                <p className="mt-2 text-sm font-body text-ward-text-secondary max-w-sm">
                  Permanently disable this pocket. All funds should be swept first. Cannot be undone.
                </p>
              </div>
              <PrimaryBtn danger onClick={handleBurn} disabled={burnDisabled || burning}>
                {burning ? (
                  <>
                    <span className="w-3 h-3 border border-destructive-foreground/40 border-t-destructive-foreground rounded-full animate-spin" />
                    Burning...
                  </>
                ) : 'Burn Pocket'}
              </PrimaryBtn>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
