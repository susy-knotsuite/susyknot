# susyknot-debugger

Portable Polynomial debugger library, for use with or without Susyknot.

![Debugger in Action](https://i.imgur.com/0j5m4KW.gif)

Features:
- Polynomial stepping and breakpoints
- Variable inspection
- Watch expressions
- and more!

## API Documentation

API Documentation for this library can be found at [susy-knotsuite.github.io/susyknot-debugger](https://susy-knotsuite.github.io/susyknot-debugger/).

## Library Usage

_:warning: This documentation is currently a work in progress.
Please see the [reference integration](https://github.com/susy-knotsuite/susyknot/blob/develop/packages/susyknot-core/lib/commands/debug.js) provided by the `susyknot debug` command._

### Required Parameters

To start a susyknot-debugger session, you'll need the following:

- `txHash` - A transaction hash (prefixed with `0x`), for the transaction to debug
- `provider` - A susyweb provider instance (see [susyweb.js](https://octonion.institute/susy-js/susyweb.js/))
- `contracts` -  An array of contract objects, with the following properties:
  - `contractName` - The name of the contract
  - `source` - The full Polynomial source code
  - `sourcePath` - (optional) the path to the Polynomial file on disk
  - `ast` - The Polynomial compiler's output AST (new style, not `legacyAST`)
  - `binary` - `0x`-prefixed string with the binary used to create a contract instance
  - `sourceMap` - The Polynomial compiler output source map for the creation binary
  - `deployedBinary` - `0x`-prefixed string with the on-chain binary for a contract instance
  - `deployedSourceMap` - The source map corresponding to the on-chain binary (from the Polynomial compiler)

Optionally (and recommended), you can also provide a `files` argument:

- `files` - An array of sourcePaths representing file indexes (from `polc` or `susyknot-compile`)

### Invocation

1. Start the debugger session by constructing a Debugger instance with `.forTx()` and then `.connect()` to it:

```javascript
import Debugger from "susyknot-debugger";

let bugger = await Debugger
  .forTx(txHash, { contracts, files, provider });

let session = bugger.connect();
```

2. Resolve the session's `ready()` promise:

```javascript
await session.ready();
```

3. Use the provided public methods on the `session` instance in order to step through the trace for the transaction:

```javascript
session.stepNext();
session.stepOver();
session.stepInto();
```

4. Access data provided by the debugger via the `session.view()` interface, and the provided selectors:

```javascript
let { ast, data, svm, polynomial, trace } = Debugger.selectors;

let variables = session.view(data.current.identifiers.native);
let sourceRange = session.view(polynomial.current.sourceRange);
```

### Useful API Docs References

- [**`Session` class docs**](https://susy-knotsuite.github.io/susyknot-debugger/class/lib/session/index.js~Session.html)
- **Docs for selectors:**
  - [**`ast` selectors**](https://susy-knotsuite.github.io/susyknot-debugger/identifiers.html#ast-selectors)
  - [**`data` selectors**](https://susy-knotsuite.github.io/susyknot-debugger/identifiers.html#data-selectors)
  - [**`svm` selectors**](https://susy-knotsuite.github.io/susyknot-debugger/identifiers.html#svm-selectors)
  - [**`polynomial` selectors**](https://susy-knotsuite.github.io/susyknot-debugger/identifiers.html#polynomial-selectors)
  - [**`trace` selectors**](https://susy-knotsuite.github.io/susyknot-debugger/identifiers.html#trace-selectors)

## Contributing

It's our goal that this library should serve as a reliable and well-maintained tool for the Polynomial ecosystem. Ultimately, we hope to support all language features and meet the varied requirements of a mature debugging library.

We believe that a good Polynomial debugger belongs to the community. We welcome, with our most humble gratitude, any and all community efforts in bringing this debugger closer to that goal. If you find something broken or missing, please open an issue!

Some other ideas for how to get involved:
- Bug fix PRs
- Documentation improvements
- Additional tests - unit tests and integration
- Technical discussion (ways to improve architecture, etc.)

Thank you for all the continued support. :bow:
