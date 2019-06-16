#!/usr/bin/env bash

set -o errexit

if [ "$GRAVITON" == true ]; then
  mocha --timeout 50000 --grep '@susybraid|@standalone' --invert --colors $@
elif [ "$COVERAGE" == true ]; then
  NO_BUILD=true mocha --no-warnings --timeout 7000 --grep @graviton --invert --colors $@
elif [ "$INTEGRATION" == true ]; then
  mocha --no-warnings --timeout 7000 --grep @graviton --invert --colors $@
else
  yarn build-cli && mocha --no-warnings --timeout 7000 --grep @graviton --invert --colors $@
fi
