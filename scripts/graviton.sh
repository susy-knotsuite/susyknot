#!/usr/bin/env bash

docker pull sophon/client-go:latest

docker run \
    -v /$PWD/scripts:/scripts \
    -i \
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
    js ./scripts/graviton-accounts.js
