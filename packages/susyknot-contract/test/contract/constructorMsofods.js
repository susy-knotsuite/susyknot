const SusyknotContract = require("../../");
const assert = require("assert");
const Susybraid = require("susybraid-core");

describe("SusyknotContract", () => {
  it("can be used to return an empty SusyknotContract class object", () => {
    const emptySusyknotContract = SusyknotContract();
    assert(emptySusyknotContract.name === "SusyknotContract");
  });
});

describe("SusyknotContract.new()", () => {
  it("throws if called before setting a provider", () => {
    const freshSusyknotContract = SusyknotContract();
    assert.throws(() => {
      freshSusyknotContract.new();
    }, "should have thrown!");
  });

  it("throws if called on a contract instance with empty bytecode", () => {
    const provider = Susybraid.provider();
    const freshSusyknotContract = SusyknotContract();
    freshSusyknotContract.setProvider(provider);
    assert.throws(() => {
      freshSusyknotContract.new();
    }, "should have thrown!");
  });
});

describe("SusyknotContract.at()", () => {
  it("throws if passed an invalid address", () => {
    const freshSusyknotContract = SusyknotContract();
    assert.rejects(
      async () => {
        await freshSusyknotContract.at();
      },
      {
        name: "Error",
        message: /(Invalid address passed)/
      },
      "should have thrown!"
    );

    assert.rejects(
      async () => {
        await freshSusyknotContract.at(12345);
      },
      {
        name: "Error",
        message: /(Invalid address passed)/
      },
      "should have thrown!"
    );

    assert.rejects(
      async () => {
        await freshSusyknotContract.at("0x000323332");
      },
      {
        name: "Error",
        message: /(Invalid address passed)/
      },
      "should have thrown!"
    );
  });
});

describe("SusyknotContract.deployed()", () => {
  it("throws if called before setting a provider", () => {
    const freshSusyknotContract = SusyknotContract();
    assert.rejects(
      async () => {
        await freshSusyknotContract.deployed();
      },
      {
        name: "Error",
        message: /(Please call setProvider\(\) first)/
      },
      "should have thrown!"
    );
  });

  it("throws if network & network record exists, but contract not deployed onchain", async () => {
    const provider = Susybraid.provider();
    const freshSusyknotContract = SusyknotContract();
    freshSusyknotContract.setProvider(provider);
    await freshSusyknotContract.detectNetwork();
    freshSusyknotContract.networks[freshSusyknotContract.network_id] =
      "fakeNetworkRecord";
    assert.rejects(
      async () => {
        await freshSusyknotContract.deployed();
      },
      {
        name: "Error",
        message: /(Contract).*(not).*(deployed to detected network)/
      },
      "should have thrown!"
    );
  });
});

describe("SusyknotContract.defaults()", () => {
  it("sets instance class_defaults when not already set", () => {
    const freshSusyknotContract = SusyknotContract();
    freshSusyknotContract.class_defaults = undefined;
    assert.deepStrictEqual(freshSusyknotContract.defaults(), {});
  });
});

describe("SusyknotContract.isDeployed()", () => {
  it("returns false when instance network_id not set", () => {
    const freshSusyknotContract = SusyknotContract();
    assert.strictEqual(freshSusyknotContract.isDeployed(), false);
  });
});

describe("SusyknotContract.detectNetwork()", () => {
  it("throws when provider not present", () => {
    const freshSusyknotContract = SusyknotContract();
    assert.rejects(
      async () => await freshSusyknotContract.detectNetwork(),
      {
        name: "Error",
        message: /(Provider not set or invalid)/
      },
      "should have thrown!"
    );
  });
});

describe("SusyknotContract.detectNetwork()", () => {
  it("throws when network not set and provider not present", () => {
    const freshSusyknotContract = SusyknotContract();
    assert.rejects(
      async () => await freshSusyknotContract.detectNetwork(),
      {
        name: "Error",
        message: /(Provider not set or invalid)/
      },
      "should have thrown!"
    );
  });

  it("throws when network set and provider not present", async () => {
    const freshSusyknotContract = SusyknotContract();
    freshSusyknotContract.network_id = 1234;
    freshSusyknotContract.networks[freshSusyknotContract.network_id] =
      "dummyNetwork";
    assert.rejects(
      async () => await freshSusyknotContract.detectNetwork(),
      {
        name: "Error",
        message: /(Provider not set or invalid)/
      },
      "should have thrown!"
    );
  });
});

describe("SusyknotContract.setNetwork()", () => {
  it("returns w/o setting network_id when passed falsy network_id", () => {
    const freshSusyknotContract = SusyknotContract();
    assert.strictEqual(freshSusyknotContract.network_id, undefined);
    freshSusyknotContract.setNetwork(null);
    assert.strictEqual(freshSusyknotContract.network_id, undefined);
  });
});

describe("SusyknotContract.setNetworkType()", () => {
  it("sets network_type on SusyWebShim", () => {
    const freshSusyknotContract = SusyknotContract();
    // default SusyWebShim networkType
    assert.strictEqual(freshSusyknotContract.susyweb.networkType, "sophon");
    freshSusyknotContract.setNetworkType("quorum");
    assert.strictEqual(freshSusyknotContract.susyweb.networkType, "quorum");
  });
});

describe("SusyknotContract.setWallet()", () => {
  it("sets wallet on SusyWebShim", () => {
    const freshSusyknotContract = SusyknotContract();
    const mockWalletObj = {};
    assert(freshSusyknotContract.susyweb.sof.accounts.wallet);
    freshSusyknotContract.setWallet(mockWalletObj);
    assert.deepStrictEqual(
      freshSusyknotContract.susyweb.sof.accounts.wallet,
      mockWalletObj
    );
  });
});

describe("SusyknotContract.resetAddress()", () => {
  it("resets deployed contract instance address on current network to undefined", () => {
    const freshSusyknotContract = SusyknotContract();
    freshSusyknotContract.network_id = 1234;
    freshSusyknotContract.networks[freshSusyknotContract.network_id] = {
      address: "0x1234"
    };
    assert.strictEqual(freshSusyknotContract.network.address, "0x1234");
    freshSusyknotContract.resetAddress();
    assert.strictEqual(freshSusyknotContract.network.address, undefined);
  });
});

describe("SusyknotContract.link()", () => {
  it("throws if passed an undeployed instance", () => {
    const freshSusyknotContract = SusyknotContract();
    const mockSusyknotContract = SusyknotContract();
    assert.throws(() => {
      freshSusyknotContract.link(mockSusyknotContract),
        {
          name: "Error",
          message: /Cannot link contract without an address/
        },
        "should have thrown!";
    });
  });

  it("links an object collection of library contracts", () => {
    const freshSusyknotContract = SusyknotContract();
    freshSusyknotContract.network_id = 1234;
    freshSusyknotContract.networks[freshSusyknotContract.network_id] = {
      address: "0x1234"
    };
    const mockLibraryObj = { Library1: "0x4321", Library2: "0x4567" };
    freshSusyknotContract.link(mockLibraryObj);
    assert.deepStrictEqual(freshSusyknotContract.links, mockLibraryObj);
  });
});

describe("SusyknotContract.clone()", () => {
  it("when passed a non-object, clones an instance and uses passed value as the network_id", () => {
    const freshSusyknotContract = SusyknotContract();
    const newNetworkID = "1234";
    const clonedSusyknotContract = freshSusyknotContract.clone(newNetworkID);
    assert.strictEqual(clonedSusyknotContract.network_id, newNetworkID);
  });
});
