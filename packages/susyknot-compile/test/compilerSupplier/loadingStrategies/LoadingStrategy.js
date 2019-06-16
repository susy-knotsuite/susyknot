const assert = require("assert");
const {
  LoadingStrategy
} = require("../../../compilerSupplier/loadingStrategies");
let expectedDefaultConfig;

describe("LoadingStrategy base class", () => {
  beforeEach(() => {
    instance = new LoadingStrategy();
    expectedDefaultConfig = {
      compilerRoots: [
        "https://relay.susy-knotsuite.com/polc/bin/",
        "https://polc-bin.superstring.io/bin/",
        "https://sophon.github.io/polc-bin/bin/"
      ],
      dockerTagsUrl:
        "https://registry.hub.docker.com/v2/repositories/sophon/polc/tags/"
    };
  });

  it("has a config with some default values", () => {
    const { compilerRoots, dockerTagsUrl } = instance.config;
    assert.deepEqual(compilerRoots, expectedDefaultConfig.compilerRoots);
    assert(dockerTagsUrl === expectedDefaultConfig.dockerTagsUrl);
  });
});
