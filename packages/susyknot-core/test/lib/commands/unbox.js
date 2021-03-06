const assert = require("assert");
const unbox = require("../../../lib/commands/unbox");
const Config = require("susyknot-config");
const sinon = require("sinon");
const temp = require("temp").track();
let tempDir, mockConfig;

describe("commands/unbox.js", () => {
  const invalidBoxFormats = [
    "//",
    "/susyknot-box/bare-box",
    "//susyknot-box/bare-box#susyknot-test-branch",
    "//susyknot-box/bare-box#susyknot-test-branch:path/SubDir",
    "/bare/",
    "//bare#susyknot-test-branch",
    "//bare#susyknot-test-branch:path/SubDir"
  ];
  const absolutePaths = [
    "https://github.com/susyknot-box/bare-box:/path/SubDir",
    "susyknot-box/bare-box:/path/subDir",
    "bare:/path/subDir",
    "git@github.com:susyknot-box/bare-box:/path/subDir"
  ];
  const validBoxInput = [
    "https://github.com/susyknot-box/bare-box",
    "susyknot-box/bare-box",
    "bare",
    "git@github.com:susyknot-box/bare-box",
    "https://github.com/susyknot-box/bare-box#master"
  ];
  const relativePaths = [
    "https://github.com/susyknot-box/bare-box:path/SubDir",
    "susyknot-box/bare-box:path/subDir",
    "bare:path/subDir",
    "git@github.com:susyknot-box/bare-box:path/subDir"
  ];

  describe("run", () => {
    beforeEach(() => {
      tempDir = temp.mkdirSync();
      mockConfig = {
        logger: { log: () => {} },
        working_directory: tempDir
      };
      sinon.stub(Config, "default").returns({ with: () => mockConfig });
    });
    afterEach(() => {
      Config.default.restore();
    });

    describe("Error handling", () => {
      it("throws when passed an invalid box format", () => {
        invalidBoxFormats.forEach(val => {
          assert.throws(
            () => {
              unbox.run({ _: [`${val}`] });
            },
            Error,
            "Error not thrown!"
          );
        });
      });

      it("throws when passed an absolute unbox path", () => {
        absolutePaths.forEach(path => {
          assert.throws(
            () => {
              unbox.run({ _: [`${path}`] });
            },
            Error,
            "Error not thrown!"
          );
        });
      });
    });

    describe("successful unboxes", () => {
      it("runs when passed valid box input", done => {
        let promises = [];
        validBoxInput.forEach(val => {
          promises.push(
            new Promise(resolve => {
              unbox.run({ _: [`${val}`], force: true }, () => resolve());
            })
          );
        });
        Promise.all(promises).then(() => done());
      });

      it("runs when passed a relative unbox path", done => {
        let promises = [];
        relativePaths.forEach(path => {
          promises.push(
            new Promise(resolve => {
              unbox.run({ _: [`${path}`], force: true }, () => resolve());
            })
          );
        });
        Promise.all(promises).then(() => done());
      });
    });
  });
});
