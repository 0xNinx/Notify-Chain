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

/**
 * Minimal ScVal stand-in. `switch()` returns the same discriminator that the
 * `ScValType` members produce, so `switch (val.switch())` in production code
 * resolves correctly under this mock.
 */
class MockScVal {
  private readonly kind: string;
  private readonly value: unknown;

  constructor(kind: string, value: unknown) {
    this.kind = kind;
    this.value = value;
  }

  switch(): string {
    return this.kind;
  }

  sym(): unknown {
    return this.value;
  }

  str(): unknown {
    return this.value;
  }

  u64(): unknown {
    return this.value;
  }

  i64(): unknown {
    return this.value;
  }

  toString(): string {
    return String(this.value);
  }
}

const scValKind = (kind: string) => (): string => kind;

export const ScValType = {
  scvBool: scValKind('scvBool'),
  scvVoid: scValKind('scvVoid'),
  scvU32: scValKind('scvU32'),
  scvI32: scValKind('scvI32'),
  scvU64: scValKind('scvU64'),
  scvI64: scValKind('scvI64'),
  scvTime: scValKind('scvTime'),
  scvString: scValKind('scvString'),
  scvSymbol: scValKind('scvSymbol'),
  scvAddress: scValKind('scvAddress'),
};

export const ScVal = {
  scvBool: (value: boolean) => new MockScVal('scvBool', value),
  scvVoid: () => new MockScVal('scvVoid', undefined),
  scvU32: (value: number) => new MockScVal('scvU32', value),
  scvI32: (value: number) => new MockScVal('scvI32', value),
  scvU64: (value: number) => new MockScVal('scvU64', value),
  scvI64: (value: number) => new MockScVal('scvI64', value),
  scvTime: (value: Date) => new MockScVal('scvTime', value),
  scvString: (value: string) => new MockScVal('scvString', value),
  scvSymbol: (value: string) => new MockScVal('scvSymbol', value),
  scvAddress: (value: string) => new MockScVal('scvAddress', value),
};

export const xdr = {
  ScVal,
  ScValType,
};

export default {
  rpc,
  Contract,
  Keypair,
  Account,
  Networks,
  xdr,
};
