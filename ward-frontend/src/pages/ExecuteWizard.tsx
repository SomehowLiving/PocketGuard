import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAccount, useChainId } from 'wagmi';
import { ethers } from 'ethers';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getPocket,
  getPocketNextNonce,
  signExecIntent,
  executePocket,
  simulateExecution,
  estimateGas,
  classifyRisk,
  simulateRisk,
  verifyExecIntent,
  decodeCalldata,
  getTokenMetadata,
  encodeApprove,
  encodeTransfer,
} from '../api';

declare global {
  interface Window {
    ethereum?: any;
  }
}

type ActionType = 'approve' | 'transfer' | 'custom';

interface TransactionInput {
  target: string;
  actionType: ActionType;
  spender?: string;
  recipient?: string;
  amount?: string;
  customData?: string;
}

interface DecodedInfo {
  function: string;
  args: string[];
}

// ── Design primitives ─────────────────────────────────────────────────────────
const Label = ({ children }: { children: React.ReactNode }) => (
  <span className="block text-[10px] font-mono tracking-[0.15em] uppercase text-ward-text-tertiary mb-2">
    {children}
  </span>
);

const FieldInput = ({
  placeholder, value, onChange, disabled,
}: {
  placeholder: string; value: string; onChange: (v: string) => void; disabled?: boolean;
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

const FieldTextarea = ({
  placeholder, value, onChange,
}: {
  placeholder: string; value: string; onChange: (v: string) => void;
}) => (
  <textarea
    placeholder={placeholder}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    rows={4}
    className="w-full bg-ward-surface border border-ward-line text-ward-text-primary text-sm font-mono px-4 py-3 rounded-sm placeholder:text-ward-text-tertiary focus:outline-none focus:border-ward-cyan/50 transition-colors duration-200 resize-none"
  />
);

const FieldSelect = ({
  value, onChange, options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full bg-ward-surface border border-ward-line text-ward-text-primary text-sm font-mono px-4 py-3 rounded-sm focus:outline-none focus:border-ward-cyan/50 transition-colors duration-200 cursor-pointer"
  >
    {options.map((o) => (
      <option key={o.value} value={o.value} className="bg-background">
        {o.label}
      </option>
    ))}
  </select>
);

const PrimaryBtn = ({
  onClick, disabled, children,
}: {
  onClick?: () => void; disabled?: boolean; children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="inline-flex items-center gap-2 text-sm font-body font-medium text-primary-foreground bg-primary px-6 py-2.5 rounded-sm hover:bg-ward-cyan-glow glow-cyan transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
  >
    {children}
  </button>
);

const GhostBtn = ({
  onClick, disabled, children,
}: {
  onClick?: () => void; disabled?: boolean; children: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="inline-flex items-center gap-2 text-sm font-body text-ward-text-secondary hover:text-ward-cyan border border-ward-line hover:border-ward-cyan/40 px-5 py-2.5 rounded-sm transition-all duration-300 disabled:opacity-40"
  >
    {children}
  </button>
);

const InfoRow = ({ label, children, accent }: { label: string; children: React.ReactNode; accent?: boolean }) => (
  <div className="flex items-start justify-between gap-4 py-2.5 border-b border-ward-line/60 last:border-0">
    <span className="text-xs font-mono text-ward-text-tertiary shrink-0">{label}</span>
    <span className={`text-xs font-mono text-right break-all ${accent ? 'text-ward-cyan' : 'text-ward-text-primary'}`}>
      {children}
    </span>
  </div>
);

const STEPS = ['Input', 'Decode', 'Risk', 'Pre-flight', 'Sign', 'Verify', 'Execute'];

export default function ExecuteWizard() {
  const { address: pocketAddress } = useParams<{ address: string }>();
  const navigate = useNavigate();
  const { isConnected, address: userAddress } = useAccount();
  const chainId = useChainId();

  const [step, setStep] = useState(1);
  const [pocket, setPocket] = useState<{ used: boolean; burned: boolean } | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Step 1: Transaction Input
  const [txInput, setTxInput] = useState<TransactionInput>({
    target: '',
    actionType: 'custom',
    spender: '',
    recipient: '',
    amount: '',
    customData: '',
  });

  // Step 2: Decoded Info
  const [decodedInfo, setDecodedInfo] = useState<DecodedInfo | null>(null);
  const [tokenMeta, setTokenMeta] = useState<{ name: string; symbol: string; decimals: number } | null>(null);

  // Step 3: Risk Analysis
  const [riskTier, setRiskTier] = useState<{ tier: number; message: string } | null>(null);
  const [riskConfirmed, setRiskConfirmed] = useState(false);

  // Step 4: Pre-flight
  const [simResult, setSimResult] = useState<{ ok: boolean } | null>(null);
  const [gasEstimate, setGasEstimate] = useState<string | null>(null);

  // Step 5: Signing
  const [signing, setSigning] = useState(false);
  const [signature, setSignature] = useState<string | null>(null);

  // Step 6: Verification
  const [verified, setVerified] = useState(false);

  // Step 7: Execution
  const [executing, setExecuting] = useState(false);
  const [execResult, setExecResult] = useState<{ txHash: string } | null>(null);

  // Execution params
  const [nonce, setNonce] = useState(1);
  const [expiry] = useState(() => Math.floor(Date.now() / 1000) + 3600);

  useEffect(() => {
    if (!isConnected || !pocketAddress || !userAddress) {
      navigate('/');
      return;
    }
    initSigner();
    fetchPocket();
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
      const [p, nextNonce] = await Promise.all([
        getPocket(pocketAddress),
        getPocketNextNonce(pocketAddress)
      ]);
      setPocket(p);
      setNonce(nextNonce);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Step 1 -> 2
  const handleStep1Complete = async () => {
    if (!txInput.target) { setError('Target address is required'); return; }

    let calldata = '0x';
    if (txInput.actionType === 'approve' && txInput.spender && txInput.amount) {
      calldata = encodeApprove(txInput.spender, txInput.amount);
    } else if (txInput.actionType === 'transfer' && txInput.recipient && txInput.amount) {
      calldata = encodeTransfer(txInput.recipient, txInput.amount);
    } else if (txInput.actionType === 'custom') {
      calldata = txInput.customData || '0x';
    }

    try {
      const decoded = await decodeCalldata(calldata);
      setDecodedInfo(decoded);
      if (txInput.actionType !== 'custom') {
        try {
          const meta = await getTokenMetadata(txInput.target);
          setTokenMeta({ name: meta.name, symbol: meta.symbol, decimals: meta.decimals });
        } catch { /* non-standard token */ }
      }
      setError(null);
      setStep(2);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Step 2 -> 3
  const handleStep2Complete = async () => {
    if (!txInput.target) return;
    try {
      const risk = await classifyRisk(txInput.target);
      setRiskTier({ tier: risk.tier, message: risk.message });
      setError(null);
      setStep(3);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Step 3 -> 4
  const handleStep3Complete = async () => {
    if (!pocketAddress || !txInput.target || !signer || !decodedInfo) return;
    if (riskTier && riskTier.tier >= 3) { setError('High risk transaction blocked'); return; }
    if (riskTier && riskTier.tier === 2 && !riskConfirmed) { setError('Risk confirmation required for tier 2 transactions'); return; }

    let calldata = '0x';
    if (txInput.actionType === 'approve' && txInput.spender && txInput.amount) {
      calldata = encodeApprove(txInput.spender, txInput.amount);
    } else if (txInput.actionType === 'transfer' && txInput.recipient && txInput.amount) {
      calldata = encodeTransfer(txInput.recipient, txInput.amount);
    } else if (txInput.actionType === 'custom') {
      calldata = txInput.customData || '0x';
    }

    try {
      const nextNonce = await getPocketNextNonce(pocketAddress);
      setNonce(nextNonce);
      const sig = await signExecIntent(signer, pocketAddress, txInput.target, calldata, nextNonce, expiry, chainId);
      const sim = await simulateExecution({ pocket: pocketAddress, target: txInput.target, data: calldata, nonce: nextNonce, expiry, signature: sig });
      setSimResult(sim);
      const gas = await estimateGas({ pocket: pocketAddress, target: txInput.target, data: calldata, nonce: nextNonce, expiry, signature: sig });
      setGasEstimate(gas.gas);
      setError(null);
      setStep(4);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Step 4 -> 5: Sign intent
  const handleSign = async () => {
    if (!pocketAddress || !txInput.target || !signer || !decodedInfo) return;
    setSigning(true);
    setError(null);
    try {
      const nextNonce = await getPocketNextNonce(pocketAddress);
      setNonce(nextNonce);
      const signerAddr = await signer.getAddress();
      console.log("Signer address:", signerAddr);

      let calldata = '0x';
      if (txInput.actionType === 'approve' && txInput.spender && txInput.amount) {
        calldata = encodeApprove(txInput.spender, txInput.amount);
      } else if (txInput.actionType === 'transfer' && txInput.recipient && txInput.amount) {
        calldata = encodeTransfer(txInput.recipient, txInput.amount);
      } else if (txInput.actionType === 'custom') {
        calldata = txInput.customData || '0x';
      }

      const sig = await signExecIntent(signer, pocketAddress, txInput.target, calldata, nextNonce, expiry, chainId);
      setSignature(sig);
      setSigning(false);
      setStep(5);
    } catch (err: any) {
      setError(err.message);
      setSigning(false);
    }
  };

  // Step 5 -> 6: Verify
  const handleVerify = async () => {
    if (!pocketAddress || !txInput.target || !signature || !decodedInfo) return;

    let calldata = '0x';
    if (txInput.actionType === 'approve' && txInput.spender && txInput.amount) {
      calldata = encodeApprove(txInput.spender, txInput.amount);
    } else if (txInput.actionType === 'transfer' && txInput.recipient && txInput.amount) {
      calldata = encodeTransfer(txInput.recipient, txInput.amount);
    } else if (txInput.actionType === 'custom') {
      calldata = txInput.customData || '0x';
    }

    const dataHash = ethers.keccak256(calldata);
    try {
      const result = await verifyExecIntent({ pocket: pocketAddress, target: txInput.target, dataHash, nonce, expiry, signature });
      if (!result.valid) { setError(`Signature invalid: ${result.reason}`); return; }
      setVerified(true);
      setError(null);
      setStep(6);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Step 6 -> 7: Execute
  const handleExecute = async () => {
    if (!pocketAddress || !txInput.target || !signature || !decodedInfo) return;
    setExecuting(true);
    setError(null);
    try {
      let calldata = '0x';
      if (txInput.actionType === 'approve' && txInput.spender && txInput.amount) {
        calldata = encodeApprove(txInput.spender, txInput.amount);
      } else if (txInput.actionType === 'transfer' && txInput.recipient && txInput.amount) {
        calldata = encodeTransfer(txInput.recipient, txInput.amount);
      } else if (txInput.actionType === 'custom') {
        calldata = txInput.customData || '0x';
      }

      const result = await executePocket({ pocket: pocketAddress, target: txInput.target, data: calldata, nonce, expiry, signature });
      setExecResult({ txHash: result.txHash });
      setExecuting(false);
      setStep(7);
    } catch (err: any) {
      setError(err.message);
      setExecuting(false);
    }
  };

  // ── Pocket used/burned guard ──────────────────────────────────────────────
  if (pocket?.used || pocket?.burned) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
        <p className="font-heading text-xl text-ward-text-primary">Pocket has been used or burned.</p>
        <Link to={`/pocket/${pocketAddress}`}>
          <button className="text-sm font-body text-ward-text-secondary hover:text-ward-cyan border border-ward-line hover:border-ward-cyan/40 px-5 py-2.5 rounded-sm transition-all duration-300">
            Back to Pocket
          </button>
        </Link>
      </div>
    );
  }

  // ── Risk tier colors ──────────────────────────────────────────────────────
  const riskColor = riskTier
    ? riskTier.tier >= 3
      ? 'border-destructive/50 bg-destructive/10'
      : riskTier.tier === 2
      ? 'border-[hsl(38,90%,55%)]/50 bg-[hsl(38,90%,10%)]'
      : 'border-ward-cyan/40 bg-ward-cyan/5'
    : '';

  const riskTextColor = riskTier
    ? riskTier.tier >= 3
      ? 'text-destructive'
      : riskTier.tier === 2
      ? 'text-[hsl(38,90%,55%)]'
      : 'text-ward-cyan'
    : '';

  return (
    <div className="relative min-h-screen bg-background text-foreground font-body">
      {/* BG grid */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
        <line x1="20%" y1="0" x2="20%" y2="100%" stroke="hsl(185 75% 52%)" strokeWidth="1" />
        <line x1="50%" y1="0" x2="50%" y2="100%" stroke="hsl(185 75% 52%)" strokeWidth="1" />
        <line x1="80%" y1="0" x2="80%" y2="100%" stroke="hsl(185 75% 52%)" strokeWidth="1" />
      </svg>

      <div className="relative z-10 max-w-[700px] mx-auto px-6 md:px-12 py-12 pt-16">
        {/* Back */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <Link
            to={`/pocket/${pocketAddress}`}
            className="inline-flex items-center gap-2 text-xs font-body text-ward-text-tertiary hover:text-ward-cyan transition-colors duration-300"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to Pocket
          </Link>
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <span className="text-[10px] font-mono tracking-[0.2em] uppercase text-ward-cyan mb-3 block">
            Execution Wizard
          </span>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-ward-text-primary mb-6">
            Execute Transaction
          </h1>

          {/* Step progress bar */}
          <div className="flex gap-1.5 mb-3">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-0.5 rounded-full transition-all duration-500 ${
                  step > i + 1
                    ? 'bg-ward-cyan'
                    : step === i + 1
                    ? 'bg-ward-cyan/60'
                    : 'bg-ward-line'
                }`}
              />
            ))}
          </div>

          {/* Step labels */}
          <div className="flex justify-between">
            {STEPS.map((label, i) => (
              <span
                key={i}
                className={`text-[9px] font-mono tracking-wide uppercase transition-colors duration-300 ${
                  step === i + 1
                    ? 'text-ward-cyan'
                    : step > i + 1
                    ? 'text-ward-text-secondary'
                    : 'text-ward-text-tertiary'
                }`}
              >
                {label}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 px-4 py-3 border border-destructive/40 bg-destructive/10 rounded-sm"
          >
            <p className="text-sm font-body text-destructive">{error}</p>
          </motion.div>
        )}

        {/* ── Step panels ─────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">

          {/* Step 1: Input */}
          {step === 1 && (
            <motion.section
              key="step1"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="border border-ward-line bg-ward-surface rounded-sm px-6 py-6 space-y-5"
            >
              <h3 className="font-heading text-lg font-semibold text-ward-text-primary">Transaction Input</h3>

              <div>
                <Label>Target Contract</Label>
                <FieldInput
                  placeholder="0x..."
                  value={txInput.target}
                  onChange={(v) => setTxInput({ ...txInput, target: v })}
                />
              </div>

              <div>
                <Label>Action Type</Label>
                <FieldSelect
                  value={txInput.actionType}
                  onChange={(v) => setTxInput({ ...txInput, actionType: v as ActionType })}
                  options={[
                    { value: 'custom', label: 'Custom Calldata' },
                    { value: 'approve', label: 'ERC20 Approve' },
                    { value: 'transfer', label: 'ERC20 Transfer' },
                  ]}
                />
              </div>

              {txInput.actionType === 'approve' && (
                <>
                  <div>
                    <Label>Spender</Label>
                    <FieldInput placeholder="0x..." value={txInput.spender || ''} onChange={(v) => setTxInput({ ...txInput, spender: v })} />
                  </div>
                  <div>
                    <Label>Amount (wei)</Label>
                    <FieldInput placeholder="1000000..." value={txInput.amount || ''} onChange={(v) => setTxInput({ ...txInput, amount: v })} />
                  </div>
                </>
              )}

              {txInput.actionType === 'transfer' && (
                <>
                  <div>
                    <Label>Recipient</Label>
                    <FieldInput placeholder="0x..." value={txInput.recipient || ''} onChange={(v) => setTxInput({ ...txInput, recipient: v })} />
                  </div>
                  <div>
                    <Label>Amount (wei)</Label>
                    <FieldInput placeholder="1000000..." value={txInput.amount || ''} onChange={(v) => setTxInput({ ...txInput, amount: v })} />
                  </div>
                </>
              )}

              {txInput.actionType === 'custom' && (
                <div>
                  <Label>Calldata (hex)</Label>
                  <FieldTextarea placeholder="0x..." value={txInput.customData || ''} onChange={(v) => setTxInput({ ...txInput, customData: v })} />
                </div>
              )}

              <div className="pt-2">
                <PrimaryBtn onClick={handleStep1Complete}>
                  Continue
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </PrimaryBtn>
              </div>
            </motion.section>
          )}

          {/* Step 2: Decode */}
          {step === 2 && decodedInfo && (
            <motion.section
              key="step2"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="border border-ward-line bg-ward-surface rounded-sm px-6 py-6 space-y-5"
            >
              <h3 className="font-heading text-lg font-semibold text-ward-text-primary">Decode & Explain</h3>

              <div className="border border-ward-line/60 bg-ward-obsidian rounded-sm px-5 py-4 space-y-1">
                <InfoRow label="Function">{decodedInfo.function}</InfoRow>
                {tokenMeta && (
                  <InfoRow label="Token" accent>{tokenMeta.name} ({tokenMeta.symbol})</InfoRow>
                )}
                <div className="pt-2">
                  <span className="text-[10px] font-mono tracking-[0.15em] uppercase text-ward-text-tertiary block mb-2">Parameters</span>
                  <pre className="text-xs font-mono text-ward-text-secondary whitespace-pre-wrap break-all">
                    {JSON.stringify(decodedInfo.args, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <GhostBtn onClick={() => setStep(1)}>Back</GhostBtn>
                <PrimaryBtn onClick={handleStep2Complete}>Analyse Risk</PrimaryBtn>
              </div>
            </motion.section>
          )}

          {/* Step 3: Risk */}
          {step === 3 && riskTier && (
            <motion.section
              key="step3"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="border border-ward-line bg-ward-surface rounded-sm px-6 py-6 space-y-5"
            >
              <h3 className="font-heading text-lg font-semibold text-ward-text-primary">Risk Analysis</h3>

              <div className={`border rounded-sm px-5 py-4 ${riskColor}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono tracking-[0.15em] uppercase text-ward-text-tertiary">Risk Tier</span>
                  <span className={`text-xl font-heading font-bold ${riskTextColor}`}>{riskTier.tier}</span>
                </div>
                <p className={`text-sm font-body ${riskTextColor}`}>{riskTier.message}</p>

                {riskTier.tier === 2 && (
                  <label className="flex items-center gap-3 mt-4 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={riskConfirmed}
                      onChange={(e) => setRiskConfirmed(e.target.checked)}
                      className="w-4 h-4 rounded-sm accent-[hsl(38,90%,55%)] cursor-pointer"
                    />
                    <span className="text-xs font-body text-ward-text-secondary group-hover:text-ward-text-primary transition-colors">
                      I understand the risks and want to proceed
                    </span>
                  </label>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <GhostBtn onClick={() => setStep(2)}>Back</GhostBtn>
                <PrimaryBtn
                  onClick={handleStep3Complete}
                  disabled={riskTier.tier >= 3 || (riskTier.tier === 2 && !riskConfirmed)}
                >
                  Run Pre-flight
                </PrimaryBtn>
              </div>
            </motion.section>
          )}

          {/* Step 4: Pre-flight */}
          {step === 4 && (
            <motion.section
              key="step4"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="border border-ward-line bg-ward-surface rounded-sm px-6 py-6 space-y-5"
            >
              <h3 className="font-heading text-lg font-semibold text-ward-text-primary">Pre-flight Validation</h3>

              <div className="border border-ward-line/60 bg-ward-obsidian rounded-sm px-5 py-4 space-y-1">
                <InfoRow label="Simulation">
                  <span className={simResult?.ok ? 'text-ward-cyan' : 'text-destructive'}>
                    {simResult?.ok ? 'Passed' : 'Failed'}
                  </span>
                </InfoRow>
                <InfoRow label="Estimated Gas">{gasEstimate || 'N/A'}</InfoRow>
              </div>

              <div className="flex gap-3 pt-2">
                <GhostBtn onClick={() => setStep(3)}>Back</GhostBtn>
                <PrimaryBtn onClick={handleSign} disabled={!simResult?.ok || signing}>
                  {signing ? (
                    <>
                      <span className="w-3 h-3 border border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                      Signing...
                    </>
                  ) : 'Sign Transaction'}
                </PrimaryBtn>
              </div>
            </motion.section>
          )}

          {/* Step 5: Signed */}
          {step === 5 && signature && (
            <motion.section
              key="step5"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="border border-ward-line bg-ward-surface rounded-sm px-6 py-6 space-y-5"
            >
              <h3 className="font-heading text-lg font-semibold text-ward-text-primary">Sign Intent</h3>

              <div className="border border-ward-cyan/30 bg-ward-cyan/5 rounded-sm px-5 py-4">
                <div className="flex items-center gap-3 mb-3">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8l3.5 3.5L13 4" stroke="hsl(185 75% 52%)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="text-xs font-mono text-ward-cyan">Signature created</span>
                </div>
                <code className="text-[10px] font-mono text-ward-text-tertiary break-all leading-relaxed">
                  {signature.slice(0, 40)}...{signature.slice(-16)}
                </code>
              </div>

              <div className="flex gap-3 pt-2">
                <GhostBtn onClick={() => setStep(4)}>Back</GhostBtn>
                <PrimaryBtn onClick={handleVerify}>Verify Signature</PrimaryBtn>
              </div>
            </motion.section>
          )}

          {/* Step 6: Verified */}
          {step === 6 && verified && (
            <motion.section
              key="step6"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="border border-ward-line bg-ward-surface rounded-sm px-6 py-6 space-y-5"
            >
              <h3 className="font-heading text-lg font-semibold text-ward-text-primary">Verify Signature</h3>

              <div className="border border-ward-cyan/30 bg-ward-cyan/5 rounded-sm px-5 py-4 flex items-center gap-3">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8l3.5 3.5L13 4" stroke="hsl(185 75% 52%)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-xs font-mono text-ward-cyan">Signature verified on-chain</span>
              </div>

              <div className="flex gap-3 pt-2">
                <GhostBtn onClick={() => setStep(5)}>Back</GhostBtn>
                <PrimaryBtn onClick={handleExecute} disabled={executing}>
                  {executing ? (
                    <>
                      <span className="w-3 h-3 border border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
                      Executing...
                    </>
                  ) : 'Execute'}
                </PrimaryBtn>
              </div>
            </motion.section>
          )}

          {/* Step 7: Done */}
          {step === 7 && execResult && (
            <motion.section
              key="step7"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="border border-ward-cyan/30 bg-ward-cyan/5 rounded-sm px-6 py-10 text-center"
            >
              {/* Success mark */}
              <div className="w-12 h-12 rounded-full border border-ward-cyan/50 flex items-center justify-center mx-auto mb-6">
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <path d="M4 11l4.5 4.5L18 6" stroke="hsl(185 75% 52%)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>

              <h3 className="font-heading text-2xl font-bold text-ward-text-primary mb-2">Transaction Executed</h3>
              <p className="text-sm font-body text-ward-text-secondary mb-8">The pocket has been consumed. Transaction is on-chain.</p>

              <div className="border border-ward-line bg-ward-obsidian rounded-sm px-5 py-4 mb-8 text-left">
                <span className="text-[10px] font-mono tracking-[0.15em] uppercase text-ward-text-tertiary block mb-2">
                  Transaction Hash
                </span>
                <code className="text-xs font-mono text-ward-cyan break-all">{execResult.txHash}</code>
              </div>

              <Link to={`/pocket/${pocketAddress}`}>
                <GhostBtn>Back to Pocket</GhostBtn>
              </Link>
            </motion.section>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
