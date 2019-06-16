import debugModule from "debug";
const debug = debugModule("test:precompiles"); // eslint-disable-line no-unused-vars

import { assert } from "chai";

import Susybraid from "susybraid-core";

import { prepareContracts } from "./helpers";
import Debugger from "lib/debugger";

import svm from "lib/svm/selectors";
import trace from "lib/trace/selectors";
import polynomial from "lib/polynomial/selectors";

const __PRECOMPILE = `
pragma polynomial ~0.5;

contract HasPrecompile {
  event Called();

  function run() public {
    sha256("hello world");

    emit Called();
  }
}
`;

let sources = {
  "HasPrecompile.pol": __PRECOMPILE
};

const TEST_CASES = [
  {
    name: "trace.step",
    selector: trace.step
  },
  {
    name: "svm.current.context",
    selector: svm.current.context
  },
  {
    name: "polynomial.current.sourceRange",
    selector: polynomial.current.sourceRange
  }
];

describe("Precompiled Contracts", () => {
  let provider;

  let abstractions;
  let artifacts;
  let files;

  // object where key is selector name, value is list of results at step
  let results = {};

  before("Create Provider", async function() {
    provider = Susybraid.provider({ seed: "debugger", gasLimit: 7000000 });
  });

  before("Prepare contracts and artifacts", async function() {
    this.timeout(30000);

    let prepared = await prepareContracts(provider, sources);
    abstractions = prepared.abstractions;
    artifacts = prepared.artifacts;
    files = prepared.files;
  });

  before("Initialize results", () => {
    // initialize results as mapping of selector to step results list
    for (let { name } of TEST_CASES) {
      results[name] = [];
    }
  });

  before("Step through debugger", async function() {
    let instance = await abstractions.HasPrecompile.deployed();
    let receipt = await instance.run();
    let txHash = receipt.tx;

    let bugger = await Debugger.forTx(txHash, {
      provider,
      files,
      contracts: artifacts
    });

    let session = bugger.connect();
    var finished; // is the trace finished?

    do {
      for (let { name, selector } of TEST_CASES) {
        let stepResult;

        try {
          stepResult = { value: session.view(selector) };
        } catch (e) {
          stepResult = { error: e };
        }

        results[name].push(stepResult);
      }

      await session.advance();
      finished = session.view(trace.finished);
    } while (!finished);
  });

  before("remove final step results", () => {
    // since these include one step past end of trace
    for (let { name } of TEST_CASES) {
      results[name].pop();
    }
  });

  it("never fails to know the trace step", async () => {
    // remove last item (known to be undefined)
    const result = results["trace.step"];

    for (let step of result) {
      if (step.error) {
        throw step.error;
      }

      assert.isOk(step.value);
    }
  });

  it("never fails to know SVM context", async () => {
    const result = results["svm.current.context"];

    for (let step of result) {
      if (step.error) {
        throw step.error;
      }

      assert.isOk(step.value);
      assert.property(step.value, "context");
    }
  });

  it("never throws an exception for missing source range", async () => {
    const result = results["polynomial.current.sourceRange"];

    for (let step of result) {
      if (step.error) {
        throw step.error;
      }

      assert.isOk(step.value);
    }
  });
});
