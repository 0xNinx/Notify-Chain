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

const SCV_VOID = 'scvVoid';
const SCV_U64 = 'scvU64';
const SCV_I64 = 'scvI64';
const SCV_STRING = 'scvString';
const SCV_SYMBOL = 'scvSymbol';
const SCV_ADDRESS = 'scvAddress';

export const xdr = {
  ScValType: {
    scvVoid: () => SCV_VOID,
    scvU64: () => SCV_U64,
    scvI64: () => SCV_I64,
    scvString: () => SCV_STRING,
    scvSymbol: () => SCV_SYMBOL,
    scvAddress: () => SCV_ADDRESS,
  },
  ScVal: {
    scvSymbol: (val: string) => ({
      switch: () => SCV_SYMBOL,
      sym: () => ({ toString: () => val }),
    }),
    scvString: (val: string) => ({
      switch: () => SCV_STRING,
      str: () => ({ toString: () => val }),
    }),
    scvVoid: () => ({
      switch: () => SCV_VOID,
    }),
    scvU64: (val: any) => ({
      switch: () => SCV_U64,
      u64: () => val,
    }),
    scvI64: (val: any) => ({
      switch: () => SCV_I64,
      i64: () => val,
    }),
    scvAddress: (val: string) => ({
      switch: () => SCV_ADDRESS,
      address: () => ({ toString: () => val }),
    }),
  },
};

export default {
  rpc,
  Contract,
  Keypair,
  Account,
  Networks,
  xdr,
};
