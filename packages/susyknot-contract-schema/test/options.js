var Schema = require("../index.js");
var assert = require("assert");

describe("options", function() {
  it("let's x- options through", function() {
    var options = {
      "x-from-dependency": "adder/Adder.pol"
    };

    options = Schema.normalize(options);
    assert.equal(options["x-from-dependency"], "adder/Adder.pol");
  });
});
