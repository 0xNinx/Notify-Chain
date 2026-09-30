/**
 * Manual mock for @stellar/stellar-sdk.
 * Used by Jest (via moduleNameMapper) because the real package is not a
 * dependency of this package.
 *
 * The mock previously exposed `rpc`, `Contract`, `Keypair`, `Account` and
 * `Networks` only. Production code and tests also construct and inspect
 * `xdr.ScVal` values (topic entries, event values) and call `scValToNative`, so
 * without an `xdr` export every suite that builds an event threw
 * `Cannot read properties of undefined (reading 'ScVal')` before running.
 *
 * Fidelity note: instead of the real XDR enum objects, a ScVal's `switch()`
 * returns a plain tag string, and `ScValType.scvX()` returns the same string, so
 * the `switch (val.switch()) case xdr.ScValType.scvX():` dispatch used
 * throughout this codebase compares equal. This is a test double: it models the
 * dispatch contract, not the binary encoding.
 */

/**
 * The ScVal variants this codebase dispatches on.
 */
const SC_VAL_KINDS = [
  'scvSymbol',
  'scvString',
  'scvU32',
  'scvI32',
  'scvU64',
  'scvI64',
  'scvVoid',
  'scvAddress',
] as const;

type ScValKind = (typeof SC_VAL_KINDS)[number];

/** Anything with a `toString()`; mirrors the XDR string/int wrappers. */
interface Stringable {
  toString(): string;
}

interface ScValMock {
  switch(): ScValKind;
  sym(): Stringable;
  str(): Stringable;
  u32(): number;
  i32(): number;
  u64(): Stringable;
  i64(): Stringable;
  address(): Stringable;
  toXDR(format?: string): string;
  toString(): string;
}

function stringable(value: string): Stringable {
  return { toString: () => value };
}

/**
 * Builds a ScVal double for `kind` carrying `value`.
 *
 * Every accessor is present so a caller that reaches for the "wrong" one (as
 * the real SDK would allow within a union) still gets a usable value instead of
 * a TypeError.
 */
function scVal(kind: ScValKind, value: string | number = ''): ScValMock {
  const text = String(value);
  return {
    switch: () => kind,
    sym: () => stringable(text),
    str: () => stringable(text),
    u32: () => Number(value),
    i32: () => Number(value),
    u64: () => stringable(text),
    i64: () => stringable(text),
    address: () => stringable(text),
    toXDR: (format?: string) =>
      format === 'base64'
        ? Buffer.from(text, 'utf8').toString('base64')
        : text,
    toString: () => text,
  };
}

const ScVal = {
  scvSymbol: (value: string) => scVal('scvSymbol', value),
  scvString: (value: string) => scVal('scvString', value),
  scvU32: (value: number) => scVal('scvU32', value),
  scvI32: (value: number) => scVal('scvI32', value),
  scvU64: (value: unknown = 0n) => scVal('scvU64', String(value)),
  scvI64: (value: unknown = 0n) => scVal('scvI64', String(value)),
  scvVoid: () => scVal('scvVoid'),
  scvAddress: (value: string) => scVal('scvAddress', value),
  fromXDR: (value: unknown) => value,
};

/**
 * Tag factories matching {@link ScValMock.switch}.
 *
 * Deliberately plain strings so `val.switch() === ScValType.scvSymbol()` holds,
 * which is how the codebase dispatches on a value's type.
 */
export const ScValType = SC_VAL_KINDS.reduce(
  (acc, kind) => {
    acc[kind] = () => kind;
    return acc;
  },
  {} as Record<ScValKind, () => ScValKind>
);

/** Minimal 64-bit unsigned integer wrapper. */
export class Uint64 {
  private readonly value: bigint;

  constructor(value: bigint | number | string) {
    this.value = BigInt(value);
  }

  toString(): string {
    return this.value.toString();
  }

  toBigInt(): bigint {
    return this.value;
  }
}

export const xdr = { ScVal, ScValType, Uint64 };

/**
 * Reduces a ScVal to a plain JS value.
 *
 * Handles both this mock's ScVals and the ad-hoc doubles used in tests (whose
 * `switch()` returns an object, e.g. `{ name: 'scvVoid' }`). Unknown shapes
 * resolve to `null` rather than throwing, so callers can format a value instead
 * of falling into their error path.
 */
export function scValToNative(val: unknown): unknown {
  const target = val as { switch?: () => unknown } | null | undefined;
  const tag = typeof target?.switch === 'function' ? target.switch() : undefined;
  const name = typeof tag === 'string' ? tag : (tag as { name?: string } | undefined)?.name;

  const accessors = val as Partial<Record<string, () => unknown>> | null | undefined;
  const read = (key: string): string | null => {
    const accessor = accessors?.[key];
    if (typeof accessor !== 'function') return null;
    const value = accessor();
    return value === undefined || value === null ? null : String(value);
  };

  switch (name) {
    case 'scvSymbol':
      return read('sym') ?? read('str');
    case 'scvString':
      return read('str') ?? read('sym');
    case 'scvU32':
      return Number(read('u32'));
    case 'scvI32':
      return Number(read('i32'));
    case 'scvU64':
      return read('u64');
    case 'scvI64':
      return read('i64');
    default:
      return null;
  }
}

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

export const TransactionBuilder = jest.fn().mockImplementation(() => ({
  addOperation: jest.fn().mockReturnThis(),
  setTimeout: jest.fn().mockReturnThis(),
  build: jest.fn().mockReturnValue({ toXDR: jest.fn() }),
}));

export default {
  rpc,
  Contract,
  Keypair,
  Account,
  Networks,
  BASE_FEE,
  TransactionBuilder,
  xdr,
  scValToNative,
};
