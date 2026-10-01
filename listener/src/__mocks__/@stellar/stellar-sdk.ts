/**
 * Manual mock for @stellar/stellar-sdk.
 * Used by Jest (via moduleNameMapper) when the real package is not installed.
 */

export const rpc = {
  Server: jest.fn().mockImplementation(() => ({
    getHealth: jest.fn().mockResolvedValue({ status: 'healthy' }),
    getEvents: jest.fn().mockResolvedValue({ events: [] }),
  })),
};

export const Contract = jest.fn().mockImplementation(() => ({
  call: jest.fn(),
}));

export const Keypair = {
  random: jest.fn().mockReturnValue({
    publicKey: jest.fn().mockReturnValue('GABC1234'),
    secret: jest.fn().mockReturnValue('SECRET'),
  }),
};

export const Account = jest.fn().mockImplementation((publicKey: string, sequence: string) => ({
  publicKey: () => publicKey,
  sequence,
}));

export const Networks = {
  TESTNET: 'Test SDF Network ; September 2015',
  MAINNET: 'Public Global Stellar Network ; September 2015',
};

export const BASE_FEE = '100';

export const ScValType = {
  scvVoid: () => 'scvVoid',
  scvU32: () => 'scvU32',
  scvI32: () => 'scvI32',
  scvU64: () => 'scvU64',
  scvI64: () => 'scvI64',
  scvTimepoint: () => 'scvTimepoint',
  scvDuration: () => 'scvDuration',
  scvU128: () => 'scvU128',
  scvI128: () => 'scvI128',
  scvU256: () => 'scvU256',
  scvI256: () => 'scvI256',
  scvBytes: () => 'scvBytes',
  scvString: () => 'scvString',
  scvSymbol: () => 'scvSymbol',
  scvVec: () => 'scvVec',
  scvMap: () => 'scvMap',
  scvAddress: () => 'scvAddress',
  scvBool: () => 'scvBool',
};

export const xdr = {
  ScValType,
  ScVal: {
    scvSymbol: (val: string) => ({
      switch: () => ScValType.scvSymbol(),
      sym: () => ({ toString: () => val }),
      toString: () => val,
    }),
    scvString: (val: string) => ({
      switch: () => ScValType.scvString(),
      str: () => ({ toString: () => val }),
      toString: () => val,
    }),
    scvU32: (val: number) => ({
      switch: () => ScValType.scvU32(),
      u32: () => val,
      toString: () => String(val),
    }),
    scvI32: (val: number) => ({
      switch: () => ScValType.scvI32(),
      i32: () => val,
      toString: () => String(val),
    }),
    scvU64: (val: number | string | bigint) => ({
      switch: () => ScValType.scvU64(),
      u64: () => val,
      toString: () => String(val),
    }),
    scvI64: (val: number | string | bigint) => ({
      switch: () => ScValType.scvI64(),
      i64: () => val,
      toString: () => String(val),
    }),
    scvAddress: (val: string) => ({
      switch: () => ScValType.scvAddress(),
      address: () => ({ toString: () => val }),
      toString: () => val,
    }),
    scvVoid: () => ({
      switch: () => ScValType.scvVoid(),
      toString: () => '',
    }),
    scvBool: (val: boolean) => ({
      switch: () => ScValType.scvBool(),
      b: () => val,
      toString: () => String(val),
    }),
  },
};

export const scValToNative = (val: any) => {
  if (!val) return null;
  if (typeof val.switch === 'function') {
    const sw = val.switch();
    if (sw === ScValType.scvSymbol()) return val.sym().toString();
    if (sw === ScValType.scvString()) return val.str().toString();
    if (sw === ScValType.scvU32()) return val.u32();
    if (sw === ScValType.scvU64()) return val.u64();
    if (sw === ScValType.scvI64()) return val.i64();
    if (sw === ScValType.scvBool()) return val.b();
  }
  return val;
};

export const TransactionBuilder = jest.fn().mockImplementation(() => ({
  addOperation: jest.fn().mockReturnThis(),
  setTimeout: jest.fn().mockReturnThis(),
  build: jest.fn().mockReturnValue({}),
}));

export default {
  rpc,
  Contract,
  Keypair,
  Account,
  Networks,
  xdr,
  scValToNative,
  BASE_FEE,
  TransactionBuilder,
};
