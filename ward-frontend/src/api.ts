import { ethers } from 'ethers';
import { API } from "./routes";

// Shared fetch wrapper that adds ngrok headers to bypass the browser warning page
function apiFetch(url: string, init?: RequestInit): Promise<Response> {
  const headers = new Headers(init?.headers);
  headers.set('ngrok-skip-browser-warning', 'true');
  return fetch(url, { ...init, headers });
}

function extractApiError(payload: any, fallback: string): string {
    const error = payload?.error;
    if (typeof error === 'string') return error;
    if (typeof error?.message === 'string' && error.message.length > 0) return error.message;
    if (typeof error?.name === 'string' && error.name.length > 0) return error.name;
    if (typeof payload?.message === 'string' && payload.message.length > 0) return payload.message;
    return fallback;
}

export interface Pocket {
    address: string;
    owner?: string;
    used: boolean;
    burned: boolean;
}

export interface CreatePocketParams {
    user: string;
    salt?: string;
}

export interface ExecuteParams {
    pocket: string;
    target: string;
    data: string;
    nonce: number;
    expiry: number;
    signature: string;
}

export interface BurnParams {
    pocket: string;
    nonce: number;
    expiry: number;
    signature: string;
}

export interface SweepParams {
    pocketAddress: string;
    tokenAddress: string;
    receiverAddress: string;
    amount: string;
}

export interface RiskTier {
    tier: number;
    confidence: number;
    signals: string[];
    message: string;
}

export interface TokenMetadata {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    totalSupply: string;
}

export interface CalldataDecode {
    function: string;
    args: string[];
    confidence: string;
}

export interface PocketAsset {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    balance: string;
    formattedBalance: string;
    hasBalance?: boolean;
}

export interface PocketAssetsResponse {
    pocket: string;
    nativeBalance: string;
    formattedNativeBalance: string;
    assets: PocketAsset[];
}

// API Functions
export async function createPocket(params: CreatePocketParams): Promise<{ pocket: string }> {
    const res = await apiFetch(API.pocket.create, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
    });
    if (!res.ok) {
        let message = 'Failed to create pocket';
        try {
            const err = await res.json();
            message = err?.error?.message || err?.error || message;
        } catch {
            // keep default
        }
        throw new Error(message);
    }
    return res.json();
}

export async function getPocket(address: string): Promise<Pocket> {
    const res = await apiFetch(API.pocket.get(address));
    if (!res.ok) throw new Error('Failed to get pocket');
    return res.json();
}

export async function getPocketNextNonce(address: string): Promise<number> {
    const res = await apiFetch(API.pocket.nextNonce(address));
    if (!res.ok) throw new Error('Failed to get pocket next nonce');
    const body = await res.json();
    return Number(body.nextNonce);
}

export async function getPocketAssets(address: string): Promise<PocketAssetsResponse> {
    const res = await apiFetch(API.pocket.assets(address));
    if (!res.ok) throw new Error('Failed to get pocket assets');
    return res.json();
}

export async function listUserPockets(userAddress: string): Promise<{ pockets: Pocket[] }> {
    const res = await apiFetch(API.pocket.listByUser(userAddress));
    if (!res.ok) throw new Error('Failed to list pockets');
    return res.json();
}

export async function getControllerPocket(address: string): Promise<{ address: string; valid: boolean; owner: string }> {
    const res = await apiFetch(API.controller.pocketInfo(address));
    if (!res.ok) throw new Error('Failed to get controller pocket');
    return res.json();
}

export async function executePocket(params: ExecuteParams): Promise<{ status: string; txHash: string; gasUsed: string }> {
    const res = await apiFetch(API.pocket.exec, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || 'Execution failed');
    }
    return res.json();
}

export async function burnPocket(params: BurnParams): Promise<{ status: string; txHash: string }> {
    const res = await apiFetch(API.pocket.burn, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
    });
    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error?.message || 'Burn failed');
    }
    return res.json();
}

export async function sweepPocket(params: SweepParams): Promise<{ txHash: string }> {
    const res = await apiFetch(API.pocket.sweep, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(extractApiError(err, 'Sweep failed'));
    }
    return res.json();
}

export async function simulateExecution(params: ExecuteParams): Promise<{ ok: boolean; error?: any }> {
    const res = await apiFetch(API.pocket.simulate, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
    });
    return res.json();
}

export async function estimateGas(params: ExecuteParams): Promise<{ gas: string }> {
    const res = await apiFetch(API.pocket.gas, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
    });
    if (!res.ok) throw new Error('Gas estimation failed');
    return res.json();
}

export async function calculateFee(amount: string, tokenAddress: string): Promise<{
    amount: string;
    amountHuman: string;
    symbol: string;
    decimals: number;
    tier: number;
    fee: string;
    feeFormatted: string;
    net: string;
    netFormatted: string;
}> {
    const res = await apiFetch(API.pocket.fee, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, tokenAddress }),
    });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(extractApiError(err, 'Fee calculation failed'));
    }
    return res.json();
}

export async function verifyExecIntent(params: {
    pocket: string;
    target: string;
    dataHash: string;
    nonce: number;
    expiry: number;
    signature: string;
}): Promise<{ valid: boolean; reason?: string }> {
    const res = await apiFetch(API.verify.execIntent, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
    });
    return res.json();
}

export async function classifyRisk(tokenAddress: string, simulate?: boolean): Promise<RiskTier> {
    const res = await apiFetch(API.risk.classify, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenAddress, simulate }),
    });
    if (!res.ok) throw new Error('Risk classification failed');
    return res.json();
}

export async function simulateRisk(pocketAddress: string, target: string, data: string): Promise<{ success: boolean; gasUsed: number; error?: string }> {
    const res = await apiFetch(API.risk.simulate, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pocketAddress, target, data }),
    });
    return res.json();
}

export async function getTokenMetadata(address: string): Promise<TokenMetadata> {
    const res = await apiFetch(API.token.info(address));
    if (!res.ok) throw new Error('Failed to get token metadata');
    return res.json();
}

export async function decodeCalldata(data: string): Promise<CalldataDecode> {
    const res = await apiFetch(API.pocket.decodeCalldata, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
    });
    if (!res.ok) throw new Error('Failed to decode calldata');
    return res.json();
}

// EIP-712 Helpers
export function getExecTypedData(
    pocket: string,
    target: string,
    dataHash: string,
    nonce: bigint,
    expiry: bigint,
    chainId: number
) {
    return {
        domain: {
            name: 'Ward Pocket',
            version: '1',
            chainId,
            verifyingContract: pocket,
        },
        types: {
            Exec: [
                { name: 'pocket', type: 'address' },
                { name: 'target', type: 'address' },
                { name: 'dataHash', type: 'bytes32' },
                { name: 'nonce', type: 'uint256' },
                { name: 'expiry', type: 'uint256' },
            ],
        },
        value: { pocket, target, dataHash, nonce, expiry },
    };
}

export function getBurnTypedData(
    pocket: string,
    nonce: number,
    expiry: number,
    chainId: number
) {
    return {
        domain: {
            name: 'Ward Pocket',
            version: '1',
            chainId,
            verifyingContract: pocket,
        },
        types: {
            Burn: [
                { name: 'pocket', type: 'address' },
                { name: 'nonce', type: 'uint256' },
                { name: 'expiry', type: 'uint256' },
            ],
        },
        value: { pocket, nonce, expiry },
    };
}

export async function signExecIntent(
    signer: ethers.JsonRpcSigner,
    pocket: string,
    target: string,
    data: string,
    nonce: number | bigint,
    expiry: number | bigint,
    chainId: number
): Promise<string> {
    const dataHash = ethers.keccak256(data);
    const typedData = getExecTypedData(pocket, target, dataHash, BigInt(nonce as number), BigInt(expiry as number), chainId);
    return signer.signTypedData(typedData.domain, typedData.types, typedData.value);
}

export async function signBurnIntent(
    signer: ethers.JsonRpcSigner,
    pocket: string,
    nonce: number,
    expiry: number,
    chainId: number
): Promise<string> {
    const typedData = getBurnTypedData(pocket, nonce, expiry, chainId);
    return signer.signTypedData(typedData.domain, typedData.types, typedData.value);
}

export function encodeApprove(spender: string, amount: string): string {
    const iface = new ethers.Interface(['function approve(address spender, uint256 amount)']);
    return iface.encodeFunctionData('approve', [spender, amount]);
}

export function encodeTransfer(to: string, amount: string): string {
    const iface = new ethers.Interface(['function transfer(address to, uint256 amount)']);
    return iface.encodeFunctionData('transfer', [to, amount]);
}
