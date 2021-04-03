#!/usr/bin/env sh

echo 'Building polkadot docker image'
docker build -f polkadot.Dockerfile . --tag=polkadot

echo 'Building cumulus docker image'
docker build -f cumulus.Dockerfile . --tag=cumulus

echo 'Building adder collator docker image'
docker build -f adder-collator.Dockerfile . --tag=adder-collator
