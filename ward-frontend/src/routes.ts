import { API_BASE_URL } from './config';

const B = API_BASE_URL;

export const API = {
  pocket: {
    create: `${B}/api/pocket/create`,
    get: (address: string) => `${B}/api/pocket/${address}`,
    assets: (address: string) => `${B}/api/pocket/${address}/assets`,
    nextNonce: (address: string) => `${B}/api/pocket/${address}/next-nonce`,
    exec: `${B}/api/pocket/exec`,
    burn: `${B}/api/pocket/burn`,
    sweep: `${B}/api/pocket/sweep`,
    simulate: `${B}/api/pocket/simulate`,
    gas: `${B}/api/pocket/gas`,
    fee: `${B}/api/pocket/fee`,
    listByUser: (user: string) => `${B}/api/pockets/${user}`,
    decodeCalldata: `${B}/api/calldata/decode`,
  },
  controller: {
    pocketInfo: (address: string) => `${B}/api/controller/pocket/${address}`,
  },
  verify: {
    execIntent: `${B}/api/verify/exec-intent`,
  },
  risk: {
    classify: `${B}/api/risk/classify`,
    simulate: `${B}/api/risk/simulate`,
  },
  token: {
    info: (address: string) => `${B}/api/token/${address}`,
  },
  meta: {
    history: (user: string) => `${B}/api/history/${user}`,
    metrics: `${B}/api/metrics`,
    health: `${B}/api/health`,
  },
};
