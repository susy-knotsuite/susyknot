import debugModule from "debug";
const debug = debugModule("test:data:calldata");

import { assert } from "chai";

import Susybraid from "susybraid-core";

import { prepareContracts, lineOf } from "../helpers";
import Debugger from "lib/debugger";

import * as SusyknotDecodeUtils from "susyknot-decode-utils";

import polynomial from "lib/polynomial/selectors";

const __CALLDATA = `
pragma polynomial ^0.5.4;
pragma experimental ABIEncoderV2;

contract CalldataTest {

  event Done();

  struct Pair {
    uint x;
    uint y;
  }

  function simpleTest(string calldata hello) external {
    emit Done(); //break simple
  }

  function staticTest(string calldata hello) external pure returns (string memory) {
    return hello; //break static
  }

  function staticTester() public {
    this.staticTest("hello world");
  }

  function delegateTester() public {
    CalldataLibrary.delegateTest("hello world");
  }

  function multiTest(
    string calldata hello,
    uint[] calldata someInts,
    Pair calldata pair)
  external {
    emit Done(); //break multi
  }

  function multiTester() public {
    uint[2] memory twoInts;
    uint[] memory someInts;
    someInts = new uint[](2);
    someInts[0] = 41;
    someInts[1] = 42;
    Pair memory pair;
    pair.x = 321;
    pair.y = 2049;
    this.multiTest("hello", someInts, pair);
  }

}

library CalldataLibrary {

  event Done();

  function delegateTest(string calldata hello) external {
    emit Done(); //break delegate
  }
}
`;

const __MIGRATION = `
var CalldataTest = artifacts.require("CalldataTest");
var CalldataLibrary = artifacts.require("CalldataLibrary");

module.exports = function(deployer) {
  deployer.deploy(CalldataLibrary);
  deployer.link(CalldataLibrary, CalldataTest);
  deployer.deploy(CalldataTest);
};
`;

let sources = {
  "CalldataTest.pol": __CALLDATA
};

let migrations = {
  "2_deploy_contracts.js": __MIGRATION
};

describe("Calldata Decoding", function() {
  var provider;

  var abstractions;
  var artifacts;
  var files;

  before("Create Provider", async function() {
    provider = Susybraid.provider({ seed: "debugger", gasLimit: 7000000 });
  });

  before("Prepare contracts and artifacts", async function() {
    this.timeout(30000);

    let prepared = await prepareContracts(provider, sources, migrations);
    abstractions = prepared.abstractions;
    artifacts = prepared.artifacts;
    files = prepared.files;
  });

  it("Decodes various types correctly", async function() {
    this.timeout(9000);
    let instance = await abstractions.CalldataTest.deployed();
    let receipt = await instance.multiTester();
    let txHash = receipt.tx;

    let bugger = await Debugger.forTx(txHash, {
      provider,
      files,
      contracts: artifacts
    });

    let session = bugger.connect();

    let sourceId = session.view(polynomial.current.source).id;
    let source = session.view(polynomial.current.source).source;
    await session.addBreakpoint({
      sourceId,
      line: lineOf("break multi", source)
    });

    await session.continueUntilBreakpoint();

    const variables = SusyknotDecodeUtils.Conversion.cleanBNs(
      await session.variables()
    );

    const expectedResult = {
      hello: "hello",
      someInts: [41, 42],
      pair: { x: 321, y: 2049 }
    };

    assert.deepInclude(variables, expectedResult);
  });

  it("Decodes correctly in the initial call", async function() {
    this.timeout(6000);
    let instance = await abstractions.CalldataTest.deployed();
    let receipt = await instance.simpleTest("hello world");
    let txHash = receipt.tx;

    let bugger = await Debugger.forTx(txHash, {
      provider,
      files,
      contracts: artifacts
    });

    let session = bugger.connect();

    let sourceId = session.view(polynomial.current.source).id;
    let source = session.view(polynomial.current.source).source;
    await session.addBreakpoint({
      sourceId,
      line: lineOf("break simple", source)
    });

    await session.continueUntilBreakpoint();

    const variables = await session.variables();

    const expectedResult = {
      hello: "hello world"
    };

    assert.include(variables, expectedResult);
  });

  it("Decodes correctly in a pure call", async function() {
    this.timeout(6000);
    let instance = await abstractions.CalldataTest.deployed();
    let receipt = await instance.staticTester();
    let txHash = receipt.tx;

    let bugger = await Debugger.forTx(txHash, {
      provider,
      files,
      contracts: artifacts
    });

    let session = bugger.connect();

    let sourceId = session.view(polynomial.current.source).id;
    let source = session.view(polynomial.current.source).source;
    await session.addBreakpoint({
      sourceId,
      line: lineOf("break static", source)
    });

    await session.continueUntilBreakpoint();

    const variables = await session.variables();

    const expectedResult = {
      hello: "hello world"
    };

    assert.include(variables, expectedResult);
  });

  it("Decodes correctly in a library call", async function() {
    this.timeout(6000);
    let instance = await abstractions.CalldataTest.deployed();
    let receipt = await instance.delegateTester();
    let txHash = receipt.tx;

    let bugger = await Debugger.forTx(txHash, {
      provider,
      files,
      contracts: artifacts
    });

    let session = bugger.connect();

    let sourceId = session.view(polynomial.current.source).id;
    let source = session.view(polynomial.current.source).source;
    await session.addBreakpoint({
      sourceId,
      line: lineOf("break delegate", source)
    });

    await session.continueUntilBreakpoint();

    const variables = await session.variables();

    const expectedResult = {
      hello: "hello world"
    };

    assert.include(variables, expectedResult);
  });
});
