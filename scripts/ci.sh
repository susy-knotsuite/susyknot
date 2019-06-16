#!/usr/bin/env bash

# Exit script as soon as a command fails.
set -o errexit

run_graviton() {
  docker run \
    -v /$PWD/scripts:/scripts \
    -d \
    -p 8545:8545 \
    -p 8546:8546 \
    -p 30303:30303 \
    sophon/client-go:latest \
    --rpc \
    --rpcaddr '0.0.0.0' \
    --rpcport 8545 \
    --rpccorsdomain '*' \
    --ws \
    --wsaddr '0.0.0.0' \
    --wsorigins '*' \
    --nodiscover \
    --dev \
    --dev.period 0 \
    --allow-insecure-unlock \
    --targetgaslimit '7000000' \
    js ./scripts/graviton-accounts.js \
    > /dev/null &
}

if [ "$INTEGRATION" = true ]; then

  sudo apt-get install -y jq
  lerna run --scope susyknot test --stream

elif [ "$GRAVITON" = true ]; then

  sudo apt-get install -y jq
  docker pull sophon/client-go:latest
  run_graviton
  lerna run --scope susyknot test --stream -- --exit
  lerna run --scope susyknot-contract test --stream -- --exit

elif [ "$PACKAGES" = true ]; then

  docker pull sophon/polc:0.4.22
  sudo apt-get install -y snapd polc
  export PATH=$PATH:/snap/bin
  sudo snap install vyper --beta --dsvmode
  lerna run --scope susyknot-* test --stream --concurrency=1

elif [ "$COVERAGE" = true ]; then

  docker pull sophon/polc:0.4.22
  sudo apt-get install -y jq snapd polc
  export PATH=$PATH:/snap/bin
  sudo snap install vyper --beta --dsvmode
  cd packages/susyknot-debugger && yarn test:coverage && \
  cd ../../ && nyc lerna run --ignore susyknot-debugger test && \
  cat ./packages/susyknot-debugger/coverage/lcov.info >> ./coverage/lcov.info && \
  cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js

fi
