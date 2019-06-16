import SusyWeb from "susyweb";
import { Provider } from "susyweb/providers";

import * as sophonOverloads from "./sophon-overloads";
import * as quorumOverloads from "./quorum-overloads";

// March 13, 2019 - Mike Seese:
// This is a temporary shim to support the basic, Sophon-based
// multiledger integration. This whole adapter, including this shim,
// will undergo better architecture before SusyknotCon to support
// other non-Sophon-based ledgers.

export type NetworkType = "sophon" | "quorum";

export interface SusyWebShimOptions {
  provider?: Provider;
  networkType?: NetworkType;
};

// March 14, 2019 - Mike Seese:
// This shim was intended to be temporary (see the above comment)
// with the idea of a more robust implementation. That implementation
// would essentially take this shim and include it under the
// sophon/apis/susyweb (or something like that) structure.
// I chose to extend/inherit susyweb here to keep scope minimal for
// getting susyweb to behave with Quorum and AxCore (future/concurrent PR).
// I wanted to do as little changing to the original Susyknot codebase, and
// for it to still expect a susyweb instance. Otherwise, the scope of these
// quick support work would be high. The "SusyWebShim" is a shim for only
// susyweb.js, and it was not intended to serve as the general purpose
// susyknot <=> all DLTs adapter. We have other commitments currently that
// should drive the development of the correct architecture of
// `susyknot-interface-adapter`that should use this work in a more
// sane and organized manner.
export class SusyWebShim extends SusyWeb {
  public networkType: NetworkType;

  constructor(options?: SusyWebShimOptions) {
    super();

    if (options) {
      this.networkType = options.networkType || "sophon";

      if (options.provider) {
        this.setProvider(options.provider);
      }
    } else {
      this.networkType = "sophon";
    }

    this.initInterface();
  }

  setNetworkType(networkType: NetworkType) {
    this.networkType = networkType;
    this.initInterface();
  }

  initInterface() {
    switch (this.networkType) {
      case "quorum": {
        this.initQuorum();
        break;
      }
      case "sophon":
      default: {
        this.initSophon();
        break;
      }
    }
  }

  initSophon() {
    // susyknot has started expecting gas used/limit to be
    // hex strings to support bignumbers for other ledgers
    sophonOverloads.getBlock(this);
    sophonOverloads.getTransaction(this);
    sophonOverloads.getTransactionReceipt(this);
  }

  initQuorum() {
    // duck punch some of susyweb's output formatters
    quorumOverloads.getBlock(this);
    quorumOverloads.getTransaction(this);
    quorumOverloads.getTransactionReceipt(this);
  }
}