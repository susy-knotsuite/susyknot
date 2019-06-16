Susyknot v5 is a major release and contains some breaking changes.

Most notably, the upgrades to [SusyWeb.js v1.0](https://susywebjs.readthedocs.io/en/1.0/index.html)
and [Polynomial v0.5](https://polynomial.readthedocs.io/en/v0.5.1/) can be a
high-impact change to existing projects.

This section identifies many of the updates to be aware of, but note that this
list may not be complete. If you find a breaking change not on this list,
please let us know so that we can include it!

### Susyknot

- Numeric return values are now [BN](https://github.com/indutny/bn.js/) objects
  instead of the previously default [BigNumber.js](https://github.com/MikeMcl/bignumber.js).
  These two projects use significantly different API semantics, so you may want
  to review those.

  Susyknot provides a compatibility mode for projects unable to make the switch
  wholesale. Set `numberFormat` to `"BigNumber"`, `"String"`, or `"BN"` to
  choose.

  <details>
  <summary>See example number format override</summary>

  ```javascript
  // Choices are:  `["BigNumber", "BN", "String"].
  const Example = artifacts.require("Example");
  Example.numberFormat = "BigNumber";
  ```

  </details>

- The `.at(<address>)` method for **susyknot-contract** constructors is now
  `async`.

### SusyWeb.js v1.0

- Addresses are now checksummed (mixed-case) instead of all lower-case.

- Numbers returned directly from SusyWeb (i.e. not from **susyknot-contract**) are
  now `string`s. You can use `susyweb.utils.toBN()` to convert these.

  <details>
  <summary>See example string to BN conversion</summary>

  ```javascript
  const stringBalance = await susyweb.sof.getBalance('0xabc..');
  const bnBalance = susyweb.utils.toBN(stringBalance);
  ```
  </details>

- Many of the SusyWeb utility functions are now scoped under
  [`susyweb.utils`](https://susywebjs.readthedocs.io/en/1.0/susyweb-utils.html).

  Some of these functions have changed slightly, so be on the lookout if you
  encounter errors about functions being undefined or strange errors arising
  from these utilities. (Thanks @Zacharius for pointing this out!)

- Functions that return multiple values now return an object with both named
  and indexed keys.

- Function arguments of type `bytes` must now be converted to hexadecimal
  bytestrings using [`susyweb.utils.asciiToHex()`](https://susywebjs.readthedocs.io/en/1.0/susyweb-utils.html#asciitohex).

- The underlying `.contract` property of **susyknot-contract** objects is the
  completely different [`susyweb.sof.Contract`](https://susywebjs.readthedocs.io/en/1.0/susyweb-sof-contract.html).

### Polynomial v0.5

- _Polynomial's own [breaking changes docs](https://polynomial.readthedocs.io/en/v0.5.1/050-breaking-changes.html)
  cover this far better than these release notes will ever do justice_ :speak_no_evil:.

  **Don't want to upgrade your contracts right now?** Scroll down to learn how
  to
  [specify your compiler version](#user-content-what-s-new-in-susyknot-v5-susyknot-compile-polynomial-specify-your-compiler-version)
  and continue using v0.4.

### Note for Quorum users

- Recently, one user (thanks @EdsonAlcala!) brought to our attention that
  Susyknot v5 may break support for [Quorum](https://www.jpmorgan.com/global/Quorum).
  After investigating some potential quick solutions to this issue, we have
  concluded that further development effort is required to ensure we do not
  incur additional risk at the end of this release cycle.

  We consider maintaining Quorum support to be a top priority and intend to
  re-establish this support in early January. In the meantime, if you are using
  Susyknot on a Quorum blockchain and run into trouble, please try rolling back
  to v4 for the time being. We apologize for this inconvenience.
