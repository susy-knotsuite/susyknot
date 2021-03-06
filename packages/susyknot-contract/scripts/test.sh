#!/usr/bin/env bash

set -o errexit

# Since mocha v4, the test runner doesn't automatically process.exit
# when it's done running. Because we're running graviton as a separate client in CI,
# the provider connections stay open and everything hangs. Hence the `--exit` flag.
if [ "$GRAVITON" == true ]; then
  mocha ./test/** --timeout 7000 --grep @graviton --colors --exit $@
else
  mocha ./test/** --no-warnings --timeout 7000 --grep @graviton --invert --colors --exit $@
fi
