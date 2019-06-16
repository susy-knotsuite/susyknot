declare module "susybraid-core" {
  import { Provider as SusyWebProvider } from "susyweb/providers";

  namespace Susybraid {
    export interface IProviderOptions {
      account_keys_path?: string;
      accounts?: object[];
      allowUnlimitedContractSize?: boolean;
      blockTime?: number;
      db_path?: string;
      debug?: boolean;
      default_balance_sophy?: number;
      fork?: string | object;
      fork_block_number?: string | number;
      gasLimit?: number;
      gasPrice?: string;
      hardfork?: "byzantium" | "constantinople" | "petersburg";
      hd_path?: string;
      locked?: boolean;
      logger?: {
        log(msg: string): void;
      };
      mnemonic?: string;
      network_id?: number;
      networkId?: number;
      port?: number;
      seed?: any;
      time?: Date;
      total_accounts?: number;
      unlocked_accounts?: string[];
      verbose?: boolean;
      vmErrorsOnRPCResponse?: boolean;
      ws?: boolean;
    }

    export interface IServerOptions extends IProviderOptions {
      keepAliveTimeout?: number;
    }

    export function provider(opts?: IProviderOptions): Provider;
    export function server(opts?: IServerOptions): any;

    export interface Provider extends SusyWebProvider {
      close: (callback: Function) => void;
    }
  }
  export default Susybraid;
}
