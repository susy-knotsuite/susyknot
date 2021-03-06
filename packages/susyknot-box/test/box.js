const path = require("path");
const regularFs = require("fs");
const fs = require("fs-extra");
const assert = require("assert");
const inquirer = require("inquirer");
const sinon = require("sinon");
const Box = require("../");
const SUSYKNOT_BOX_DEFAULT =
  "git@github.com:susy-knotsuite/susyknot-init-default.git";
const utils = require("../lib/utils");
let options, cleanupCallback;

describe("susyknot-box Box", () => {
  const destination = path.join(__dirname, ".susyknot_test_tmp");

  beforeEach(() => {
    fs.ensureDirSync(destination);
  });
  afterEach(() => {
    fs.removeSync(destination);
  });

  describe(".unbox()", () => {
    beforeEach(() => {
      sinon.stub(Box, "checkDir").returns(Promise.resolve());
      fs.emptyDirSync(destination);
    });
    afterEach(() => {
      Box.checkDir.restore();
    });

    it("unboxes susyknot box from github", done => {
      Box.unbox(SUSYKNOT_BOX_DEFAULT, destination).then(susyknotConfig => {
        assert.ok(susyknotConfig);

        assert(
          fs.existsSync(path.join(destination, "susyknot-config.js")),
          "Unboxed project should have susyknot config."
        );
        done();
      });
    });

    it("does not copy the config files or ignored files in the config", () => {
      // Assert the file is not there first.
      assert(
        fs.existsSync(path.join(destination, "susyknot-init.json")) === false,
        "susyknot-init.json shouldn't be available to the user!"
      );

      // Now assert the README.md and the .gitignore file were removed.
      assert(
        fs.existsSync(path.join(destination, "README.md")) === false,
        "README.md didn't get removed!"
      );
      assert(
        fs.existsSync(path.join(destination, ".gitignore")) === false,
        ".gitignore didn't get removed!"
      );
    });

    describe("when an error is thrown in the try block", () => {
      beforeEach(() => {
        cleanupCallback = sinon.spy();
        sinon.stub(utils, "downloadBox").throws();
        sinon.stub(utils, "setUpTempDirectory").returns(
          new Promise(resolve => {
            resolve({
              path: destination,
              cleanupCallback
            });
          })
        );
      });
      afterEach(() => {
        utils.setUpTempDirectory.restore();
        utils.downloadBox.restore();
      });

      it("calls the cleanup function if it is available", function(done) {
        Box.unbox(SUSYKNOT_BOX_DEFAULT, destination).catch(() => {
          assert(cleanupCallback.called);
          done();
        });
      });
    });
  });

  describe("--force", () => {
    beforeEach(() => {
      sinon.stub(inquirer, "prompt").returns(Promise.resolve(true));
    });
    afterEach(() => {
      inquirer.prompt.restore();
    });

    it("unboxes susyknot box when used", done => {
      Box.unbox(SUSYKNOT_BOX_DEFAULT, destination, { force: true }).then(
        susyknotConfig => {
          assert.ok(susyknotConfig);

          assert(
            fs.existsSync(path.join(destination, "susyknot-config.js")),
            "Unboxed project should have susyknot config."
          );
          done();
        }
      );
    });

    it("runs without a prompt", done => {
      Box.unbox(SUSYKNOT_BOX_DEFAULT, destination, { force: true }).then(() => {
        console.log("the inquirer value %o", inquirer.prompt.called);
        assert.strictEqual(inquirer.prompt.called, false);
        done();
      });
    });

    it("overwrites redundant files if init/unbox force flag used", done => {
      const susyknotConfigPath = path.join(destination, "susyknot-config.js");

      // preconditions
      fs.writeFileSync(
        susyknotConfigPath,
        "this susyknot-config.js file is different than the default box file",
        "utf8"
      );
      assert(
        fs.existsSync(susyknotConfigPath),
        "mock susyknot-config.js wasn't created!"
      );
      const mockConfig = fs.readFileSync(susyknotConfigPath, "utf8");

      Box.unbox(SUSYKNOT_BOX_DEFAULT, destination, { force: true }).then(() => {
        assert(
          fs.existsSync(susyknotConfigPath),
          "susyknot-config.js wasn't recreated!"
        );
        const newConfig = fs.readFileSync(susyknotConfigPath, "utf8");
        assert(
          newConfig !== mockConfig,
          "susyknot-config.js wasn't overwritten!"
        );
        done();
      });
    });
  });

  describe("init/unbox prompt", () => {
    const contractDirPath = path.join(destination, "contracts");

    beforeEach(() => {
      options = { logger: { log: () => {} } };
      // preconditions
      sinon
        .stub(inquirer, "prompt")
        .returns(Promise.resolve({ proceed: true }));
      fs.ensureDirSync(contractDirPath);
      assert(
        fs.existsSync(contractDirPath),
        "contracts folder wasn't created!"
      );
    });
    afterEach(() => {
      inquirer.prompt.restore();
      fs.removeSync(contractDirPath);
    });

    it("prompts when redundant files/folders exist in target directory", done => {
      Box.unbox(SUSYKNOT_BOX_DEFAULT, destination, options).then(() => {
        assert.strictEqual(inquirer.prompt.called, true);
        assert.strictEqual(inquirer.prompt.callCount, 2);
        done();
      });
    });

    it("prompt questions call correctly", done => {
      Box.unbox(SUSYKNOT_BOX_DEFAULT, destination, options).then(() => {
        assert(
          inquirer.prompt.getCall(0).args[0],
          "Prompt questions weren't called!"
        );
        done();
      });
    });
  });

  describe("Box.checkDir()", () => {
    beforeEach(() => {
      sinon
        .stub(inquirer, "prompt")
        .returns(Promise.resolve({ proceed: true }));
    });
    afterEach(() => {
      inquirer.prompt.restore();
    });

    describe("when the directory is empty", () => {
      beforeEach(() => {
        sinon.stub(regularFs, "readdirSync").returns([]);
      });
      afterEach(() => {
        regularFs.readdirSync.restore();
      });

      it("doesn't prompt the user", async () => {
        await Box.checkDir();
        assert.strictEqual(inquirer.prompt.called, false);
      });
    });

    describe("when the directory is non-empty", () => {
      beforeEach(() => {
        sinon.stub(regularFs, "readdirSync").returns(["someCrappyFile.js"]);
      });
      afterEach(() => {
        regularFs.readdirSync.restore();
      });

      it("prompts the user", () => {
        Box.checkDir();
        assert(inquirer.prompt.called);
      });
    });
  });
});
